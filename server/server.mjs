// Server Kalmer: melayani situs publik (dist/), panel admin (/admin), dan API (/api).
//   npm start
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { config } from './config.mjs';
import { docs, mediaDb, log, recentActivity, loadContent, db } from './db.mjs';
import { singletons, collections, hasSlug } from './schema.mjs';
import { validate, slugify } from './validate.mjs';
import { login, logout, sessionUser, loginBlocked, users, verifyPassword } from './auth.mjs';
import { saveUpload, deleteMedia, findUsage } from './media.mjs';
import { publish, status } from './publish.mjs';

const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8', '.webmanifest': 'application/manifest+json', '.json': 'application/json', '.ico': 'image/x-icon' };
const COOKIE = 'kx_session';

class HttpError extends Error { constructor(status, msg) { super(msg); this.status = status; } }
const bad = (msg) => { throw new HttpError(400, msg); };

// ---------- util request/response ----------
const isHttps = (req) => config.trustProxy ? req.headers['x-forwarded-proto'] === 'https' : !!req.socket.encrypted;
const clientIp = (req) => (config.trustProxy && String(req.headers['x-forwarded-for'] || '').split(',')[0].trim()) || req.socket.remoteAddress;
const cookies = (req) => Object.fromEntries(String(req.headers.cookie || '').split(';').map((c) => c.trim().split('=')).filter((p) => p[0]).map(([k, ...v]) => [k, decodeURIComponent(v.join('='))]));

function send(res, status, body, headers = {}) {
  res.writeHead(status, headers);
  res.end(body);
}
const json = (res, status, data, headers = {}) => send(res, status, JSON.stringify(data), { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers });

async function readBody(req, limit) {
  const chunks = []; let size = 0;
  for await (const c of req) {
    size += c.length;
    if (size > limit) throw new HttpError(413, `Ukuran data terlalu besar (maks. ${Math.round(limit / 1048576)} MB)`);
    chunks.push(c);
  }
  return Buffer.concat(chunks);
}
const readJson = async (req) => {
  const buf = await readBody(req, 2 * 1048576);
  try { return buf.length ? JSON.parse(buf.toString('utf8')) : {}; } catch { bad('Data tidak valid'); }
};

