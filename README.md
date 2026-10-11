# kalmer.id — situs statis

Situs Kalmer Multi Teknik, dibangun dari kode sendiri tanpa WordPress atau Elementor.
Halaman HTML dibuat oleh `build.mjs` dari data di `src/data/`, lalu hasilnya (folder `dist/`)
bisa di-upload ke hosting mana pun.

## Struktur

```
src/data/site.mjs        Data bisnis (alamat, telepon, jam buka, sosmed, statistik, FAQ, proyek berjalan)
src/data/services.mjs    4 halaman layanan  → /layanan/<slug>/
src/data/locations.mjs   5 halaman area      → /kontraktor-<kota>/
src/data/projects.mjs    Studi kasus         → /portofolio/<slug>/
src/data/posts.mjs       Artikel blog        → /blog/<slug>/
src/data/images.mjs      Daftar foto + alt text
src/assets/              CSS dan JavaScript
public/                  File statis (foto WebP, favicon) — disalin apa adanya ke dist/
build.mjs                Generator halaman, sitemap, robots.txt, redirect
scripts/images.mjs       Unduh & konversi foto ke WebP (butuh `npm install` sekali)
scripts/check.mjs        Cek tautan rusak, alt text, H1, panjang judul/deskripsi, JSON-LD
scripts/serve.mjs        Server preview lokal
```

## Perintah

```bash
npm install        # sekali saja, hanya untuk memproses foto (sharp)
npm run build      # buat ulang dist/
npm run check      # periksa SEO & tautan
npm run dev        # build + preview di http://localhost:4321
```

## Pekerjaan rutin

**Menambah artikel blog**: tambahkan objek baru di `src/data/posts.mjs` (slug, judul, deskripsi, tanggal, cover, isi HTML),
lalu `npm run build`. Halaman, sitemap, dan daftar artikel otomatis diperbarui.

**Menambah studi kasus**:
1. Tambahkan foto di `src/data/images.mjs` (beri `og: true` untuk foto sampul).
2. Jalankan `npm run images`.
3. Tambahkan proyek di `src/data/projects.mjs`.
4. Jalankan `npm run build`.

**Mengubah alamat/telepon/jam buka**: cukup di `src/data/site.mjs`. Samakan juga di Google Business Profile.

**Proyek berjalan & angka statistik**: `ongoing` dan `stats` di `src/data/site.mjs`.

## Online-kan (pindah dari WordPress)

Pilih salah satu:

**A. Hosting cPanel yang sekarang (Apache/LiteSpeed)**
1. Backup penuh WordPress (file + database) dari cPanel, simpan baik-baik.
2. Jalankan `npm run build`.
3. Pindahkan isi `public_html` lama ke folder cadangan, lalu upload **isi** folder `dist/` (termasuk `.htaccess`) ke `public_html`.
4. Buka situs dan cek beberapa halaman serta URL lama (mis. `/cafe/` harus pindah ke `/layanan/kontraktor-cafe/`).

**B. Netlify atau Cloudflare Pages (gratis, lebih cepat)**
- Hubungkan repo Git ini. Isi *Build command* `node build.mjs` dan *Publish directory* `dist`.
- File `_redirects` dan `_headers` otomatis dipakai.
- Arahkan DNS domain kalmer.id ke layanan tersebut.

Setelah online:
1. **Google Search Console**: tambahkan properti kalmer.id, verifikasi (bisa lewat `googleSiteVerification` di `site.mjs`), lalu submit `https://kalmer.id/sitemap.xml`.
2. Minta indeks ulang untuk homepage dan halaman layanan utama.
3. Uji di [PageSpeed Insights](https://pagespeed.web.dev) dan [Rich Results Test](https://search.google.com/test/rich-results).
4. Opsional: isi `ga4Id` di `site.mjs` untuk Google Analytics 4.

## Redirect URL lama

| URL WordPress lama | Diarahkan ke |
|---|---|
| `/cafe/` | `/layanan/kontraktor-cafe/` |
| `/komersil/` | `/layanan/kontraktor-komersial/` |
| `/home/` | `/` |
| `/hello-world/` | `/blog/` |
| `/vendor/` | `/hub/` |
| `/wp-sitemap.xml` | `/sitemap.xml` |

`/hub/` tetap ada (halaman link untuk bio Instagram), tetapi tidak diindeks Google.
