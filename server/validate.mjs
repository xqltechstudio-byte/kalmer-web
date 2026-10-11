// Validasi & pembersihan data dari panel admin sebelum disimpan.
import { singletons, collections } from './schema.mjs';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// ---------- rich text ----------
// Hanya tag & atribut di daftar ini yang lolos; semua lainnya dibuang atau di-escape.
const ALLOWED = { p: [], h2: [], h3: [], ul: [], ol: [], li: [], strong: [], b: [], em: [], i: [], br: [], blockquote: [], a: ['href'] };
const RENAME = { b: 'strong', i: 'em', div: 'p', h1: 'h2', h4: 'h3', h5: 'h3', h6: 'h3' };
const DROP_WITH_CONTENT = /<(script|style|iframe|object|embed|template|svg|math|noscript)\b[\s\S]*?<\/\1\s*>/gi;
const safeHref = (h) => {
  const v = h.trim().replace(/[\u0000-\u001F\u007F\s]+/g, '');
  return /^(https?:\/\/|mailto:|tel:|\/(?!\/)|#)/i.test(v) ? v : null;
};

export function sanitizeHtml(input = '') {
  let html = String(input).replace(DROP_WITH_CONTENT, '').replace(/<!--[\s\S]*?-->/g, '');
  let out = '';
  const stack = [];
  const re = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>|([^<]+)|(<)/g;
  let m;
  while ((m = re.exec(html))) {
    if (m[3] !== undefined) { out += m[3].replace(/>/g, '&gt;'); continue; } // teks (entitas sudah aman dari contenteditable)
    if (m[4]) { out += '&lt;'; continue; }
    let tag = m[1].toLowerCase();
    tag = RENAME[tag] || tag;
    if (!ALLOWED[tag]) continue; // tag tidak dikenal: buang tagnya, isi teks tetap
    const closing = m[0][1] === '/';
    if (tag === 'br') { out += '<br>'; continue; }
    if (closing) {
      const i = stack.lastIndexOf(tag);
      if (i === -1) continue;
      while (stack.length > i) out += `</${stack.pop()}>`;
      continue;
    }
    let attrs = '';
    if (tag === 'a') {
      const href = /href\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i.exec(m[2]);
      const v = href && safeHref((href[2] ?? href[3] ?? href[4] ?? '').replace(/&amp;/g, '&'));
      if (!v) continue;
      attrs = ` href="${esc(v)}"` + (/^https?:/i.test(v) && !/^https?:\/\/(www\.)?kalmer\.id/i.test(v) ? ' target="_blank" rel="noopener"' : '');
    }
    out += `<${tag}${attrs}>`;
    stack.push(tag);
  }
  while (stack.length) out += `</${stack.pop()}>`;
  return out.replace(/<(p|h2|h3|li|strong|em)>\s*<\/\1>/g, '').trim();
}

// ---------- utilitas ----------
export const slugify = (s) => String(s).normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase()
  .replace(/&/g, ' dan ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
export const youtubeId = (v) => {
  const s = String(v || '').trim();
  const m = s.match(/(?:youtu\.be\/|v=|shorts\/|embed\/)([A-Za-z0-9_-]{11})/) || s.match(/^([A-Za-z0-9_-]{11})$/);
  return m ? m[1] : null;
};

// ---------- validasi berdasarkan skema ----------
function cleanField(f, v, errors, path) {
  const label = path || f.label;
  if (f.adminOnly === 'skip') return undefined;
  switch (f.type) {
    case 'richtext': return sanitizeHtml(v || '');
    case 'number': { if (v === '' || v == null) return null; const n = Number(v); if (!Number.isFinite(n)) errors.push(`${label}: harus angka`); return n; }
    case 'boolean': return !!v;
    case 'date': if (v && !/^\d{4}-\d{2}-\d{2}$/.test(v)) errors.push(`${label}: format tanggal salah`); return v || '';
    case 'select': return f.options.some((o) => o.value === v) ? v : (f.options[0]?.value ?? '');
    case 'multiselect': return (Array.isArray(v) ? v : []).filter((x) => f.options.some((o) => o.value === x));
    case 'tags': {
      const arr = (Array.isArray(v) ? v : []).map((x) => String(x).trim()).filter(Boolean);
      if (!f.youtube) return arr;
      return arr.map((x) => { const id = youtubeId(x); if (!id) errors.push(`${label}: "${x}" bukan link YouTube yang valid`); return id; }).filter(Boolean);
    }
    case 'image': case 'ref': return v ? String(v) : '';
    case 'images': case 'refs': return (Array.isArray(v) ? v : []).map(String).filter(Boolean);
    case 'list': return (Array.isArray(v) ? v : []).map((item, i) => {
      const o = {};
      for (const sf of f.fields) o[sf.key] = cleanField(sf, item?.[sf.key], errors, `${f.label} #${i + 1} → ${sf.label}`);
      return o;
    });
    default: {
      let s = v == null ? '' : String(v);
      s = f.type === 'textarea' ? s.replace(/\r\n/g, '\n').trim() : s.replace(/\s+/g, ' ').trim();
      if (f.youtube && s) { const id = youtubeId(s); if (!id) errors.push(`${label}: bukan link YouTube yang valid`); s = id || ''; }
      if (f.required && !s) errors.push(`${label}: wajib diisi`);
      if (f.pattern && s && !new RegExp(f.pattern).test(s)) errors.push(`${label}: format tidak sesuai`);
      return s;
    }
  }
}

const fieldsOf = (def) => def.fields || def.groups.flatMap(([, fs]) => fs);

export function validate(kind, name, input, user) {
  const def = kind === 'singleton' ? singletons[name] : collections[name];
  const errors = [];
  const out = {};
  for (const f of fieldsOf(def)) {
    if (f.adminOnly && user.role !== 'admin') continue; // field khusus admin: abaikan dari editor
    out[f.key] = cleanField(f, input[f.key], errors);
  }
  return { data: out, errors };
}

// gabungkan dengan data lama agar field khusus admin tidak terhapus saat editor menyimpan
export const mergeKeep = (old = {}, next = {}) => ({ ...old, ...next });
