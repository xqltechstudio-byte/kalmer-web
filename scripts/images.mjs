// Unduh foto asli (sekali saja) lalu buat versi WebP yang dioptimasi.
//   node scripts/images.mjs
// Hasil: public/img/*.webp, public/img/og/*.jpg, favicon, dan src/data/image-meta.json
// (ukuran tiap foto, dipakai build untuk atribut width/height agar layout tidak loncat).

import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { images, clientLogos, logo } from '../src/data/images.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const RAW = path.join(ROOT, 'src/images/raw');
const OUT = path.join(ROOT, 'public/img');
const WIDTHS = [800, 1600];

await fs.mkdir(RAW, { recursive: true });
await fs.mkdir(path.join(OUT, 'og'), { recursive: true });

const exists = (p) => fs.access(p).then(() => true, () => false);

async function download(slug, url) {
  const ext = path.extname(new URL(url).pathname).toLowerCase() || '.jpg';
  const file = path.join(RAW, slug + ext);
  if (await exists(file)) return file;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Gagal unduh ${url}: ${res.status}`);
  await fs.writeFile(file, Buffer.from(await res.arrayBuffer()));
  console.log('  unduh', slug);
  return file;
}

const meta = {};

for (const [slug, img] of Object.entries(images)) {
  const file = await download(slug, img.src);
  const src = sharp(file).rotate(); // rotate() = ikuti orientasi EXIF dari HP
  const { width, height } = await src.metadata().then((m) =>
    (m.orientation || 1) >= 5 ? { width: m.height, height: m.width } : m);
  const widths = WIDTHS.filter((w) => w < width).concat(width <= 1600 ? [width] : []);
  const made = [...new Set(widths.map((w) => Math.min(w, 1600)))];
  for (const w of made) {
    const out = path.join(OUT, `${slug}-${w}.webp`);
    if (!(await exists(out))) await sharp(file).rotate().resize({ width: w }).webp({ quality: 78 }).toFile(out);
  }
  if (img.og) {
    const out = path.join(OUT, 'og', `${slug}.jpg`);
    if (!(await exists(out))) await sharp(file).rotate().resize(1200, 630, { fit: 'cover' }).jpeg({ quality: 80, mozjpeg: true }).toFile(out);
  }
  meta[slug] = { w: width, h: height, sizes: made };
}

for (const [slug, img] of Object.entries(clientLogos)) {
  const file = await download(slug, img.src);
  const out = path.join(OUT, `${slug}.webp`);
  if (!(await exists(out))) await sharp(file).trim().resize({ height: 140, withoutEnlargement: true }).webp({ quality: 85 }).toFile(out);
  const m = await sharp(out).metadata();
  meta[slug] = { w: m.width, h: m.height };
}

// Logo: potong padding transparan, simpan PNG + WebP, plus favicon
{
  const file = await download('logo', logo.src);
  const cropped = sharp(file).extract(logo.crop);
  await cropped.clone().resize({ height: 200 }).png().toFile(path.join(OUT, 'logo.png'));
  await cropped.clone().resize({ height: 200 }).webp({ quality: 90 }).toFile(path.join(OUT, 'logo.webp'));
  const m = await sharp(path.join(OUT, 'logo.png')).metadata();
  meta.logo = { w: m.width, h: m.height };
  const square = (size) => sharp(file).extract(logo.crop)
    .resize(Math.round(size * 0.82), Math.round(size * 0.82), { fit: 'contain', background: '#ffffff' })
    .extend({ top: Math.round(size * 0.09), bottom: Math.round(size * 0.09), left: Math.round(size * 0.09), right: Math.round(size * 0.09), background: '#ffffff' })
    .resize(size, size).png();
  await square(32).toFile(path.join(ROOT, 'public/favicon-32.png'));
  await square(180).toFile(path.join(ROOT, 'public/apple-touch-icon.png'));
  await square(512).toFile(path.join(ROOT, 'public/icon-512.png'));
}

await fs.writeFile(path.join(ROOT, 'src/data/image-meta.json'), JSON.stringify(meta, null, 1));
console.log(`Selesai: ${Object.keys(meta).length} gambar diproses.`);
