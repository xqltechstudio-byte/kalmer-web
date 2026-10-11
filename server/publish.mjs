// Publikasi: bangun situs ke folder sementara, lalu tukar dengan versi live.
// Jika build gagal, situs yang sedang tayang tidak tersentuh.
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { build } from '../src/render.mjs';
import { config } from './config.mjs';
import { loadContent, meta } from './db.mjs';

let running = null;

export async function publish() {
  if (running) return running; // tekan dua kali = tunggu proses yang sama
  running = (async () => {
    const t0 = Date.now();
    const tmp = config.dist + '.tmp', old = config.dist + '.old';
    const content = loadContent();
    const lm = await sharp(path.join(config.public, 'img', 'logo.png')).metadata();
    content.logo = { w: lm.width, h: lm.height };
    const res = await build(content, { out: tmp, public: config.public, media: config.mediaImg, assets: config.assets });
    await fs.rm(old, { recursive: true, force: true });
    await fs.rename(config.dist, old).catch(() => {});
    await fs.rename(tmp, config.dist);
    await fs.rm(old, { recursive: true, force: true });
    meta.set('published_at', new Date().toISOString());
    return { ...res, ms: Date.now() - t0 };
  })();
  try { return await running; } finally { running = null; }
}

export function status() {
  const changed = meta.get('changed_at'), published = meta.get('published_at');
  return { changedAt: changed, publishedAt: published, pending: !!changed && (!published || changed > published) };
}
