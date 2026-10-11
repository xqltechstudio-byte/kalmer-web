// Kelola akun dari terminal (untuk admin pertama atau jika lupa password).
//   npm run user -- add <username> [admin|editor] [nama]
//   npm run user -- reset <username>
//   npm run user -- list
//   npm run user -- remove <username> [--force]   (--force: boleh hapus admin terakhir)
// Password dibuat acak dan ditampilkan SEKALI. Bisa juga diisi lewat env KALMER_PASSWORD.
import crypto from 'node:crypto';
import { users } from './auth.mjs';
import { db } from './db.mjs';

const force = process.argv.includes('--force');
const [cmd, username, role = 'admin', ...nameParts] = process.argv.slice(2).filter((a) => a !== '--force');
const genPassword = () => crypto.randomBytes(12).toString('base64url');
const findId = (u) => db.prepare('SELECT id FROM users WHERE username = ?').get(u)?.id;

try {
  if (cmd === 'add') {
    if (!username) throw new Error('Pakai: npm run user -- add <username> [admin|editor] [nama]');
    const password = process.env.KALMER_PASSWORD || genPassword();
    users.create({ username, role, name: nameParts.join(' ') || username, password });
    console.log(`✔ Akun "${username}" (${role}) dibuat.`);
    if (!process.env.KALMER_PASSWORD) console.log(`  Password sementara: ${password}\n  Simpan sekarang, lalu ganti lewat menu "Akun Saya" setelah login.`);
  } else if (cmd === 'reset') {
    const id = findId(username);
    if (!id) throw new Error(`Akun "${username}" tidak ditemukan`);
    const password = process.env.KALMER_PASSWORD || genPassword();
    users.setPassword(id, password);
    console.log(`✔ Password "${username}" direset. Semua sesi login lama dikeluarkan.`);
    if (!process.env.KALMER_PASSWORD) console.log(`  Password baru: ${password}`);
  } else if (cmd === 'list') {
    console.table(users.list());
  } else if (cmd === 'remove') {
    const id = findId(username);
    if (!id) throw new Error(`Akun "${username}" tidak ditemukan`);
    if (force) db.prepare('DELETE FROM users WHERE id = ?').run(id); else users.remove(id);
    console.log(`✔ Akun "${username}" dihapus.`);
  } else {
    console.log('Perintah: add | reset | list | remove  (lihat komentar di server/cli.mjs)');
  }
} catch (e) {
  console.error('✖', e.message);
  process.exitCode = 1;
}
