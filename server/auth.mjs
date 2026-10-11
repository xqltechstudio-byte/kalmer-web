// Login, sesi, dan pengguna.
import crypto from 'node:crypto';
import { db } from './db.mjs';
import { config } from './config.mjs';

const SCRYPT = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
export const MIN_PASSWORD = 10;

export function hashPassword(pw) {
  const salt = crypto.randomBytes(16);
  const key = crypto.scryptSync(pw, salt, 64, SCRYPT);
  return `scrypt$${salt.toString('base64')}$${key.toString('base64')}`;
}
export function verifyPassword(pw, stored) {
  const [alg, salt, key] = String(stored).split('$');
  if (alg !== 'scrypt') return false;
  const expected = Buffer.from(key, 'base64');
  const got = crypto.scryptSync(pw, Buffer.from(salt, 'base64'), expected.length, SCRYPT);
  return crypto.timingSafeEqual(got, expected);
}
// hash palsu agar waktu respon sama saat username tidak ada
const DUMMY = hashPassword(crypto.randomBytes(16).toString('hex'));

const sha = (s) => crypto.createHash('sha256').update(s).digest('hex');
const publicUser = (u) => u && { id: u.id, username: u.username, name: u.name, role: u.role };

export const users = {
  list: () => db.prepare('SELECT id, username, name, role, created_at FROM users ORDER BY id').all(),
  get: (id) => publicUser(db.prepare('SELECT * FROM users WHERE id = ?').get(id)),
  count: () => db.prepare('SELECT COUNT(*) AS n FROM users').get().n,
  create({ username, name, role, password }) {
    if (!/^[a-zA-Z0-9._-]{3,32}$/.test(username || '')) throw new Error('Username 3–32 karakter: huruf, angka, titik, strip, garis bawah');
    if (String(password || '').length < MIN_PASSWORD) throw new Error(`Password minimal ${MIN_PASSWORD} karakter`);
    if (!['admin', 'editor'].includes(role)) throw new Error('Peran tidak valid');
    try {
      const r = db.prepare('INSERT INTO users (username, name, role, pass_hash) VALUES (?, ?, ?, ?)').run(username, (name || username).slice(0, 80), role, hashPassword(password));
      return Number(r.lastInsertRowid);
    } catch (e) { if (/UNIQUE/.test(e.message)) throw new Error('Username sudah dipakai'); throw e; }
  },
  update(id, { name, role }) {
    if (role && !['admin', 'editor'].includes(role)) throw new Error('Peran tidak valid');
    const u = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (!u) throw new Error('Pengguna tidak ditemukan');
    if (u.role === 'admin' && role === 'editor' && adminCount() <= 1) throw new Error('Harus ada minimal satu admin');
    db.prepare('UPDATE users SET name = ?, role = ? WHERE id = ?').run((name || u.name).slice(0, 80), role || u.role, id);
  },
  setPassword(id, password) {
    if (String(password || '').length < MIN_PASSWORD) throw new Error(`Password minimal ${MIN_PASSWORD} karakter`);
    db.prepare('UPDATE users SET pass_hash = ? WHERE id = ?').run(hashPassword(password), id);
    db.prepare('DELETE FROM sessions WHERE user_id = ?').run(id); // keluarkan semua sesi lama
  },
  remove(id) {
    const u = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (!u) return;
    if (u.role === 'admin' && adminCount() <= 1) throw new Error('Tidak bisa menghapus admin terakhir');
    db.prepare('DELETE FROM users WHERE id = ?').run(id);
  },
};
const adminCount = () => db.prepare("SELECT COUNT(*) AS n FROM users WHERE role = 'admin'").get().n;

// ---------- batas percobaan login: 5 gagal / 15 menit per IP+username ----------
const attempts = new Map();
const WINDOW = 15 * 60 * 1000, MAX_FAIL = 5;
const keyOf = (ip, u) => `${ip}|${String(u).toLowerCase()}`;
export function loginBlocked(ip, username) {
  const a = attempts.get(keyOf(ip, username));
  return a && a.count >= MAX_FAIL && Date.now() - a.first < WINDOW ? Math.ceil((WINDOW - (Date.now() - a.first)) / 60000) : 0;
}
function fail(ip, username) {
  const k = keyOf(ip, username), a = attempts.get(k);
  if (!a || Date.now() - a.first > WINDOW) attempts.set(k, { count: 1, first: Date.now() });
  else a.count++;
}

export function login(ip, username, password) {
  const u = db.prepare('SELECT * FROM users WHERE username = ?').get(String(username || ''));
  const okPw = verifyPassword(String(password || ''), u ? u.pass_hash : DUMMY);
  if (!u || !okPw) { fail(ip, username); return null; }
  attempts.delete(keyOf(ip, username));
  const token = crypto.randomBytes(32).toString('base64url');
  db.prepare('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)').run(sha(token), u.id, Date.now() + config.sessionDays * 864e5);
  db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(Date.now());
  return { token, user: publicUser(u) };
}
export function sessionUser(token) {
  if (!token) return null;
  const s = db.prepare('SELECT * FROM sessions WHERE token_hash = ?').get(sha(token));
  if (!s || s.expires_at < Date.now()) return null;
  return users.get(s.user_id);
}
export const logout = (token) => token && db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(sha(token));
