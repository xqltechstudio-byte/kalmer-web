// Pemeriksaan SEO & tautan untuk folder dist/. Jalankan setelah build:
//   npm run check
import fs from 'node:fs/promises';
import path from 'node:path';

const DIST = path.resolve(import.meta.dirname, '../dist');
const files = (await fs.readdir(DIST, { recursive: true })).filter((f) => f.endsWith('.html')).map((f) => f.replaceAll('\\', '/'));
const exists = (p) => fs.access(p).then(() => true, () => false);
const problems = [], warn = [];
const titles = new Map(), descs = new Map();

for (const f of files) {
  const html = await fs.readFile(path.join(DIST, f), 'utf8');
  const page = '/' + f.replace(/index\.html$/, '');
  const noindex = /name="robots" content="noindex/.test(html);
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '';
  const desc = html.match(/name="description" content="([^"]*)"/)?.[1] ?? '';
  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) problems.push(`${page}: ${h1} elemen <h1> (harus 1)`);
  if (!noindex) {
    if (title.length > 65) warn.push(`${page}: judul ${title.length} karakter (ideal ≤ 60)`);
    if (desc.length < 70 || desc.length > 165) warn.push(`${page}: deskripsi ${desc.length} karakter (ideal 120–160)`);
    titles.set(title, [...(titles.get(title) || []), page]);
    descs.set(desc, [...(descs.get(desc) || []), page]);
  }
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(m[1]); } catch (e) { problems.push(`${page}: JSON-LD tidak valid (${e.message})`); }
  }
  for (const m of html.matchAll(/<img\b[^>]*>/g)) {
    if (!/\balt="/.test(m[0])) problems.push(`${page}: <img> tanpa alt`);
  }
  const refs = [...html.matchAll(/(?:href|src|data-src|data-full)="(\/[^"#?]*)/g)].map((m) => m[1])
    .concat([...html.matchAll(/(?:srcset|data-srcset|imagesrcset)="([^"]+)"/g)].flatMap((m) => m[1].split(',').map((s) => s.trim().split(' ')[0])));
  for (const r of new Set(refs)) {
    if (!r.startsWith('/')) continue;
    const target = path.join(DIST, r.endsWith('/') ? r + 'index.html' : r);
    if (!(await exists(target))) problems.push(`${page}: tautan/berkas rusak → ${r}`);
  }
}
for (const [t, ps] of titles) if (ps.length > 1) problems.push(`Judul kembar "${t}": ${ps.join(', ')}`);
for (const [d, ps] of descs) if (ps.length > 1) problems.push(`Deskripsi kembar: ${ps.join(', ')}`);

console.log(`Diperiksa ${files.length} halaman.`);
warn.forEach((w) => console.log('  ⚠', w));
problems.forEach((p) => console.log('  ✖', p));
if (!problems.length) console.log('✔ Tidak ada masalah kritis.');
process.exitCode = problems.length ? 1 : 0;
