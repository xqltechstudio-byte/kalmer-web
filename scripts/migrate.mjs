// Isi database awal dari konten di folder seed/ (konten situs sebelum ada panel admin).
// Jalankan sekali:  npm run migrate
// Menolak jalan jika database sudah berisi konten (tambahkan --force untuk menimpa).
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { ROOT, config } from '../server/config.mjs';
import { db, docs, mediaDb } from '../server/db.mjs';
import { site, stats, testimonials, shorts, ongoing, faqs } from '../seed/site.mjs';
import { images, clientLogos } from '../seed/images.mjs';
import { projects } from '../seed/projects.mjs';
import { services } from '../seed/services.mjs';
import { locations } from '../seed/locations.mjs';
import { posts } from '../seed/posts.mjs';

if (db.prepare('SELECT COUNT(*) AS n FROM docs').get().n && !process.argv.includes('--force')) {
  console.error('✖ Database sudah berisi konten. Tambahkan --force untuk menimpa SEMUA konten.');
  process.exit(1);
}
db.exec('DELETE FROM docs; DELETE FROM media;');

const seedMeta = JSON.parse(await fs.readFile(path.join(ROOT, 'seed/image-meta.json'), 'utf8'));
const OLD_RAW = path.join(ROOT, 'seed/media/raw');
const OLD_IMG = path.join(ROOT, 'seed/media/img');
const toEm = (s = '') => String(s).replace(/<em>(.*?)<\/em>/g, '*$1*').replace(/<b>(.*?)<\/b>/g, '**$1**').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&');
const pairs = (arr, a = 'title', b = 'text') => (arr || []).map(([x, y]) => ({ [a]: toEm(x), [b]: toEm(y) }));

// ---------- media ----------
const catOf = {};
const setCat = (cat, list) => list.forEach((s) => (catOf[s] = cat));
const P = Object.fromEntries(projects.map((p) => [p.slug, p]));
setCat('komersial', [...P['a-better-cup-tebet'].gallery, ...P['a-better-cup-untar'].gallery, 'rcb-setu-after']);
setCat('desain', [...P['butik-batik-tulis-lavi'].gallery, 'abc-depok-render', 'abc-surabaya-render']);
setCat('progres', [...P['butik-batik-tulis-lavi'].progress, 'rcb-setu-before', 'abc-depok-site']);

await fs.mkdir(path.join(config.mediaImg, 'og'), { recursive: true });
const rawFiles = await fs.readdir(OLD_RAW);
let n = 0;
for (const [slug, im] of Object.entries(images)) {
  const raw = rawFiles.find((f) => path.parse(f).name === slug);
  if (!raw) { console.warn('  foto asli tidak ada:', slug); continue; }
  await fs.copyFile(path.join(OLD_RAW, raw), path.join(config.mediaRaw, raw));
  const m = seedMeta[slug];
  for (const w of m.sizes) await fs.copyFile(path.join(OLD_IMG, `${slug}-${w}.webp`), path.join(config.mediaImg, `${slug}-${w}.webp`));
  const og = path.join(OLD_IMG, 'og', `${slug}.jpg`);
  if (await fs.access(og).then(() => true, () => false)) await fs.copyFile(og, path.join(config.mediaImg, 'og', `${slug}.jpg`));
  else await sharp(path.join(OLD_RAW, raw)).rotate().resize(1200, 630, { fit: 'cover' }).jpeg({ quality: 80, mozjpeg: true }).toFile(path.join(config.mediaImg, 'og', `${slug}.jpg`));
  mediaDb.insert({ slug, kind: 'photo', alt: im.alt, cat: im.cat || catOf[slug] || '', w: m.w, h: m.h, sizes: m.sizes, original_name: raw });
  n++;
}
for (const [slug, l] of Object.entries(clientLogos)) {
  const raw = rawFiles.find((f) => path.parse(f).name === slug);
  if (raw) await fs.copyFile(path.join(OLD_RAW, raw), path.join(config.mediaRaw, raw));
  await fs.copyFile(path.join(OLD_IMG, `${slug}.webp`), path.join(config.mediaImg, `${slug}.webp`));
  mediaDb.insert({ slug, kind: 'logo', alt: l.alt, cat: '', w: seedMeta[slug].w, h: seedMeta[slug].h, sizes: [], original_name: raw });
  n++;
}
console.log(`  ${n} foto & logo dipindahkan`);

