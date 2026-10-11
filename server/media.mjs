// Proses foto upload: validasi, simpan asli, buat WebP 800/1600 + JPG preview 1200x630.
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { config } from './config.mjs';
import { mediaDb } from './db.mjs';
import { slugify } from './validate.mjs';

const WIDTHS = [800, 1600];
const FORMATS = new Set(['jpeg', 'png', 'webp', 'avif', 'heif', 'tiff', 'gif']);
sharp.cache(false);

function uniqueSlug(base) {
  let slug = slugify(base) || 'foto';
  if (!mediaDb.get(slug)) return slug;
  for (let i = 2; ; i++) if (!mediaDb.get(`${slug}-${i}`)) return `${slug}-${i}`;
}

// Membuat file turunan dari foto asli (dipakai saat upload dan saat migrasi)
export async function renderVariants(rawFile, slug, kind) {
  const out = config.mediaImg;
  await fs.mkdir(path.join(out, 'og'), { recursive: true });
  if (kind === 'logo') {
    const file = path.join(out, `${slug}.webp`);
    await sharp(rawFile).trim().resize({ height: 140, withoutEnlargement: true }).webp({ quality: 85 }).toFile(file);
    const m = await sharp(file).metadata();
    return { w: m.width, h: m.height, sizes: [] };
  }
  const base = sharp(rawFile, { failOn: 'error' }).rotate();
  const { width, height } = await base.clone().toBuffer({ resolveWithObject: true }).then((r) => r.info);
  const sizes = [...new Set(WIDTHS.filter((w) => w < width).concat(width <= 1600 ? [width] : []))];
  for (const w of sizes) await base.clone().resize({ width: w }).webp({ quality: 78 }).toFile(path.join(out, `${slug}-${w}.webp`));
  await base.clone().resize(1200, 630, { fit: 'cover' }).jpeg({ quality: 80, mozjpeg: true }).toFile(path.join(out, 'og', `${slug}.jpg`));
  return { w: width, h: height, sizes };
}

export async function saveUpload(buffer, { filename = 'foto', kind = 'photo', alt = '', cat = '' } = {}) {
  if (buffer.length > config.maxUploadMB * 1024 * 1024) throw new Error(`Ukuran file maksimal ${config.maxUploadMB} MB`);
  let info;
  try { info = await sharp(buffer).metadata(); } catch { throw new Error('File bukan gambar yang bisa dibaca'); }
  if (!FORMATS.has(info.format)) throw new Error(`Format ${info.format} tidak didukung. Gunakan JPG, PNG, atau WebP.`);
  if ((info.width || 0) < 200) throw new Error('Gambar terlalu kecil (minimal lebar 200 px)');

  const slug = uniqueSlug(path.parse(filename).name);
  const ext = { jpeg: '.jpg', png: '.png', webp: '.webp', avif: '.avif', heif: '.heic', tiff: '.tif', gif: '.gif' }[info.format];
  const raw = path.join(config.mediaRaw, slug + ext);
  await fs.writeFile(raw, buffer);
  try {
    const v = await renderVariants(raw, slug, kind);
    mediaDb.insert({ slug, kind, alt, cat, ...v, original_name: String(filename).slice(0, 200) });
  } catch (e) {
    await fs.rm(raw, { force: true });
    throw e;
  }
  return mediaDb.get(slug);
}

export async function deleteMedia(slug) {
  const m = mediaDb.get(slug);
  if (!m) return;
  const dir = config.mediaImg;
  const files = m.kind === 'logo' ? [`${slug}.webp`] : [...m.sizes.map((w) => `${slug}-${w}.webp`), `og/${slug}.jpg`];
  await Promise.all(files.map((f) => fs.rm(path.join(dir, f), { force: true })));
  for (const f of await fs.readdir(config.mediaRaw)) if (path.parse(f).name === slug) await fs.rm(path.join(config.mediaRaw, f), { force: true });
  mediaDb.remove(slug);
}

// Cari halaman/konten yang memakai sebuah foto (dicek sebelum menghapus)
export function findUsage(slug, content) {
  const used = [];
  const scan = (obj, where) => {
    if (obj === slug) used.push(where);
    else if (Array.isArray(obj)) obj.forEach((x) => scan(x, where));
    else if (obj && typeof obj === 'object') Object.values(obj).forEach((x) => scan(x, where));
  };
  scan(content.site, 'Pengaturan Situs'); scan(content.home, 'Beranda'); scan(content.pages, 'Halaman Daftar');
  for (const [col, label] of [['services', 'Layanan'], ['locations', 'Area'], ['projects', 'Portofolio'], ['posts', 'Blog'], ['clients', 'Logo Klien']])
    for (const d of content[col]) scan(d, `${label}: ${d.name || d.title || d._id}`);
  return [...new Set(used)];
}
