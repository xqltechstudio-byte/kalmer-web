# kalmer.id

Situs Kalmer Multi Teknik beserta panel admin untuk mengelola semua konten.
Dibangun dari kode sendiri, tanpa WordPress atau Elementor.

- **Situs publik**: halaman HTML statis yang cepat dan ramah SEO, dibuat ulang setiap kali admin menekan **Publikasikan**.
- **Panel admin** (`/admin`): tim bisa mengedit beranda, layanan, portofolio, blog, area, logo klien, foto, pengaturan situs, pengalihan URL, dan pengguna.
- **Teknologi**: Node.js 22.13+ dengan SQLite bawaan. Satu-satunya library tambahan adalah `sharp` untuk kompresi foto.

## Struktur

```
server/            Backend
  server.mjs       HTTP server: situs publik, /admin, /api
  schema.mjs       Daftar semua field yang bisa diedit (form admin dibuat dari sini)
  db.mjs           Database SQLite
  auth.mjs         Login, sesi, pengguna
  validate.mjs     Validasi & pembersihan HTML dari editor
  media.mjs        Upload & kompresi foto
  publish.mjs      Membangun ulang situs
  cli.mjs          Kelola akun dari terminal
src/render.mjs     Template seluruh halaman situs publik
src/assets/        CSS & JavaScript situs publik
admin/             Panel admin (HTML/CSS/JS)
public/            File statis (favicon, logo)
seed/              Konten & foto awal, hanya dipakai `npm run migrate`
storage/           DATA LIVE: database + foto upload (tidak masuk Git, wajib di-backup)
dist/              Hasil build situs publik (dibuat otomatis)
```

## Menjalankan di komputer sendiri

```bash
npm install
npm run migrate                 # sekali: isi database dari folder seed/
npm run user -- add namaanda admin "Nama Anda"
npm start                       # http://localhost:4321  ·  admin: http://localhost:4321/admin
```

Perintah `user add` menampilkan password sementara **satu kali**. Setelah login, ganti lewat menu **Akun saya**.

## Alur kerja tim

1. Login di `/admin`.
2. Ubah konten (teks, foto, artikel), lalu klik **Simpan**. Perubahan tersimpan tetapi belum tampil.
3. Klik **Publikasikan** di kanan atas. Situs dibangun ulang dalam sekitar 1 detik.

Tips penulisan:
- Di judul, `*kata*` menjadi miring berwarna dan `**kata**` menjadi tebal.
- Setiap foto sebaiknya diberi **keterangan** (alt text) di menu Foto & Media. Ini penting untuk Google.
- Artikel berstatus **Draf** tidak tampil. Ubah ke **Terbit** saat siap.
- Mengganti alamat halaman (slug) otomatis membuat pengalihan dari alamat lama.

## Peran pengguna

| Peran | Bisa |
|---|---|
| Editor | Semua konten, foto, publikasi |
| Admin | Semua di atas + pengguna, pengalihan URL, alamat situs |

Lupa password: `npm run user -- reset <username>` (di server).

## Deploy ke server

Butuh hosting yang bisa menjalankan **Node.js 22.13 atau lebih baru**, misalnya VPS (DigitalOcean, Biznet Gio, IDCloudHost, dll.) atau cPanel dengan fitur *Setup Node.js App*.

### VPS (disarankan)

```bash
git clone https://github.com/xqltechstudio-byte/kalmer-web.git && cd kalmer-web
npm ci
npm run migrate
npm run user -- add namaanda admin "Nama Anda"
```

Jalankan sebagai service (contoh systemd, `/etc/systemd/system/kalmer.service`):

```ini
[Unit]
Description=Kalmer
After=network.target

[Service]
WorkingDirectory=/home/kalmer/kalmer-web
ExecStart=/usr/bin/npm start
Environment=PORT=4321 HOST=127.0.0.1 TRUST_PROXY=1
Restart=always
User=kalmer

[Install]
WantedBy=multi-user.target
```

Di depannya pasang **Nginx + HTTPS (Let's Encrypt)** yang meneruskan ke `127.0.0.1:4321`, dengan
`proxy_set_header X-Forwarded-Proto $scheme;` dan `proxy_set_header X-Forwarded-For $remote_addr;`.
`TRUST_PROXY=1` wajib di belakang proxy HTTPS agar cookie login aman (Secure) dan batas percobaan login membaca IP asli.
Batasi ukuran upload di Nginx: `client_max_body_size 25m;`.

### Variabel lingkungan

| Nama | Default | Keterangan |
|---|---|---|
| `PORT` | 4321 | Port server |
| `HOST` | 127.0.0.1 | Pakai `0.0.0.0` hanya jika tanpa reverse proxy |
| `TRUST_PROXY` | (kosong) | `1` jika di belakang Nginx/cPanel HTTPS |
| `STORAGE_DIR` | `./storage` | Lokasi database & foto upload |

## Backup

Semua konten live ada di folder **`storage/`** (database + foto). Folder ini **tidak** ada di GitHub.
- Backup folder `storage/` secara rutin, misalnya harian dengan `rsync` atau fitur snapshot hosting.
- Admin juga bisa mengunduh cadangan konten (JSON) lewat `/api/export` saat login.

## Keamanan yang sudah diterapkan

- Password di-hash dengan scrypt; tidak ada akun atau password bawaan.
- Cookie sesi HttpOnly + SameSite=Strict (+ Secure di HTTPS), berlaku 7 hari, dicabut saat ganti password.
- Semua perubahan wajib dari panel admin (pemeriksaan header & Origin terhadap CSRF).
- Maksimal 5 percobaan login gagal per 15 menit.
- HTML dari editor dibersihkan di server: hanya paragraf, judul, daftar, tebal/miring, dan tautan aman yang lolos.
- Upload divalidasi sebagai gambar asli (maks. 20 MB), lalu dikonversi ulang.
- Panel admin tidak diindeks Google dan tidak bisa ditanam di situs lain.

## Perintah lain

```bash
npm run build     # bangun ulang situs tanpa server (sama dengan tombol Publikasikan)
npm run check     # periksa tautan rusak, alt text, H1, panjang judul/deskripsi
npm run dev       # server dengan auto-restart saat kode diubah
```
