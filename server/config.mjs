// Konfigurasi server. Semua bisa diatur lewat environment variable.
import path from 'node:path';

export const ROOT = path.resolve(import.meta.dirname, '..');
export const STORAGE = path.resolve(process.env.STORAGE_DIR || path.join(ROOT, 'storage'));

export const config = {
  port: +process.env.PORT || 4321,
  host: process.env.HOST || '127.0.0.1',
  // true jika di belakang reverse proxy HTTPS (Nginx, cPanel/Passenger) → cookie Secure + baca X-Forwarded-*
  trustProxy: process.env.TRUST_PROXY === '1',
  dbFile: path.join(STORAGE, 'kalmer.db'),
  mediaRaw: path.join(STORAGE, 'media', 'raw'),
  mediaImg: path.join(STORAGE, 'media', 'img'),
  dist: path.join(ROOT, 'dist'),
  public: path.join(ROOT, 'public'),
  assets: path.join(ROOT, 'src', 'assets'),
  admin: path.join(ROOT, 'admin'),
  sessionDays: 7,
  maxUploadMB: 20,
};