// ---------- pengaturan ----------
docs.put('settings', 'site', {
  url: site.url, name: site.name, legalName: site.legalName, description: site.description,
  footerText: 'Kontraktor premium di Jabodetabek. Membangun hunian mewah dan properti komersial dengan RAB transparan dan pengawasan site engineer.',
  topbarText: 'Melayani Jabodetabek', phone: site.phone, phoneDisplay: site.phoneDisplay, email: site.email,
  waMessage: 'Halo Kalmer, saya ingin konsultasi mengenai rencana pembangunan properti saya.',
  addrStreet: site.address.street, addrLocality: site.address.locality, addrRegion: site.address.region, addrPostal: site.address.postal, addrCountry: 'ID', addrShort: site.address.short,
  hours: site.hours, founderName: site.founder.name, founderRole: site.founder.role, areaServed: site.areaServed, social: site.social,
  ogDefault: 'abc-untar-1', metaPixelId: site.metaPixelId, ga4Id: site.ga4Id, googleSiteVerification: site.googleSiteVerification,
}, 'migrasi');

docs.put('settings', 'home', {
  metaTitle: 'Kontraktor Rumah & Renovasi Premium Jabodetabek | Kalmer',
  metaDesc: 'Kontraktor bangun & renovasi rumah mewah, cafe, dan ruang komersial di Jabodetabek. RAB transparan, diawasi site engineer, bergaransi. Konsultasi gratis.',
  heroTagStrong: 'Kontraktor Premium', heroTagRest: 'Rumah & Komersial · Jabodetabek',
  heroTitle: 'Wujudkan hunian *warisan masa depan.*',
  heroSub: 'Bukan sekadar bangunan, tapi aset bernilai tinggi. Kami merealisasikan desain arsitektural Anda dengan presisi struktur, material kelas satu, dan *finishing* tanpa kompromi.',
  heroCta1: 'Diskusikan Rencana Anda', heroCta2: 'Lihat Portofolio',
  slides: [['abc-untar-1', 'a-better-cup-untar'], ['abc-tebet-1', 'a-better-cup-tebet'], ['abc-tebet-5', 'a-better-cup-tebet'], ['rcb-setu-after', 'red-chicken-burger-setu'], ['lavi-render-fasad', 'butik-batik-tulis-lavi'], ['abc-depok-render', 'a-better-cup-depok']].map(([image, project]) => ({ image, project })),
  stats,
  clientsTitle: 'Dipercaya oleh', clientsSub: 'Korporasi nasional & private owner',
  layananTitle: 'Satu mitra untuk *hunian dan ruang usaha.*', layananLead: 'Dari rumah keluarga hingga cafe, butik, dan kantor. Semua dikerjakan dengan RAB transparan dan diawasi site engineer.',
  founderPhoto: 'founder-rahadian-fatrah', founderBadge: 'FOUNDER & CEO KALMER.ID',
  founderTitle: 'Investasi signifikan, butuh *mitra terpercaya.*',
  founderQuote: 'Dalam **10 tahun** di industri konstruksi, saya memahami bahwa membangun rumah impian atau properti komersial bukan pengeluaran biasa, melainkan **keputusan investasi besar**.',
  founderBody: 'Klien kami, dari pemilik bisnis hingga eksekutif, tidak mencari “yang termurah”. Mereka mencari ketenangan pikiran: kepastian bahwa spesifikasi di kontrak adalah apa yang terpasang di lapangan, tanpa *downgrade* diam-diam.',
  founderPull: 'Standar manajemen proyek korporasi yang kami terapkan untuk klien seperti Kapal Api Group, kini kami bawa untuk hunian pribadi Anda.',
  masalahTitle: 'Mengapa proyek gagal di tangan *pemborong biasa?*', masalahLead: 'Bukan sekadar uang yang hilang. Waktu berharga dan kualitas hidup Anda ikut dipertaruhkan.',
  masalahLinkText: 'Baca perbedaannya →', masalahLink: '/blog/kontraktor-vs-pemborong/',
  risks: pairs([['Realita vs Render', 'Desain arsitek yang indah gagal dieksekusi karena kontraktor kurang detail membaca gambar kerja.'], ['Material Downgrade', 'Kualitas besi tulangan atau campuran beton dikurangi demi margin, berujung devaluasi aset Anda.'], ['Beban Manajemen', 'Waktu Anda terlalu berharga untuk mengurus tukang yang mangkir atau progres yang lambat.']]),
  compareBad: 'Pemborong biasa', compareGood: 'Standar Kalmer',
  compare: [
    ['Harga “jebakan” per meter', 'Penawaran global tanpa rincian, memicu biaya siluman saat pembangunan berjalan.', 'RAB detail hingga satuan terkecil', 'Volume, harga satuan, dan merek material tertulis jelas di kontrak.'],
    ['Visual hanya coretan manual', 'Tanpa simulasi 3D, hasil akhir sering meleset dari ekspektasi.', 'Visualisasi 3D akurat', 'Anda melihat hasil akhir sebelum batu pertama diletakkan.'],
    ['Proyek “rahasia” & tertutup', 'Tidak berani mengizinkan kunjungan ke proyek yang sedang berjalan.', 'Proyek terbuka untuk dikunjungi', 'Proyek komersial kami yang sudah selesai terbuka untuk umum; proyek berjalan bisa dikunjungi dengan janji temu.'],
    ['Sistem “one-man show”', 'Tanpa tim sipil dan arsitektur, pengawasan lemah dan asal-asalan.', 'Site engineer + project manager', 'Diawasi engineer, satu pintu komunikasi, laporan progres mingguan.'],
    ['Belum dipercaya klien komersial', 'Tidak terbiasa dengan SOP teknis dan ketepatan waktu kelas korporasi.', 'Standar korporasi', 'Dipercaya Kapal Api Group dan brand komersial nasional.'],
  ].map(([badTitle, badText, goodTitle, goodText]) => ({ badTitle, badText, goodTitle, goodText })),
  keunggulanTitle: 'Visi arsitek, dibangun *presisi di lapangan.*', keunggulanLead: 'Setiap sudut hunian Anda dibangun dengan standar presisi tinggi, layaknya sebuah *masterpiece*.',
  keunggulanImage: 'abc-tebet-3', expNumber: '8+', expText: 'Tahun membangun hunian privat dan ruang komersial di Jabodetabek.',
  keunggulan: pairs([
    ['Presisi Arsitektural', 'Nat keramik presisi, dinding siku, dan instalasi MEP (mekanikal, elektrikal, plumbing) yang rapi dan tersembunyi.'],
    ['Spesifikasi Material Jujur', 'Yang tertulis di RAB adalah yang Anda dapatkan. Brand terpercaya seperti Toto, Sika, dan Holcim.'],
    ['Dedicated Project Manager', 'Komunikasi satu pintu dan laporan progres berkala tanpa perlu setiap hari datang ke lokasi.'],
    ['Estimasi Biaya Detail', 'RAB terperinci hingga satuan terkecil. Tanpa biaya siluman, dengan gambaran cashflow yang akurat.'],
    ['Site Engineer Berkompeten', 'Bukan sekadar mandor. Diawasi engineer yang paham struktur beton bertulang dan utilitas modern.'],
    ['High-End Finishing', 'Marmer, granit, smart home system, hingga custom furniture dikerjakan oleh tenaga spesialis.'],
  ]),
  prosesTitle: 'Sistematis, transparan, *terukur.*', prosesLead: 'Enam tahap baku di setiap proyek, dari konsultasi pertama hingga serah terima kunci.',
  steps: pairs([
    ['Konsultasi', 'Memahami visi, kebutuhan ruang, dan anggaran Anda. Gratis via Zoom atau telepon.'],
    ['Survey lokasi', 'Pengukuran detail dan analisa kondisi lapangan, menghasilkan denah eksisting.'],
    ['Desain & RAB', 'Visualisasi 3D, gambar kerja, dan RAB terperinci per item.'],
    ['Kontrak', 'SPK yang memuat RAB, jadwal Kurva S, dan termin pembayaran.'],
    ['Konstruksi', 'Diawasi site engineer, dengan laporan progres mingguan.'],
    ['Serah terima', 'Pengecekan akhir, as-built drawing, dan aktivasi garansi.'],
  ]),
  portfolioTitle: 'Dedikasi pada kualitas & *detail di setiap proyek.*',
  portfolioTabs: ['a-better-cup-tebet', 'a-better-cup-untar', 'red-chicken-burger-setu', 'butik-batik-tulis-lavi'],
  testimoniTitle: 'Apa kata *mereka?*', testimoniLead: 'Kepuasan klien dan kualitas hasil akhir adalah bukti komitmen kami, langsung dari lapangan.',
  testimonials: testimonials.map((t) => ({ yt: t.yt, title: t.title, text: t.text, project: t.project || '' })),
  shortsTitle: 'Liputan proyek dalam video singkat.', shorts,
  galeriTitle: 'Serah terima & *galeri proyek.*', galeriCats: ['serah', 'hunian', 'struktur'], galeriPerCat: 4,
  berjalanTitle: 'Sedang *kami kerjakan.*', berjalanLead: 'Dedikasi kami di berbagai titik Jabodetabek. Ingin melihat langsung? Jadwalkan kunjungan proyek.',
  ongoing: ongoing.map((o) => ({ name: o.name, scope: o.scope, type: o.type, city: o.city || '', project: o.project || '' })),
  blogTitle: 'Sebelum Anda *mulai membangun.*',
  ctaTitle: 'Aset masa depan Anda, *dimulai dari sini.*',
  ctaNote: 'Untuk menjaga standar pengawasan, kami membatasi jumlah proyek aktif setiap tahun. Hubungi kami untuk ketersediaan jadwal.',
  ctaBoxTitle: 'Jadwalkan konsultasi', ctaBoxText: 'Langsung dengan arsitek & engineer Kalmer. Konsultasi awal gratis.', ctaImage: 'abc-untar-2',
  faqTitle: 'Pertanyaan yang *sering diajukan.*', faqLead: 'Jawaban transparan untuk keraguan Anda sebelum memulai proyek.', faqs,
}, 'migrasi');

