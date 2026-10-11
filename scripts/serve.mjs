// Server lokal untuk preview folder dist/ (tanpa dependensi).
//   node scripts/serve.mjs   → http://localhost:4321
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';

const DIST = path.resolve(import.meta.dirname, '../dist');
const PORT = +process.env.PORT || 4321;
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.xml': 'application/xml', '.txt': 'text/plain', '.webmanifest': 'application/manifest+json', '.json': 'application/json' };

// baca pengalihan dari dist/_redirects agar perilakunya sama dengan hosting
const redirects = new Map((await fs.readFile(path.join(DIST, '_redirects'), 'utf8').catch(() => ''))
  .split('\n').filter(Boolean).map((l) => l.split(/\s+/)).map(([a, b]) => [a, b]));

http.createServer(async (req, res) => {
  const url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (redirects.has(url)) { res.writeHead(301, { Location: redirects.get(url) }); return res.end(); }
  let file = path.join(DIST, url);
  if (!file.startsWith(DIST)) { res.writeHead(403); return res.end(); }
  try {
    const st = await fs.stat(file);
    if (st.isDirectory()) {
      if (!url.endsWith('/')) { res.writeHead(301, { Location: url + '/' }); return res.end(); }
      file = path.join(file, 'index.html');
    }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    res.end(await fs.readFile(file));
  } catch {
    res.writeHead(404, { 'Content-Type': TYPES['.html'] });
    res.end(await fs.readFile(path.join(DIST, '404.html')).catch(() => 'Not found'));
  }
}).listen(PORT, () => console.log(`Preview: http://localhost:${PORT}`));