const SECURITY = { 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin' };
const ADMIN_HEADERS = {
  ...SECURITY, 'X-Frame-Options': 'DENY', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow',
  'Content-Security-Policy': "default-src 'self'; img-src 'self' data: https://i.ytimg.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; script-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'",
};

// ---------- file statis ----------
async function serveFile(res, file, headers = {}, req) {
  const body = await fs.readFile(file);
  const etag = '"' + crypto.createHash('md5').update(body).digest('hex').slice(0, 16) + '"';
  if (req?.headers['if-none-match'] === etag) return send(res, 304, null, { ETag: etag, ...headers });
  send(res, 200, req?.method === 'HEAD' ? null : body, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', ETag: etag, ...headers });
}
const within = (root, p) => { const f = path.join(root, p); return f.startsWith(root + path.sep) || f === root ? f : null; };

let redirectMap = null;
const loadRedirects = () => (redirectMap = new Map(docs.list('redirects').flatMap((r) => [[r.from, r.to], [String(r.from).replace(/\/$/, ''), r.to]])));

async function servePublic(req, res, url) {
  if (!redirectMap) loadRedirects();
  if (redirectMap.has(url)) return send(res, 301, null, { Location: redirectMap.get(url), ...SECURITY });
  let file = within(config.dist, url);
  if (!file) return send(res, 400, 'Bad request');
  try {
    const st = await fs.stat(file);
    if (st.isDirectory()) {
      if (!url.endsWith('/')) return send(res, 301, null, { Location: url + '/', ...SECURITY });
      file = path.join(file, 'index.html');
    }
    const cache = url.startsWith('/assets/') ? 'public, max-age=31536000, immutable' : url.startsWith('/img/') ? 'public, max-age=2592000' : 'public, max-age=0, must-revalidate';
    await serveFile(res, file, { ...SECURITY, 'Cache-Control': cache }, req);
  } catch {
    const page = await fs.readFile(path.join(config.dist, '404.html')).catch(() => 'Halaman tidak ditemukan. Situs belum dipublikasikan?');
    send(res, 404, page, { 'Content-Type': TYPES['.html'], ...SECURITY });
  }
}

// ---------- API ----------
const fieldsOf = (def) => def.fields || def.groups.flatMap(([, fs]) => fs);
const titleOf = (col, d) => d[collections[col].titleField] || d._id;
const listItem = (col, d) => ({ id: d._id, title: titleOf(col, d), status: d.status, date: d.date, updated: d._updated, by: d._by, cover: d.cover || d.logo || null });

// field ref/refs yang menunjuk ke koleksi `col` (termasuk di dalam list), untuk ganti slug
function renameRefs(col, oldId, newId) {
  const fix = (fields, data) => {
    let changed = false;
    for (const f of fields) {
      const v = data?.[f.key];
      if (f.type === 'ref' && f.collection === col && v === oldId) { data[f.key] = newId; changed = true; }
      if (f.type === 'refs' && f.collection === col && Array.isArray(v) && v.includes(oldId)) { data[f.key] = v.map((x) => (x === oldId ? newId : x)); changed = true; }
      if (f.type === 'list' && Array.isArray(v)) for (const item of v) changed = fix(f.fields, item) || changed;
    }
    return changed;
  };
  for (const [name, def] of Object.entries(singletons)) { const d = docs.get('settings', name); if (d && fix(fieldsOf(def), d)) docs.put('settings', name, d, 'sistem'); }
  for (const [name, def] of Object.entries(collections)) for (const d of docs.list(name)) if (fix(def.fields, d)) docs.put(name, d._id, d, 'sistem');
}

function schemaFor(user) {
  const strip = (fields) => fields.filter((f) => !f.adminOnly || user.role === 'admin');
  return {
    singletons: Object.fromEntries(Object.entries(singletons).map(([k, d]) => [k, { ...d, groups: d.groups.map(([g, fs]) => [g, strip(fs)]) }])),
    collections: Object.fromEntries(Object.entries(collections).filter(([, d]) => !d.adminOnly || user.role === 'admin').map(([k, d]) => [k, { ...d, fields: strip(d.fields) }])),
  };
}

async function api(req, res, url, user, query) {
  const m = req.method;
  const seg = url.split('/').filter(Boolean).slice(1); // tanpa "api"
  const [a, b, c] = seg;
  const needAdmin = () => { if (user.role !== 'admin') throw new HttpError(403, 'Hanya admin yang boleh melakukan ini'); };
  const who = user.username;

  if (a === 'me' && !b && m === 'GET') return json(res, 200, { user, status: status() });
  if (a === 'me' && b === 'password' && m === 'PUT') {
    const { current, next } = await readJson(req);
    const row = db.prepare('SELECT pass_hash FROM users WHERE id = ?').get(user.id);
    if (!verifyPassword(String(current || ''), row.pass_hash)) bad('Password lama salah');
    users.setPassword(user.id, next); log(who, 'ganti password', who);
    return json(res, 200, { ok: true, relogin: true });
  }
  if (a === 'schema') return json(res, 200, schemaFor(user));
  // thumbnail foto untuk panel admin (termasuk yang belum dipublikasikan)
  if (a === 'file' && b && m === 'GET') {
    if (!/^[a-z0-9-]+(-\d+)?\.(webp|jpg)$/.test(b)) throw new HttpError(400, 'Nama file tidak valid');
    return serveFile(res, path.join(config.mediaImg, b), { 'Cache-Control': 'private, max-age=300', ...SECURITY }, req).catch(() => { throw new HttpError(404, 'File tidak ditemukan'); });
  }
  if (a === 'status') return json(res, 200, status());
  if (a === 'activity') return json(res, 200, recentActivity(40));

  if (a === 'publish' && m === 'POST') {
    try {
      const r = await publish(); log(who, 'publikasi', `${r.pages} halaman`);
      return json(res, 200, { ...r, status: status() });
    } catch (e) { console.error(e); throw new HttpError(500, 'Publikasi gagal: ' + e.message); }
  }

  // pengaturan tunggal
  if (a === 'settings' && singletons[b]) {
    if (m === 'GET') return json(res, 200, docs.get('settings', b) || {});
    if (m === 'PUT') {
      const { data, errors } = validate('singleton', b, await readJson(req), user);
      if (errors.length) return json(res, 422, { errors });
      docs.put('settings', b, { ...(docs.get('settings', b) || {}), ...data }, who); log(who, 'ubah', singletons[b].label);
      return json(res, 200, { ok: true, status: status() });
    }
  }

  // pilihan untuk field ref/refs
  if (a === 'options' && collections[b]) return json(res, 200, docs.list(b).map((d) => ({ value: d._id, label: titleOf(b, d) })));

  // koleksi
  if (a === 'c' && collections[b]) {
    const def = collections[b];
    if (def.adminOnly) needAdmin();
    if (!c && m === 'GET') {
      let list = docs.list(b);
      if (def.orderBy === 'date') list = list.sort((x, y) => String(y.date).localeCompare(String(x.date)));
      return json(res, 200, list.map((d) => listItem(b, d)));
    }
    if (!c && m === 'POST') {
      const body = await readJson(req);
      const { data, errors } = validate('collection', b, body, user);
      if (errors.length) return json(res, 422, { errors });
      const id = hasSlug(b) ? slugify(body._slug || titleOf(b, data)) : crypto.randomBytes(5).toString('hex');
      if (!id) return json(res, 422, { errors: ['Alamat halaman (slug) tidak boleh kosong'] });
      if (docs.get(b, id)) return json(res, 422, { errors: [`Alamat "${id}" sudah dipakai, ganti judul atau alamatnya`] });
      docs.put(b, id, data, who); log(who, 'tambah', `${def.label}: ${titleOf(b, data)}`); if (b === 'redirects') loadRedirects();
      return json(res, 201, { id, status: status() });
    }
    if (c === '_order' && m === 'PUT') {
      const { ids } = await readJson(req);
      if (!Array.isArray(ids)) bad('Urutan tidak valid');
      docs.reorder(b, ids.map(String)); log(who, 'ubah urutan', def.label);
      return json(res, 200, { ok: true, status: status() });
    }
    if (c) {
      const doc = docs.get(b, c);
      if (!doc) throw new HttpError(404, 'Data tidak ditemukan');
      if (m === 'GET') return json(res, 200, doc);
      if (m === 'PUT') {
        const body = await readJson(req);
        const { data, errors } = validate('collection', b, body, user);
        if (errors.length) return json(res, 422, { errors });
        let id = c;
        const newSlug = hasSlug(b) && body._slug != null ? slugify(body._slug) : c;
        if (newSlug && newSlug !== c) {
          if (docs.get(b, newSlug)) return json(res, 422, { errors: [`Alamat "${newSlug}" sudah dipakai`] });
          docs.put(b, newSlug, data, who, doc._sort); docs.remove(b, c); renameRefs(b, c, newSlug); id = newSlug;
          // alamat lama dialihkan otomatis agar link dari Google tidak putus
          const prefix = def.slugPrefix;
          if (prefix) docs.put('redirects', crypto.randomBytes(5).toString('hex'), { from: `${prefix}${c}/`, to: `${prefix}${newSlug}/` }, who);
          loadRedirects();
        } else docs.put(b, c, { ...doc, ...data }, who);
        log(who, 'ubah', `${def.label}: ${titleOf(b, data)}`); if (b === 'redirects') loadRedirects();
        return json(res, 200, { ok: true, id, status: status() });
      }
      if (m === 'DELETE') {
        docs.remove(b, c); log(who, 'hapus', `${def.label}: ${titleOf(b, doc)}`); if (b === 'redirects') loadRedirects();
        return json(res, 200, { ok: true, status: status() });
      }
    }
  }

  // media
  if (a === 'media') {
    if (!b && m === 'GET') return json(res, 200, mediaDb.list());
    if (!b && m === 'POST') {
      const buf = await readBody(req, config.maxUploadMB * 1048576);
      const filename = decodeURIComponent(String(req.headers['x-filename'] || 'foto'));
      const kind = req.headers['x-kind'] === 'logo' ? 'logo' : 'photo';
      try {
        const item = await saveUpload(buf, { filename, kind });
        log(who, 'upload', item.slug);
        return json(res, 201, item);
      } catch (e) { bad(e.message); }
    }
    if (b && m === 'PUT') {
      if (!mediaDb.get(b)) throw new HttpError(404, 'Foto tidak ditemukan');
      const { alt, cat } = await readJson(req);
      mediaDb.update(b, { alt: String(alt || '').slice(0, 300), cat: String(cat || '').slice(0, 30) });
      return json(res, 200, { ok: true, status: status() });
    }
    if (b && m === 'DELETE') {
      const used = findUsage(b, loadContent());
      if (used.length && query.get('force') !== '1') return json(res, 409, { errors: [`Foto masih dipakai di: ${used.join(', ')}`], used });
      await deleteMedia(b); log(who, 'hapus foto', b);
      return json(res, 200, { ok: true, status: status() });
    }
  }

  // pengguna (admin)
  if (a === 'users') {
    needAdmin();
    if (!b && m === 'GET') return json(res, 200, users.list());
    try {
      if (!b && m === 'POST') { const body = await readJson(req); const id = users.create(body); log(who, 'tambah pengguna', body.username); return json(res, 201, { id }); }
      if (b && m === 'PUT') {
        const body = await readJson(req);
        if (+b === user.id && body.role && body.role !== user.role) bad('Tidak bisa mengubah peran akun sendiri');
        users.update(+b, body); if (body.password) users.setPassword(+b, body.password);
        log(who, 'ubah pengguna', String(b)); return json(res, 200, { ok: true });
      }
      if (b && m === 'DELETE') { if (+b === user.id) bad('Tidak bisa menghapus akun sendiri'); users.remove(+b); log(who, 'hapus pengguna', String(b)); return json(res, 200, { ok: true }); }
    } catch (e) { if (e instanceof HttpError) throw e; bad(e.message); }
  }

  // cadangan konten (admin)
  if (a === 'export' && m === 'GET') {
    needAdmin();
    const all = loadContent(); delete all.media;
    return json(res, 200, { exportedAt: new Date().toISOString(), ...all, media: mediaDb.list() }, { 'Content-Disposition': `attachment; filename="kalmer-konten-${new Date().toISOString().slice(0, 10)}.json"` });
  }

  throw new HttpError(404, 'Endpoint tidak dikenal');
}

// ---------- server ----------
const server = http.createServer(async (req, res) => {
  let url;
  try { url = decodeURIComponent(new URL(req.url, 'http://x').pathname); } catch { return send(res, 400, 'Bad request'); }
  try {
    // panel admin (file statis)
    if (url === '/admin' || url.startsWith('/admin/')) {
      if (url === '/admin') return send(res, 301, null, { Location: '/admin/' });
      const rel = url.slice('/admin'.length) || '/';
      const file = rel === '/' ? path.join(config.admin, 'index.html') : within(config.admin, rel);
      if (!file) return send(res, 400, 'Bad request');
      return await serveFile(res, file, ADMIN_HEADERS, req).catch(() => send(res, 404, 'Not found', ADMIN_HEADERS));
    }

    if (url.startsWith('/api/')) {
      // CSRF: semua perubahan wajib dari panel admin di domain yang sama
      if (req.method !== 'GET') {
        const origin = req.headers.origin;
        if (req.headers['x-kalmer'] !== '1' || (origin && new URL(origin).host !== req.headers.host)) return json(res, 403, { errors: ['Permintaan ditolak'] });
      }
      if (url === '/api/login' && req.method === 'POST') {
        const { username, password } = await readJson(req);
        const ip = clientIp(req);
        const wait = loginBlocked(ip, username);
        if (wait) return json(res, 429, { errors: [`Terlalu banyak percobaan. Coba lagi dalam ${wait} menit.`] });
        const r = login(ip, username, password);
        if (!r) return json(res, 401, { errors: ['Username atau password salah'] });
        log(r.user.username, 'login', ip);
        const cookie = `${COOKIE}=${r.token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${config.sessionDays * 86400}${isHttps(req) ? '; Secure' : ''}`;
        return json(res, 200, { user: r.user }, { 'Set-Cookie': cookie });
      }
      const token = cookies(req)[COOKIE];
      if (url === '/api/logout' && req.method === 'POST') { logout(token); return json(res, 200, { ok: true }, { 'Set-Cookie': `${COOKIE}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0` }); }
      const user = sessionUser(token);
      if (!user) return json(res, 401, { errors: ['Silakan login'] });
      return await api(req, res, url, user, new URL(req.url, 'http://x').searchParams);
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'Method not allowed');
    return await servePublic(req, res, url);
  } catch (e) {
    const code = e.status || 500;
    if (code === 500) console.error(e);
    if (url.startsWith('/api/')) return json(res, code, { errors: [code === 500 ? 'Terjadi kesalahan di server' : e.message] });
    send(res, code, 'Error');
  }
});

server.listen(config.port, config.host, () => {
  console.log(`Kalmer berjalan di http://${config.host}:${config.port}  (admin: /admin)`);
  if (!users.count()) console.log('Belum ada pengguna. Buat admin pertama: npm run user -- add <username> admin');
});