docs.put('settings', 'pages', {
  layananMetaTitle: 'Layanan Kontraktor Bangun, Renovasi & Komersial | Kalmer', layananMetaDesc: 'Layanan Kalmer: jasa bangun rumah, renovasi rumah total, kontraktor cafe & F&B, serta konstruksi ruko, kantor, dan ruang komersial di Jabodetabek.',
  layananTitle: 'Layanan konstruksi *dari rumah hingga ruang usaha.*', layananLead: 'Empat layanan utama, satu standar kerja: RAB transparan, site engineer di setiap proyek, dan laporan progres mingguan.', layananCover: 'abc-tebet-4',
  areaMetaTitle: 'Area Layanan Kontraktor Kalmer di Jabodetabek', areaMetaDesc: 'Kalmer melayani bangun dan renovasi rumah serta proyek komersial di Jakarta, Bekasi, Depok, Tangerang, dan Bogor. Lihat proyek kami di setiap kota.',
  areaTitle: 'Melayani seluruh *Jabodetabek.*', areaLead: 'Kami membatasi area kerja di Jabodetabek agar setiap proyek tetap terjangkau pengawasan langsung dari tim pusat di Bekasi.', areaCover: 'galeri-12',
  portoMetaTitle: 'Portofolio Kontraktor: Cafe, Butik, Rumah Mewah | Kalmer', portoMetaDesc: 'Studi kasus proyek Kalmer: A Better Cup Tebet & Untar, Red Chicken Burger Setu, Butik Batik Tulis Lavi, serta galeri serah terima rumah di Jabodetabek.',
  portoTitle: 'Portofolio *dan studi kasus.*', portoLead: 'Proyek komersial kami yang sudah selesai terbuka untuk umum. Silakan kunjungi dan lihat langsung kualitas finishing kami.', portoCover: 'abc-tebet-1',
  galeriMetaTitle: 'Galeri Foto Proyek Kontraktor Kalmer Jabodetabek', galeriMetaDesc: 'foto proyek Kalmer: cafe dan ruang komersial, interior rumah, serah terima kunci, desain 3D, progres lapangan, dan struktur baja.',
  galeriTitle: 'Galeri *proyek kami.*', galeriLead: 'foto dari lapangan: hasil akhir, serah terima kunci, desain 3D, hingga proses konstruksi. Klik foto untuk melihat ukuran penuh.', galeriCover: 'abc-tebet-6',
  blogMetaTitle: 'Blog & Panduan Membangun Rumah dan Renovasi | Kalmer', blogMetaDesc: 'Panduan dari kontraktor: cara membaca RAB, lama membangun rumah, sistem pembayaran termin, garansi bangunan, dan tips memilih kontraktor.',
  blogTitle: 'Panduan sebelum *Anda membangun.*', blogLead: 'Jawaban jujur atas pertanyaan yang paling sering kami terima dari calon klien.', blogCover: 'lavi-render-3',
  hubText: 'Satu pintu untuk segala kebutuhan bangunan Anda.',
}, 'migrasi');

