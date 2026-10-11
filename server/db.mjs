// Lapisan database (SQLite bawaan Node.js, tanpa dependensi).
// Konten disimpan sebagai dokumen JSON per koleksi, agar skema form bisa berubah
// tanpa migrasi tabel. Pengaturan (situs, beranda, halaman) adalah dokumen tunggal.
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import { config } from './config.mjs';

fs.mkdirSync(config.mediaRaw, { recursive: true });
fs.mkdirSync(config.mediaImg, { recursive: true });

export const db = new DatabaseSync(config.dbFile);
db.exec(`
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS docs (
  collection TEXT NOT NULL,
  id TEXT NOT NULL,
  data TEXT NOT NULL,
  sort INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_by TEXT,
  PRIMARY KEY (collection, id)
);
CREATE TABLE IF NOT EXISTS media (
  slug TEXT PRIMARY KEY,
  kind TEXT NOT NULL DEFAULT 'photo',      -- photo | logo
  alt TEXT NOT NULL DEFAULT '',
  cat TEXT NOT NULL DEFAULT '',
  w INTEGER NOT NULL, h INTEGER NOT NULL,
  sizes TEXT NOT NULL DEFAULT '[]',
  original_name TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE COLLATE NOCASE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'editor',     -- admin | editor
  pass_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS activity (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  at TEXT NOT NULL DEFAULT (datetime('now')),
  user TEXT, action TEXT, target TEXT
);
CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT);
`);

const parse = (r) => r && { ...JSON.parse(r.data), _id: r.id, _sort: r.sort, _updated: r.updated_at, _by: r.updated_by };

export const docs = {
  list: (col) => db.prepare('SELECT * FROM docs WHERE collection = ? ORDER BY sort, id').all(col).map(parse),
  get: (col, id) => parse(db.prepare('SELECT * FROM docs WHERE collection = ? AND id = ?').get(col, id)),
  put(col, id, data, user, sort) {
    const clean = Object.fromEntries(Object.entries(data).filter(([k]) => !k.startsWith('_')));
    const exists = db.prepare('SELECT sort FROM docs WHERE collection = ? AND id = ?').get(col, id);
    const s = sort ?? exists?.sort ?? (db.prepare('SELECT COALESCE(MAX(sort), -1) + 1 AS n FROM docs WHERE collection = ?').get(col).n);
    db.prepare(`INSERT INTO docs (collection, id, data, sort, updated_at, updated_by) VALUES (?, ?, ?, ?, datetime('now'), ?)
      ON CONFLICT(collection, id) DO UPDATE SET data = excluded.data, sort = excluded.sort, updated_at = excluded.updated_at, updated_by = excluded.updated_by`)
      .run(col, id, JSON.stringify(clean), s, user || null);
    touch();
  },
  remove(col, id) { db.prepare('DELETE FROM docs WHERE collection = ? AND id = ?').run(col, id); touch(); },
  reorder(col, ids) {
    const st = db.prepare('UPDATE docs SET sort = ? WHERE collection = ? AND id = ?');
    ids.forEach((id, i) => st.run(i, col, id));
    touch();
  },
};

export const mediaDb = {
  list: () => db.prepare('SELECT * FROM media ORDER BY created_at DESC, slug').all().map((m) => ({ ...m, sizes: JSON.parse(m.sizes) })),
  get: (slug) => { const m = db.prepare('SELECT * FROM media WHERE slug = ?').get(slug); return m && { ...m, sizes: JSON.parse(m.sizes) }; },
  insert(m) {
    db.prepare('INSERT INTO media (slug, kind, alt, cat, w, h, sizes, original_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .run(m.slug, m.kind, m.alt || '', m.cat || '', m.w, m.h, JSON.stringify(m.sizes || []), m.original_name || null);
    touch();
  },
  update(slug, { alt, cat }) { db.prepare('UPDATE media SET alt = ?, cat = ? WHERE slug = ?').run(alt ?? '', cat ?? '', slug); touch(); },
  remove(slug) { db.prepare('DELETE FROM media WHERE slug = ?').run(slug); touch(); },
};

export const meta = {
  get: (k) => db.prepare('SELECT value FROM meta WHERE key = ?').get(k)?.value ?? null,
  set: (k, v) => db.prepare('INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').run(k, String(v)),
};
// tandai bahwa ada perubahan yang belum dipublikasikan
function touch() { meta.set('changed_at', new Date().toISOString()); }

export function log(user, action, target) {
  db.prepare('INSERT INTO activity (user, action, target) VALUES (?, ?, ?)').run(user || null, action, target || null);
  db.prepare('DELETE FROM activity WHERE id <= (SELECT MAX(id) - 500 FROM activity)').run();
}
export const recentActivity = (n = 30) => db.prepare('SELECT * FROM activity ORDER BY id DESC LIMIT ?').all(n);

// Semua konten dalam bentuk yang dipakai src/render.mjs
export function loadContent() {
  const one = (id) => docs.get('settings', id) || {};
  const media = {};
  for (const m of mediaDb.list()) media[m.slug] = m;
  // id dokumen = slug (bagian URL halaman)
  const col = (name) => docs.list(name).map((d) => ({ ...d, slug: d._id }));
  return {
    site: one('site'), home: one('home'), pages: one('pages'),
    services: col('services'), locations: col('locations'), projects: col('projects'),
    posts: col('posts'), clients: col('clients'), redirects: col('redirects'),
    media,
  };
}