// ---------- koleksi ----------
services.forEach((s, i) => docs.put('services', s.slug, {
  name: s.name, short: s.short, metaTitle: s.metaTitle, metaDesc: s.metaDesc, h1: toEm(s.h1), lead: toEm(s.lead), cover: s.cover, icon: s.icon,
  intro: s.intro.trim(), problemsTitle: s.problems ? 'Jangan biarkan kontraktor *menghambat bisnis Anda.*' : '', problems: pairs(s.problems), includes: pairs(s.includes), docs: pairs(s.docs), faqs: s.faqs, posts: s.posts,
}, 'migrasi', i));

locations.forEach((l, i) => docs.put('locations', l.slug, {
  name: l.name, metaTitle: l.metaTitle, metaDesc: l.metaDesc, h1: toEm(l.h1), lead: toEm(l.lead), cover: l.cover, body: l.body.trim(), areas: l.areas,
  photos: l.slug === 'bekasi' ? ['serah-terima-bekasi', 'serah-terima-1', 'serah-terima-3', 'serah-terima-4'] : [],
}, 'migrasi', i));

const TAB = { 'a-better-cup-tebet': 'ABC Tebet', 'a-better-cup-untar': 'ABC Untar', 'red-chicken-burger-setu': 'Red Chicken Burger Setu', 'butik-batik-tulis-lavi': 'Butik Lavi' };
projects.forEach((p, i) => docs.put('projects', p.slug, {
  name: p.name, title: p.title, tabLabel: TAB[p.slug] || '', category: p.category, chip: p.chip, status: p.status, location: p.location, city: p.city || '', services: p.services,
  summary: p.summary, cover: p.cover, gallery: p.gallery || [], progress: p.progress || [], before: p.before || '', after: p.after || '',
  beforeLabel: p.beforeLabel || '', afterLabel: p.afterLabel || '', video: p.video || '', facts: (p.facts || []).map(([k, v]) => ({ k, v })), body: p.body.trim(),
}, 'migrasi', i));

posts.forEach((p, i) => docs.put('posts', p.slug, {
  title: p.title, status: 'published', date: p.date, updated: p.updated || '', author: '', metaTitle: p.metaTitle, description: p.description, cover: p.cover, service: p.service, body: p.body.trim(),
}, 'migrasi', i));

Object.entries(clientLogos).forEach(([slug, l], i) => docs.put('clients', `k${i + 1}`, { name: slug === 'klien-kapal-api' ? 'Kapal Api Global' : `Klien ${i + 1}`, logo: slug, big: slug === 'klien-kapal-api' }, 'migrasi', i));

[['/cafe/', '/layanan/kontraktor-cafe/'], ['/komersil/', '/layanan/kontraktor-komersial/'], ['/home/', '/'], ['/hello-world/', '/blog/'], ['/vendor/', '/hub/'], ['/wp-sitemap.xml', '/sitemap.xml'], ['/feed/', '/blog/']]
  .forEach(([from, to], i) => docs.put('redirects', `r${i + 1}`, { from, to }, 'migrasi', i));

console.log(`✔ Migrasi selesai: ${db.prepare('SELECT COUNT(*) AS n FROM docs').get().n} dokumen konten.`);
