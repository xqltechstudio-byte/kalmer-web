// Generator situs statis Kalmer.
//   node build.mjs      → hasil di folder dist/
// Tidak ada dependensi selain Node.js. Semua konten ada di src/data/*.mjs.

import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { site, wa, stats, testimonials, shorts, ongoing, faqs } from './src/data/site.mjs';
import { images, clientLogos } from './src/data/images.mjs';
import { projects } from './src/data/projects.mjs';
import { services } from './src/data/services.mjs';
import { locations } from './src/data/locations.mjs';
import { posts } from './src/data/posts.mjs';

const ROOT = import.meta.dirname;
const DIST = path.join(ROOT, 'dist');
const meta = JSON.parse(await fs.readFile(path.join(ROOT, 'src/data/image-meta.json'), 'utf8'));
const BUILD_DATE = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Jakarta' }); // YYYY-MM-DD, WIB

// ---------- utilitas ----------
const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const strip = (s = '') => String(s).replace(/<[^>]+>/g, '');
const abs = (p) => site.url + p;
const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const tanggal = (d) => { const [y, m, dd] = d.split('-'); return `${+dd} ${BULAN[+m - 1]} ${y}`; };
const readTime = (h) => Math.max(1, Math.round(strip(h).split(/\s+/).length / 200));
const bySlug = (arr) => Object.fromEntries(arr.map((x) => [x.slug, x]));
const P = bySlug(projects), S = bySlug(services), L = bySlug(locations), POST = bySlug(posts);
const urls = { service: (s) => `/layanan/${s}/`, location: (s) => `/kontraktor-${s}/`, project: (s) => `/portofolio/${s}/`, post: (s) => `/blog/${s}/` };

function img(slug, o = {}) {
  const m = meta[slug];
  if (!m) throw new Error('Gambar tidak dikenal: ' + slug);
  const set = m.sizes.map((w) => `/img/${slug}-${w}.webp ${w}w`).join(', ');
  const max = m.sizes[m.sizes.length - 1];
  const src = `/img/${slug}-${m.sizes[0]}.webp`;
  const w = m.sizes[0], h = Math.round((m.h * w) / m.w);
  const alt = o.alt ?? images[slug]?.alt ?? '';
  const load = o.eager ? 'fetchpriority="high" decoding="sync"' : 'loading="lazy" decoding="async"';
  const srcAttrs = o.defer ? `data-src="${src}" data-srcset="${set}"` : `src="${src}" srcset="${set}"`;
  return `<img ${srcAttrs} sizes="${o.sizes || '100vw'}" width="${w}" height="${h}" alt="${esc(alt)}" ${load} data-full="/img/${slug}-${max}.webp"${o.cls ? ` class="${o.cls}"` : ''}${o.attrs ? ' ' + o.attrs : ''}>`;
}
const ogImg = (slug) => (images[slug]?.og ? `/img/og/${slug}.jpg` : '/img/og/abc-untar-1.jpg');

const icon = {
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/></svg>',
  tool: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z"/></svg>',
  cup: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M4 8h13v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M17 10h1.5a2.5 2.5 0 0 1 0 5H17"/><path d="M8 2.5v2M11.5 2.5v2"/></svg>',
  building: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M4 21V5l8-3v19M12 8l8 3v10"/><path d="M2 21h20M7.5 8h1M7.5 12h1M7.5 16h1M15.5 13h1M15.5 17h1"/></svg>',
  wa: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 21l2.1-5.6A8.4 8.4 0 1 1 21 11.5z"/></svg>',
};

// ---------- JSON-LD ----------
const BIZ_ID = site.url + '/#business';
const business = {
  '@type': 'GeneralContractor', '@id': BIZ_ID,
  name: site.legalName, alternateName: site.name, url: site.url + '/',
  logo: abs('/img/logo.png'), image: abs('/img/og/abc-untar-1.jpg'),
  description: site.description, telephone: site.phone, email: site.email,
  address: { '@type': 'PostalAddress', streetAddress: site.address.street, addressLocality: site.address.locality, addressRegion: site.address.region, postalCode: site.address.postal, addressCountry: site.address.country },
  areaServed: site.areaServed.map((name) => ({ '@type': 'City', name })),
  openingHoursSpecification: site.hours.map((h) => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: h.days, opens: h.opens, closes: h.closes })),
  founder: { '@type': 'Person', name: site.founder.name, jobTitle: site.founder.role },
  sameAs: site.social.map((s) => s.url),
};
const breadcrumbLd = (items) => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, url], i) => ({ '@type': 'ListItem', position: i + 1, name, item: abs(url) })),
});
const faqLd = (list) => ({ '@type': 'FAQPage', mainEntity: list.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) });

// ---------- potongan layout ----------
const NAV = [['/layanan/', 'Layanan'], ['/portofolio/', 'Portofolio'], ['/area-layanan/', 'Area'], ['/blog/', 'Blog'], ['/#faq', 'FAQ']];

function header(active) {
  return `
<a class="skip" href="#main">Langsung ke konten</a>
<div class="topbar">
  <div class="wrap">
    <div class="l"><span><b>●</b> Melayani Jabodetabek</span><span class="hide-m">${esc(site.hours[0].label)}</span></div>
    <div class="l"><a class="hide-m" href="mailto:${site.email}">${site.email}</a><a href="${wa()}" target="_blank" rel="noopener"><b>●</b> ${site.phoneDisplay}</a></div>
  </div>
</div>
<header class="nav" id="nav">
  <div class="wrap">
    <a href="/" class="logo" aria-label="Kalmer, ke beranda">
      <img src="/img/logo.webp" width="${meta.logo.w}" height="${meta.logo.h}" alt="Logo Kalmer Multi Teknik">
      <span class="lt"><b>${site.legalName}</b>General Contractor</span>
    </a>
    <nav class="nav-links" id="navLinks" aria-label="Menu utama">
      ${NAV.map(([href, label]) => `<a href="${href}"${active && href.startsWith(active) ? ' aria-current="page"' : ''}>${label}</a>`).join('\n      ')}
    </nav>
    <a class="btn btn-primary" href="${wa()}" target="_blank" rel="noopener">Konsultasi Gratis</a>
    <button class="burger" id="burger" aria-label="Buka menu" aria-expanded="false" aria-controls="navLinks"><span></span><span></span><span></span></button>
  </div>
</header>`;
}

function footer() {
  return `
<footer class="bg-ink grid-d">
  <div class="wrap">
    <div class="foot">
      <div>
        <a href="/" class="logo logo-box"><img src="/img/logo.webp" width="${meta.logo.w}" height="${meta.logo.h}" alt="Logo Kalmer Multi Teknik" loading="lazy"></a>
        <p style="margin-top:22px;max-width:360px">Kontraktor premium di Jabodetabek. Membangun hunian mewah dan properti komersial dengan RAB transparan dan pengawasan site engineer.</p>
        <p style="margin-top:16px">${site.hours.map((h) => esc(h.label)).join('<br>')}</p>
      </div>
      <div>
        <h2 class="h5">Layanan</h2>
        <ul>${services.map((s) => `<li><a href="${urls.service(s.slug)}">${esc(s.name)}</a></li>`).join('')}<li><a href="/portofolio/">Portofolio</a></li><li><a href="/blog/">Blog & Panduan</a></li></ul>
      </div>
      <div>
        <h2 class="h5">Area Layanan</h2>
        <ul>${locations.map((l) => `<li><a href="${urls.location(l.slug)}">Kontraktor ${esc(l.name)}</a></li>`).join('')}</ul>
      </div>
      <div>
        <h2 class="h5">Hubungi Kami</h2>
        <ul>
          <li>${esc(site.address.short)}</li>
          <li><a href="${wa()}" target="_blank" rel="noopener">${site.phoneDisplay}</a></li>
          <li><a href="mailto:${site.email}">${site.email}</a></li>
          ${site.social.map((s) => `<li><a href="${s.url}" target="_blank" rel="noopener">${s.name} · ${esc(s.handle)}</a></li>`).join('\n          ')}
        </ul>
      </div>
    </div>
    <div class="copy"><span>© ${new Date().getFullYear()} ${site.legalName}</span><span>General Contractor · Jabodetabek</span></div>
  </div>
</footer>
<a class="wa" href="${wa('Halo Kalmer, saya tertarik konsultasi bangun/renovasi.')}" target="_blank" rel="noopener" aria-label="Chat WhatsApp Kalmer">
  <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3a13 13 0 0 0-11.2 19.6L3 29l6.6-1.7A13 13 0 1 0 16 3zm0 23.6a10.6 10.6 0 0 1-5.4-1.5l-.4-.2-3.9 1 1-3.8-.3-.4A10.6 10.6 0 1 1 16 26.6zm5.8-7.9c-.3-.2-1.9-.9-2.2-1s-.5-.2-.7.2-.8 1-1 1.2-.4.2-.7 0a8.7 8.7 0 0 1-4.3-3.8c-.3-.6.3-.5 1-1.7.1-.2 0-.4 0-.5l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6a1.2 1.2 0 0 0-.9.4 3.6 3.6 0 0 0-1.1 2.7 6.3 6.3 0 0 0 1.3 3.3 14.4 14.4 0 0 0 5.5 4.9c2 .9 2.9 1 3.9.8a3.4 3.4 0 0 0 2.2-1.6 2.8 2.8 0 0 0 .2-1.6c-.1-.2-.3-.3-.6-.4z"/></svg>
</a>
<div class="lb" id="lb" role="dialog" aria-modal="true" aria-label="Galeri foto">
  <button class="c" aria-label="Tutup">✕</button><button class="p" aria-label="Foto sebelumnya">‹</button>
  <img alt=""><button class="n" aria-label="Foto berikutnya">›</button><div class="cnt"></div>
</div>`;
}

let ASSETS; // diisi saat build: nama file CSS/JS ber-hash

function layout(p) {
  const title = p.title;
  const canonical = abs(p.path);
  const og = abs(p.ogImage || '/img/og/abc-untar-1.jpg');
  const graph = { '@context': 'https://schema.org', '@graph': [business, { '@type': 'WebSite', '@id': site.url + '/#website', url: site.url + '/', name: site.name, inLanguage: 'id-ID', publisher: { '@id': BIZ_ID } }, ...(p.ld || [])] };
  const pixel = site.metaPixelId ? `
<script>addEventListener('load',function(){setTimeout(function(){!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${site.metaPixelId}');fbq('track','PageView');},1500)});</script>` : '';
  const ga = site.ga4Id ? `
<script async src="https://www.googletagmanager.com/gtag/js?id=${site.ga4Id}"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${site.ga4Id}');</script>` : '';
  return `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(p.description)}">
<link rel="canonical" href="${canonical}">
<meta name="robots" content="${p.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large'}">
<meta property="og:type" content="${p.ogType || 'website'}">
<meta property="og:locale" content="id_ID">
<meta property="og:site_name" content="${site.legalName}">
<meta property="og:title" content="${esc(p.ogTitle || title)}">
<meta property="og:description" content="${esc(p.description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${og}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#0b0f12">
${site.googleSiteVerification ? `<meta name="google-site-verification" content="${site.googleSiteVerification}">\n` : ''}<link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,400;1,500;1,600&family=Manrope:wght@300;400;500;600;700&display=swap" rel="stylesheet">
${p.preload || ''}<link rel="stylesheet" href="/assets/${ASSETS.css}">
<script>document.documentElement.classList.add('js')</script>
<script type="application/ld+json">${JSON.stringify(graph)}</script>${ga}
</head>
<body style="margin:0">
<div class="kx">
${p.bare ? '' : header(p.active)}
<main id="main">
${p.body}
</main>
${p.bare ? '' : footer()}
</div>
<script src="/assets/${ASSETS.js}" defer></script>${pixel}
</body>
</html>
`;
}

// ---------- komponen bersama ----------
const crumbs = (items) => `<ol class="crumbs">${items.map(([n, u], i) => i === items.length - 1 ? `<li aria-current="page">${esc(n)}</li>` : `<li><a href="${u}">${esc(n)}</a></li>`).join('')}</ol>`;

const pageHero = ({ items, h1, lead, cover, cta = true, extra = '' }) => `
<section class="page-hero">
  ${cover ? img(cover, { cls: 'bgimg', eager: true, alt: '' }) : ''}
  <div class="wrap">
    ${crumbs(items)}
    <h1>${h1}</h1>
    ${lead ? `<p class="lead">${lead}</p>` : ''}
    ${extra}
    ${cta ? `<div class="hero-cta"><a class="btn btn-primary" href="${wa()}" target="_blank" rel="noopener">${icon.wa} Konsultasi Gratis</a><a class="btn btn-ghost" href="/portofolio/">Lihat Portofolio →</a></div>` : ''}
  </div>
</section>`;

const STEPS = [
  ['Konsultasi', 'Memahami visi, kebutuhan ruang, dan anggaran Anda. Gratis via Zoom atau telepon.'],
  ['Survey lokasi', 'Pengukuran detail dan analisa kondisi lapangan, menghasilkan denah eksisting.'],
  ['Desain & RAB', 'Visualisasi 3D, gambar kerja, dan RAB terperinci per item.'],
  ['Kontrak', 'SPK yang memuat RAB, jadwal Kurva S, dan termin pembayaran.'],
  ['Konstruksi', 'Diawasi site engineer, dengan laporan progres mingguan.'],
  ['Serah terima', 'Pengecekan akhir, as-built drawing, dan aktivasi garansi.'],
];
const stepsSection = (bg = 'bg-paper', no = '') => `
<section class="${bg}" id="proses">
  <div class="wrap">
    <div class="head split reveal">
      <div><span class="sec-no">${no ? `<b>${no}</b>` : ''}Alur kerja</span><h2 class="h2">Sistematis, transparan, <em>terukur.</em></h2></div>
      <p class="lead">Enam tahap baku di setiap proyek, dari konsultasi pertama hingga serah terima kunci.</p>
    </div>
    <div class="steps reveal">
      ${STEPS.map(([t, d], i) => `<div class="step"><div class="num">${String(i + 1).padStart(2, '0')}</div><h3>${t}</h3><p>${d}</p></div>`).join('\n      ')}
    </div>
  </div>
</section>`;

const faqSection = (list, { title = 'Pertanyaan yang <em>sering diajukan.</em>', no = '' } = {}) => `
<section class="bg-paper" id="faq">
  <div class="wrap faq">
    <div class="reveal">
      <span class="sec-no">${no ? `<b>${no}</b>` : ''}FAQ</span>
      <h2 class="h2">${title}</h2>
      <p class="lead">Jawaban transparan untuk keraguan Anda sebelum memulai proyek.</p>
      <a class="btn btn-primary" style="margin-top:32px" href="${wa()}" target="_blank" rel="noopener">Tanya via WhatsApp →</a>
    </div>
    <div class="faq-list reveal">
      ${list.map((f, i) => `<details${i === 0 ? ' open' : ''}><summary><i>Q.${String(i + 1).padStart(2, '0')}</i>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('\n      ')}
    </div>
  </div>
</section>`;

const ctaSection = (h = 'Aset masa depan Anda, <em>dimulai dari sini.</em>', msg) => `
<section class="cta-sec" id="konsultasi">
  <div class="wrap">
    <div class="cta">
      <div class="reveal">
        <span class="sec-no">Prioritas kualitas</span>
        <h2 style="margin-top:18px">${h}</h2>
        <p class="note">Untuk menjaga standar pengawasan, kami membatasi jumlah proyek aktif setiap tahun. Hubungi kami untuk ketersediaan jadwal.</p>
      </div>
      <div class="cta-box marks reveal">
        <h3>Jadwalkan konsultasi</h3>
        <p>Langsung dengan arsitek & engineer Kalmer. Konsultasi awal gratis.</p>
        <a class="btn" href="${wa(msg)}" target="_blank" rel="noopener">${icon.wa} Hubungi WhatsApp Kami</a>
        <div class="bonus"><b>Respon cepat</b><ul>${site.hours.map((h) => `<li>${esc(h.label)}</li>`).join('')}</ul></div>
      </div>
    </div>
  </div>
</section>`;

const projectCard = (p, sizes = '(max-width:640px) 100vw, (max-width:1000px) 50vw, 33vw') => `
<a class="card reveal" href="${urls.project(p.slug)}">
  <div class="ph">${img(p.cover, { sizes })}</div>
  <span class="chip">${esc(p.status)}</span>
  <h3>${esc(p.name)}</h3>
  <span class="loc">${esc(p.location)}</span>
  <p>${esc(p.summary)}</p>
  <span class="more">Lihat studi kasus</span>
</a>`;

const postCard = (p) => `
<a class="card reveal" href="${urls.post(p.slug)}">
  <div class="ph">${img(p.cover, { sizes: '(max-width:640px) 100vw, (max-width:1000px) 50vw, 33vw', alt: '' })}</div>
  <span class="loc">${tanggal(p.date)} · ${readTime(p.body)} menit baca</span>
  <h3>${esc(p.title)}</h3>
  <p>${esc(p.description)}</p>
  <span class="more">Baca artikel</span>
</a>`;

const svcCards = () => `
<div class="svc-cards reveal">
  ${services.map((s) => `<a class="svc-card" href="${urls.service(s.slug)}"><span class="ic">${icon[s.icon]}</span><h3>${esc(s.name)}</h3><p>${esc(strip(s.lead))}</p><span class="more">Selengkapnya</span></a>`).join('\n  ')}
</div>`;

const board = (list) => `
<div class="board reveal">
  <div class="brow hd"><span>No</span><span>Lokasi</span><span>Lingkup</span><span>Kategori</span><span>Status</span></div>
  ${list.map((o, i) => `<div class="brow"><span class="no">${String(i + 1).padStart(2, '0')}</span><h3 class="h4">${o.project ? `<a href="${urls.project(o.project)}">${esc(o.name)}</a>` : esc(o.name)}</h3><span class="d">${esc(o.scope)}</span><span><span class="chip${o.type === 'Residential' ? ' b' : o.type === 'Investment' ? ' g' : o.type === 'Luxury' ? ' k' : ''}">${o.type}</span></span><span class="status"><span class="pulse"></span>ON PROGRESS</span></div>`).join('\n  ')}
</div>`;

const areaTags = (exclude) => `<ul class="tags">${locations.filter((l) => l.slug !== exclude).map((l) => `<li><a href="${urls.location(l.slug)}">Kontraktor ${esc(l.name)}</a></li>`).join('')}</ul>`;

const gallery = (slugs, group, sizes = '(max-width:900px) 50vw, 25vw') =>
  `<div class="masonry" data-group="${group}">${slugs.map((s) => img(s, { sizes, attrs: images[s].cat ? `data-cat="${images[s].cat}"` : '' })).join('')}</div>`;

const beforeAfter = (b, a, lb = 'Sebelum', la = 'Sesudah') => `
<div class="ba">
  ${img(b, { sizes: '(max-width:900px) 100vw, 66vw' })}
  ${img(a, { sizes: '(max-width:900px) 100vw, 66vw', cls: 'after' })}
  <span class="lbl l">${lb}</span><span class="lbl r">${la}</span>
  <div class="bar"></div>
  <input type="range" min="0" max="100" value="50" aria-label="Geser untuk membandingkan ${lb.toLowerCase()} dan ${la.toLowerCase()}">
</div>
<p class="ba-hint">← Geser untuk membandingkan →</p>`;

// ---------- halaman ----------
const pages = [];
const add = (p) => pages.push(p);

// HOMEPAGE
{
  const slides = [
    ['abc-untar-1', 'a-better-cup-untar'], ['abc-tebet-1', 'a-better-cup-tebet'], ['abc-tebet-5', 'a-better-cup-tebet'],
    ['rcb-setu-after', 'red-chicken-burger-setu'], ['lavi-render-fasad', 'butik-batik-tulis-lavi'], ['abc-depok-render', 'a-better-cup-depok'],
  ];
  const tabs = ['a-better-cup-tebet', 'a-better-cup-untar', 'red-chicken-burger-setu', 'butik-batik-tulis-lavi'].map((s) => P[s]);
  const galeriSlugs = Object.keys(images).filter((s) => images[s].cat);
  const body = `
<section class="hero" id="top" aria-roledescription="carousel" aria-label="Proyek pilihan Kalmer">
  <div class="hs-slides">
    ${slides.map(([im, pr], i) => `<div class="hs-slide${i === 0 ? ' active' : ''}" data-goto="${pr}" data-href="${urls.project(pr)}" data-title="${esc(P[pr].name)}" data-loc="${esc(P[pr].location)}" aria-roledescription="slide" aria-label="${i + 1} dari ${slides.length}">${img(im, { eager: i === 0, defer: i > 0, sizes: '100vw' })}</div>`).join('\n    ')}
  </div>
  <div class="hero-shade"></div>
  <div class="hero-main">
    <div class="wrap">
      <div class="hero-text">
        <h1 class="tag"><b>Kontraktor Premium</b><span>Rumah &amp; Komersial · Jabodetabek</span></h1>
        <p class="display">Wujudkan hunian <em>warisan masa depan.</em></p>
        <p class="sub">Bukan sekadar bangunan, tapi aset bernilai tinggi. Kami merealisasikan desain arsitektural Anda dengan presisi struktur, material kelas satu, dan <em>finishing</em> tanpa kompromi.</p>
        <div class="hero-cta">
          <a class="btn btn-primary" href="${wa()}" target="_blank" rel="noopener">${icon.wa} Diskusikan Rencana Anda</a>
          <a class="btn btn-ghost" href="/portofolio/">Lihat Portofolio →</a>
        </div>
      </div>
    </div>
  </div>
  <div class="hero-bar">
    <div class="hs-progress"><i></i></div>
    <div class="wrap">
      <div class="stats">
        ${stats.map((s) => `<div class="stat"><div class="n">${s.n}<span>${s.suffix}</span></div><div class="l">${s.label}</div></div>`).join('\n        ')}
      </div>
      <div class="hs-ctrl">
        <div class="hs-count"><b class="cur">01</b>/ <span class="tot">0${slides.length}</span></div>
        <a class="hs-now" href="${urls.project(slides[0][1])}"><span class="t">${esc(P[slides[0][1]].name)}</span><span class="l">${esc(P[slides[0][1]].location)}</span></a>
        <div class="arrows"><button class="hs-prev" aria-label="Proyek sebelumnya">‹</button><button class="hs-next" aria-label="Proyek berikutnya">›</button></div>
      </div>
    </div>
  </div>
</section>

<div class="clients">
  <div class="wrap">
    <p><b>Dipercaya oleh</b>Korporasi nasional &amp; private owner</p>
    <div class="marquee"><div class="track" id="track">
      ${Object.entries(clientLogos).map(([s, l]) => `<img${s === 'klien-kapal-api' ? ' class="big"' : ''} src="/img/${s}.webp" width="${meta[s].w}" height="${meta[s].h}" alt="${esc(l.alt)}" loading="lazy">`).join('')}
    </div></div>
  </div>
</div>

<section class="bg-paper" id="layanan">
  <div class="wrap">
    <div class="head split reveal">
      <div><span class="sec-no"><b>01</b>Layanan</span><h2 class="h2">Satu mitra untuk <em>hunian dan ruang usaha.</em></h2></div>
      <p class="lead">Dari rumah keluarga hingga cafe, butik, dan kantor. Semua dikerjakan dengan RAB transparan dan diawasi site engineer.</p>
    </div>
    ${svcCards()}
  </div>
</section>

<section class="bg-paper" style="padding-top:0">
  <div class="wrap founder">
    <div class="founder-photo marks reveal">
      ${img('founder-rahadian-fatrah', { sizes: '(max-width:900px) 100vw, 45vw' })}
      <div class="badge"><strong>${site.founder.name}</strong><span>FOUNDER &amp; CEO KALMER.ID</span></div>
    </div>
    <div class="reveal">
      <span class="sec-no"><b>02</b>Founder's Commitment</span>
      <h2 class="h2">Investasi signifikan, butuh <em>mitra terpercaya.</em></h2>
      <blockquote>“Dalam <b>10 tahun</b> di industri konstruksi, saya memahami bahwa membangun rumah impian atau properti komersial bukan pengeluaran biasa, melainkan <b>keputusan investasi besar</b>.”</blockquote>
      <p class="body">Klien kami, dari pemilik bisnis hingga eksekutif, tidak mencari “yang termurah”. Mereka mencari ketenangan pikiran: kepastian bahwa spesifikasi di kontrak adalah apa yang terpasang di lapangan, tanpa <em>downgrade</em> diam-diam.</p>
      <div class="pull">Standar manajemen proyek korporasi yang kami terapkan untuk klien seperti Kapal Api Group, kini kami bawa untuk hunian pribadi Anda.</div>
    </div>
  </div>
</section>

<section class="bg-bp grid-bp" id="masalah">
  <div class="wrap">
    <div class="head split reveal">
      <div><span class="sec-no"><b>03</b>Risiko terbesar konstruksi</span><h2 class="h2">Mengapa proyek gagal di tangan <em>pemborong biasa?</em></h2></div>
      <p class="lead">Bukan sekadar uang yang hilang. Waktu berharga dan kualitas hidup Anda ikut dipertaruhkan. <a href="/blog/kontraktor-vs-pemborong/" style="color:#e9c9a0;text-decoration:underline">Baca perbedaannya →</a></p>
    </div>
    <div class="risks reveal">
      <div class="risk"><div class="no">Risk / 01</div><h3>Realita vs Render</h3><p>Desain arsitek yang indah gagal dieksekusi karena kontraktor kurang detail membaca gambar kerja.</p></div>
      <div class="risk"><div class="no">Risk / 02</div><h3>Material Downgrade</h3><p>Kualitas besi tulangan atau campuran beton dikurangi demi margin, berujung devaluasi aset Anda.</p></div>
      <div class="risk"><div class="no">Risk / 03</div><h3>Beban Manajemen</h3><p>Waktu Anda terlalu berharga untuk mengurus tukang yang mangkir atau progres yang lambat.</p></div>
    </div>
    <div class="compare reveal">
      <div class="crow hd"><div>✕ Pemborong biasa</div><div>✓ Standar Kalmer</div></div>
      ${[
        ['Harga “jebakan” per meter', 'Penawaran global tanpa rincian, memicu biaya siluman saat pembangunan berjalan.', 'RAB detail hingga satuan terkecil', 'Volume, harga satuan, dan merek material tertulis jelas di kontrak.'],
        ['Visual hanya coretan manual', 'Tanpa simulasi 3D, hasil akhir sering meleset dari ekspektasi.', 'Visualisasi 3D akurat', 'Anda melihat hasil akhir sebelum batu pertama diletakkan.'],
        ['Proyek “rahasia” &amp; tertutup', 'Tidak berani mengizinkan kunjungan ke proyek yang sedang berjalan.', 'Proyek terbuka untuk dikunjungi', 'Proyek komersial kami yang sudah selesai terbuka untuk umum; proyek berjalan bisa dikunjungi dengan janji temu.'],
        ['Sistem “one-man show”', 'Tanpa tim sipil dan arsitektur, pengawasan lemah dan asal-asalan.', 'Site engineer + project manager', 'Diawasi engineer, satu pintu komunikasi, laporan progres mingguan.'],
        ['Belum dipercaya klien komersial', 'Tidak terbiasa dengan SOP teknis dan ketepatan waktu kelas korporasi.', 'Standar korporasi', 'Dipercaya Kapal Api Group dan brand komersial nasional.'],
      ].map(([a, b, c, d]) => `<div class="crow"><div><span class="x" aria-hidden="true">✕</span><div><h3 class="h4">${a}</h3><p>${b}</p></div></div><div><span class="v" aria-hidden="true">✓</span><div><h3 class="h4">${c}</h3><p>${d}</p></div></div></div>`).join('\n      ')}
    </div>
  </div>
</section>

<section class="bg-ink" id="keunggulan">
  <div class="wrap">
    <div class="head split reveal">
      <div><span class="sec-no"><b>04</b>Keunggulan</span><h2 class="h2">Visi arsitek, dibangun <em>presisi di lapangan.</em></h2></div>
      <p class="lead">Setiap sudut hunian Anda dibangun dengan standar presisi tinggi, layaknya sebuah <em>masterpiece</em>.</p>
    </div>
    <div class="svc-media reveal">
      ${img('abc-tebet-3', { sizes: '(max-width:900px) 100vw, 60vw' })}
      <div class="exp"><span class="k">EST. EXPERIENCE</span><div class="n">8+</div><p>Tahun membangun hunian privat dan ruang komersial di Jabodetabek.</p></div>
    </div>
    <div class="svc-grid">
      ${[
        ['Presisi Arsitektural', 'Nat keramik presisi, dinding siku, dan instalasi MEP (mekanikal, elektrikal, plumbing) yang rapi dan tersembunyi.'],
        ['Spesifikasi Material Jujur', 'Yang tertulis di RAB adalah yang Anda dapatkan. Brand terpercaya seperti Toto, Sika, dan Holcim.'],
        ['Dedicated Project Manager', 'Komunikasi satu pintu dan laporan progres berkala tanpa perlu setiap hari datang ke lokasi.'],
        ['Estimasi Biaya Detail', 'RAB terperinci hingga satuan terkecil. Tanpa biaya siluman, dengan gambaran cashflow yang akurat.'],
        ['Site Engineer Berkompeten', 'Bukan sekadar mandor. Diawasi engineer yang paham struktur beton bertulang dan utilitas modern.'],
        ['High-End Finishing', 'Marmer, granit, smart home system, hingga custom furniture dikerjakan oleh tenaga spesialis.'],
      ].map(([t, d], i) => `<div class="svc reveal"><div class="top"><span class="no">0${i + 1}</span></div><h3>${t}</h3><p>${d}</p></div>`).join('\n      ')}
    </div>
  </div>
</section>

${stepsSection('bg-paper', '05')}

<section class="bg-ink grid-d" id="portofolio">
  <div class="wrap">
    <div class="head split reveal">
      <div><span class="sec-no"><b>06</b>Portofolio pilihan</span><h2 class="h2">Dedikasi pada kualitas &amp; <em>detail di setiap proyek.</em></h2></div>
      <p class="lead"><a class="btn btn-ghost" href="/portofolio/">Semua portofolio →</a></p>
    </div>
    <div class="tabs" role="tablist">
      ${tabs.map((p, i) => `<button class="tab" role="tab" aria-selected="${i === 0}" aria-controls="tab-${p.slug}" data-tab="tab-${p.slug}">${esc(p.name.replace('A Better Cup ', 'ABC ').replace('Universitas Tarumanagara', 'Untar').replace('Butik Batik Tulis ', 'Butik '))}</button>`).join('')}
    </div>
    ${tabs.map((p, i) => `
    <div class="panel" id="tab-${p.slug}" role="tabpanel"${i ? ' hidden' : ''}>
      <div class="proj">
        <div class="proj-info">
          <span class="chip">${esc(p.chip)}</span>
          <h3>${esc(p.name)}</h3>
          <div class="loc">${esc(p.location)}</div>
          <dl class="spec">${p.facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
          <a class="btn btn-ghost" style="margin-top:28px" href="${urls.project(p.slug)}">Studi kasus lengkap →</a>
        </div>
        ${p.before ? `<div>${beforeAfter(p.before, p.after, p.beforeLabel, p.afterLabel)}</div>` : `<div class="gal" data-group="tab-${p.slug}">${p.gallery.slice(0, 6).map((s, j) => img(s, { sizes: j === 0 ? '(max-width:900px) 100vw, 45vw' : '(max-width:900px) 50vw, 22vw', cls: j === 0 && p.gallery.length > 2 ? 'wide' : '' })).join('')}</div>`}
      </div>
    </div>`).join('')}
  </div>
</section>

<section class="bg-bp grid-bp" id="testimoni">
  <div class="wrap">
    <div class="head split reveal">
      <div><span class="sec-no"><b>07</b>Real client stories</span><h2 class="h2">Apa kata <em>mereka?</em></h2></div>
      <p class="lead">Kepuasan klien dan kualitas hasil akhir adalah bukti komitmen kami, langsung dari lapangan.</p>
    </div>
    <div class="vids">
      ${testimonials.map((t) => `<div><div class="vid" data-yt="${t.yt}" data-title="${esc(t.title)}"></div><div class="vid-cap"><div class="stars" aria-label="5 bintang">★★★★★</div><h3 class="h4">${t.project ? `<a href="${urls.project(t.project)}">${esc(t.title)}</a>` : esc(t.title)}</h3><p>${esc(t.text)}</p></div></div>`).join('\n      ')}
    </div>
    <div class="reveal" style="margin:88px 0 32px">
      <span class="sec-no">Shorts &amp; Reels</span>
      <h2 class="h2" style="font-size:clamp(28px,3.4vw,40px)">Liputan proyek dalam video singkat.</h2>
    </div>
    <div class="shorts">${shorts.map((id) => `<div class="vid short" data-yt="${id}" data-title="Liputan proyek Kalmer"></div>`).join('')}</div>
  </div>
</section>

<section class="bg-paper" id="galeri">
  <div class="wrap">
    <div class="head split reveal">
      <div><span class="sec-no"><b>08</b>Proven track record</span><h2 class="h2">Serah terima &amp; <em>galeri proyek.</em></h2></div>
      <div class="tabs" style="margin:0;justify-self:end;width:auto" role="group" aria-label="Filter galeri">
        <button class="tab" aria-selected="true" data-filter="all">Semua</button>
        <button class="tab" aria-selected="false" data-filter="serah">Serah Terima</button>
        <button class="tab" aria-selected="false" data-filter="hunian">Hunian</button>
        <button class="tab" aria-selected="false" data-filter="struktur">Struktur</button>
      </div>
    </div>
    ${gallery(galeriSlugs, 'galeri')}
  </div>
</section>

<section class="bg-ink grid-d" id="berjalan">
  <div class="wrap">
    <div class="head split reveal">
      <div><span class="sec-no"><b>09</b>Live update</span><h2 class="h2">Sedang <em>kami kerjakan.</em></h2></div>
      <p class="lead">Dedikasi kami di berbagai titik Jabodetabek. Ingin melihat langsung? Jadwalkan kunjungan proyek.</p>
    </div>
    ${board(ongoing)}
    <div class="mt-l reveal"><span class="sec-no">Area layanan</span><div style="margin-top:20px">${areaTags()}</div></div>
  </div>
</section>

<section class="bg-paper" id="blog">
  <div class="wrap">
    <div class="head split reveal">
      <div><span class="sec-no"><b>10</b>Panduan</span><h2 class="h2">Sebelum Anda <em>mulai membangun.</em></h2></div>
      <p class="lead"><a class="btn btn-ghost" href="/blog/">Semua artikel →</a></p>
    </div>
    <div class="cards">${posts.slice(0, 3).map(postCard).join('')}</div>
  </div>
</section>

${ctaSection()}
${faqSection(faqs, { no: '11' })}`;
  add({
    path: '/', active: null,
    title: 'Kontraktor Rumah & Renovasi Premium Jabodetabek | Kalmer',
    description: 'Kontraktor bangun & renovasi rumah mewah, cafe, dan ruang komersial di Jabodetabek. RAB transparan, diawasi site engineer, bergaransi. Konsultasi gratis.',
    ogImage: '/img/og/abc-untar-1.jpg',
    preload: `<link rel="preload" as="image" type="image/webp" imagesrcset="${meta['abc-untar-1'].sizes.map((w) => `/img/abc-untar-1-${w}.webp ${w}w`).join(', ')}" imagesizes="100vw" fetchpriority="high">\n`,
    ld: [faqLd(faqs)],
    body,
  });
}

// LAYANAN: indeks + detail
add({
  path: '/layanan/', active: '/layanan/',
  title: 'Layanan Kontraktor Bangun, Renovasi & Komersial | Kalmer',
  description: 'Layanan Kalmer: jasa bangun rumah, renovasi rumah total, kontraktor cafe & F&B, serta konstruksi ruko, kantor, dan ruang komersial di Jabodetabek.',
  ld: [breadcrumbLd([['Beranda', '/'], ['Layanan', '/layanan/']])],
  body: `${pageHero({ items: [['Beranda', '/'], ['Layanan', '/layanan/']], h1: 'Layanan konstruksi <em>dari rumah hingga ruang usaha.</em>', lead: 'Empat layanan utama, satu standar kerja: RAB transparan, site engineer di setiap proyek, dan laporan progres mingguan.', cover: 'abc-tebet-4' })}
<section class="bg-paper"><div class="wrap">${svcCards()}</div></section>
${stepsSection('bg-paper')}
${ctaSection()}`,
});

for (const s of services) {
  const rel = projects.filter((p) => p.services.includes(s.slug));
  const path_ = urls.service(s.slug);
  add({
    path: path_, active: '/layanan/',
    title: s.metaTitle, description: s.metaDesc, ogImage: ogImg(s.cover),
    ld: [
      breadcrumbLd([['Beranda', '/'], ['Layanan', '/layanan/'], [s.name, path_]]),
      { '@type': 'Service', name: s.name, serviceType: s.name, url: abs(path_), description: s.metaDesc, provider: { '@id': BIZ_ID }, areaServed: site.areaServed.map((name) => ({ '@type': 'City', name })) },
      faqLd(s.faqs),
    ],
    body: `${pageHero({ items: [['Beranda', '/'], ['Layanan', '/layanan/'], [s.name, path_]], h1: s.h1, lead: s.lead, cover: s.cover })}
<section class="bg-paper"><div class="wrap with-aside">
  <div class="prose reveal">${s.intro}</div>
  <aside class="aside">
    <div class="aside-card"><h3>Konsultasi gratis</h3><p>Ceritakan rencana Anda. Tim kami akan membantu menghitung kebutuhan awal.</p><a class="btn btn-primary" href="${wa(`Halo Kalmer, saya ingin konsultasi ${s.short.toLowerCase()}.`)}" target="_blank" rel="noopener">${icon.wa} Chat WhatsApp</a></div>
    <div class="aside-links"><h4>Panduan terkait</h4>${s.posts.map((ps) => `<a href="${urls.post(ps)}">${esc(POST[ps].title)}</a>`).join('')}</div>
  </aside>
</div></section>
${s.problems ? `<section class="bg-bp grid-bp"><div class="wrap"><div class="head reveal"><span class="sec-no">Masalah yang sering terjadi</span><h2 class="h2">Jangan biarkan kontraktor <em>menghambat bisnis Anda.</em></h2></div><div class="risks reveal" style="margin:0">${s.problems.map(([t, d], i) => `<div class="risk"><div class="no">Risk / 0${i + 1}</div><h3>${t}</h3><p>${d}</p></div>`).join('')}</div></div></section>` : ''}
<section class="bg-ink"><div class="wrap">
  <div class="head reveal"><span class="sec-no">Lingkup pekerjaan</span><h2 class="h2">Yang kami <em>kerjakan.</em></h2></div>
  <div class="feat reveal">${s.includes.map(([t, d], i) => `<div><span class="k">0${i + 1}</span><h3>${t}</h3><p>${d}</p></div>`).join('')}</div>
  ${s.docs ? `<div class="head reveal mt-l" style="margin-bottom:40px"><span class="sec-no">Audit ready</span><h2 class="h2" style="font-size:clamp(30px,3.6vw,46px)">Dokumen lengkap untuk <em>kebutuhan korporasi.</em></h2></div><div class="feat reveal">${s.docs.map(([t, d]) => `<div><h3>${t}</h3><p>${d}</p></div>`).join('')}</div>` : ''}
</div></section>
${rel.length ? `<section class="bg-paper"><div class="wrap"><div class="head split reveal"><div><span class="sec-no">Portofolio</span><h2 class="h2">Proyek <em>terkait.</em></h2></div><p class="lead"><a class="btn btn-ghost" href="/portofolio/">Semua portofolio →</a></p></div><div class="cards">${rel.slice(0, 3).map((p) => projectCard(p)).join('')}</div></div></section>` : ''}
${stepsSection('bg-paper')}
${faqSection(s.faqs, { title: `Seputar ${esc(s.short.toLowerCase())}.` })}
<section class="bg-paper" style="padding-top:0"><div class="wrap reveal"><span class="sec-no">Area layanan</span><div style="margin-top:20px">${areaTags()}</div></div></section>
${ctaSection(undefined, `Halo Kalmer, saya ingin konsultasi ${s.short.toLowerCase()}.`)}`,
  });
}

// AREA: indeks + per kota
add({
  path: '/area-layanan/', active: '/area-layanan/',
  title: 'Area Layanan Kontraktor Kalmer di Jabodetabek',
  description: 'Kalmer melayani bangun dan renovasi rumah serta proyek komersial di Jakarta, Bekasi, Depok, Tangerang, dan Bogor. Lihat proyek kami di setiap kota.',
  ld: [breadcrumbLd([['Beranda', '/'], ['Area Layanan', '/area-layanan/']])],
  body: `${pageHero({ items: [['Beranda', '/'], ['Area Layanan', '/area-layanan/']], h1: 'Melayani seluruh <em>Jabodetabek.</em>', lead: 'Kami membatasi area kerja di Jabodetabek agar setiap proyek tetap terjangkau pengawasan langsung dari tim pusat di Bekasi.', cover: 'galeri-12' })}
<section class="bg-paper"><div class="wrap"><div class="cards">${locations.map((l) => `
<a class="card reveal" href="${urls.location(l.slug)}"><div class="ph">${img(l.cover, { sizes: '(max-width:640px) 100vw, (max-width:1000px) 50vw, 33vw', alt: '' })}</div><h3>Kontraktor ${esc(l.name)}</h3><span class="loc">${esc(l.areas.slice(0, 3).join(' · '))}</span><p>${esc(strip(l.lead))}</p><span class="more">Lihat area</span></a>`).join('')}</div></div></section>
<section class="bg-ink grid-d"><div class="wrap"><div class="head reveal"><span class="sec-no">Live update</span><h2 class="h2">Proyek yang <em>sedang berjalan.</em></h2></div>${board(ongoing)}</div></section>
${ctaSection()}`,
});

for (const l of locations) {
  const path_ = urls.location(l.slug);
  const rel = projects.filter((p) => p.city === l.slug);
  const og_ = ongoing.filter((o) => o.city === l.slug);
  const extra = l.slug === 'bekasi' ? ['serah-terima-bekasi', 'serah-terima-1', 'serah-terima-3', 'serah-terima-4'] : null;
  add({
    path: path_, active: '/area-layanan/',
    title: l.metaTitle, description: l.metaDesc, ogImage: ogImg(l.cover),
    ld: [
      breadcrumbLd([['Beranda', '/'], ['Area Layanan', '/area-layanan/'], [`Kontraktor ${l.name}`, path_]]),
      { '@type': 'Service', name: `Kontraktor ${l.name}`, serviceType: 'Kontraktor bangun dan renovasi', url: abs(path_), provider: { '@id': BIZ_ID }, areaServed: { '@type': 'City', name: l.name } },
    ],
    body: `${pageHero({ items: [['Beranda', '/'], ['Area Layanan', '/area-layanan/'], [`Kontraktor ${l.name}`, path_]], h1: l.h1, lead: l.lead, cover: l.cover })}
<section class="bg-paper"><div class="wrap with-aside">
  <div>
    <div class="prose reveal">${l.body}</div>
    <div class="reveal" style="margin-top:48px"><span class="sec-no">Kawasan yang kami layani</span><ul class="tags" style="margin-top:18px">${l.areas.map((a) => `<li>${esc(a)}</li>`).join('')}</ul></div>
  </div>
  <aside class="aside">
    <div class="aside-card"><h3>Proyek di ${esc(l.name)}?</h3><p>Konsultasi awal gratis. Survey lokasi bisa dijadwalkan 3–7 hari ke depan.</p><a class="btn btn-primary" href="${wa(`Halo Kalmer, saya punya rencana proyek di ${l.name}.`)}" target="_blank" rel="noopener">${icon.wa} Chat WhatsApp</a></div>
    <div class="aside-links"><h4>Layanan</h4>${services.map((s) => `<a href="${urls.service(s.slug)}">${esc(s.name)}</a>`).join('')}</div>
  </aside>
</div></section>
${rel.length ? `<section class="bg-paper" style="padding-top:0"><div class="wrap"><div class="head reveal"><span class="sec-no">Portofolio</span><h2 class="h2">Proyek kami di <em>${esc(l.name)}.</em></h2></div><div class="cards">${rel.map((p) => projectCard(p)).join('')}</div></div></section>` : ''}
${og_.length ? `<section class="bg-ink grid-d"><div class="wrap"><div class="head reveal"><span class="sec-no">Live update</span><h2 class="h2">Sedang berjalan di <em>${esc(l.name)}.</em></h2></div>${board(og_)}</div></section>` : ''}
${extra ? `<section class="bg-paper"><div class="wrap"><div class="head reveal"><span class="sec-no">Serah terima</span><h2 class="h2">Bukti <em>serah terima kunci.</em></h2></div>${gallery(extra, 'serah-' + l.slug)}</div></section>` : ''}
<section class="bg-paper"${extra ? ' style="padding-top:0"' : ''}><div class="wrap"><div class="head reveal"><span class="sec-no">Layanan di ${esc(l.name)}</span><h2 class="h2">Apa yang bisa <em>kami bangun.</em></h2></div>${svcCards()}</div></section>
${faqSection(faqs.slice(0, 6))}
<section class="bg-paper" style="padding-top:0"><div class="wrap reveal"><span class="sec-no">Area lain</span><div style="margin-top:20px">${areaTags(l.slug)}</div></div></section>
${ctaSection(`Bangun di ${esc(l.name)}, <em>dimulai dari sini.</em>`, `Halo Kalmer, saya punya rencana proyek di ${l.name}.`)}`,
  });
}

// PORTOFOLIO: indeks + studi kasus
add({
  path: '/portofolio/', active: '/portofolio/',
  title: 'Portofolio Kontraktor: Cafe, Butik, Rumah Mewah | Kalmer',
  description: 'Studi kasus proyek Kalmer: A Better Cup Tebet & Untar, Red Chicken Burger Setu, Butik Batik Tulis Lavi, serta galeri serah terima rumah di Jabodetabek.',
  ld: [breadcrumbLd([['Beranda', '/'], ['Portofolio', '/portofolio/']])],
  body: `${pageHero({ items: [['Beranda', '/'], ['Portofolio', '/portofolio/']], h1: 'Portofolio <em>dan studi kasus.</em>', lead: 'Proyek komersial kami yang sudah selesai terbuka untuk umum. Silakan kunjungi dan lihat langsung kualitas finishing kami.', cover: 'abc-tebet-1', cta: false })}
<section class="bg-paper"><div class="wrap"><div class="cards">${projects.map((p) => projectCard(p)).join('')}</div></div></section>
<section class="bg-paper" style="padding-top:0" id="galeri"><div class="wrap">
  <div class="head split reveal"><div><span class="sec-no">Galeri</span><h2 class="h2">Serah terima &amp; <em>proyek lainnya.</em></h2></div>
  <div class="tabs" style="margin:0;justify-self:end;width:auto" role="group" aria-label="Filter galeri"><button class="tab" aria-selected="true" data-filter="all">Semua</button><button class="tab" aria-selected="false" data-filter="serah">Serah Terima</button><button class="tab" aria-selected="false" data-filter="hunian">Hunian</button><button class="tab" aria-selected="false" data-filter="struktur">Struktur</button></div></div>
  ${gallery(Object.keys(images).filter((s) => images[s].cat), 'galeri')}
</div></section>
<section class="bg-ink grid-d"><div class="wrap"><div class="head reveal"><span class="sec-no">Live update</span><h2 class="h2">Sedang <em>kami kerjakan.</em></h2></div>${board(ongoing)}</div></section>
${ctaSection()}`,
});

for (const p of projects) {
  const path_ = urls.project(p.slug);
  const others = projects.filter((x) => x.slug !== p.slug).slice(0, 3);
  const loc = p.city ? L[p.city] : null;
  add({
    path: path_, active: '/portofolio/',
    title: `${p.title} | Kalmer`,
    description: `${p.summary}`.slice(0, 158),
    ogImage: ogImg(p.cover), ogType: 'article',
    ld: [breadcrumbLd([['Beranda', '/'], ['Portofolio', '/portofolio/'], [p.name, path_]])],
    body: `${pageHero({ items: [['Beranda', '/'], ['Portofolio', '/portofolio/'], [p.name, path_]], h1: esc(p.title), lead: esc(p.summary), cover: p.cover, cta: false, extra: `<div class="meta-row"><span>Lokasi <b>${esc(p.location)}</b></span><span>Kategori <b>${esc(p.category)}</b></span><span>Status <b>${esc(p.status)}</b></span></div>` })}
<section class="bg-paper"><div class="wrap">
  ${p.before ? `<div class="reveal" style="margin-bottom:72px">${beforeAfter(p.before, p.after, p.beforeLabel, p.afterLabel)}</div>` : ''}
  ${p.gallery ? `<div class="gal${p.gallery.length === 2 ? ' two' : ''} reveal" data-group="proj" style="margin-bottom:72px">${p.gallery.map((s, j) => img(s, { sizes: j === 0 ? '(max-width:900px) 100vw, 66vw' : '(max-width:900px) 50vw, 33vw', cls: j === 0 && p.gallery.length > 2 ? 'wide' : '' })).join('')}</div>` : ''}
  <div class="with-aside">
    <div class="prose reveal">${p.body}${p.services.length ? `<p>Layanan terkait: ${p.services.map((s) => `<a href="${urls.service(s)}">${esc(S[s].name)}</a>`).join(', ')}${loc ? `, dan <a href="${urls.location(loc.slug)}">kontraktor ${esc(loc.name)}</a>` : ''}.</p>` : ''}</div>
    <aside class="aside">
      <dl class="spec" style="margin:0">${p.facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}<div><dt>Lokasi</dt><dd>${esc(p.location)}</dd></div></dl>
      <div class="aside-card"><h3>Proyek serupa?</h3><p>Diskusikan rencana Anda dengan tim yang mengerjakan proyek ini.</p><a class="btn btn-primary" href="${wa(`Halo Kalmer, saya melihat proyek ${p.name} dan ingin konsultasi proyek serupa.`)}" target="_blank" rel="noopener">${icon.wa} Chat WhatsApp</a></div>
    </aside>
  </div>
</div></section>
${p.progress ? `<section class="bg-ink"><div class="wrap"><div class="head reveal"><span class="sec-no">Progres lapangan</span><h2 class="h2">Dari desain <em>ke struktur nyata.</em></h2></div>${gallery(p.progress, 'progres', '(max-width:900px) 50vw, 33vw')}</div></section>` : ''}
${p.video ? `<section class="bg-bp grid-bp"><div class="wrap"><div class="head reveal"><span class="sec-no">Video</span><h2 class="h2">Dokumentasi <em>hasil akhir.</em></h2></div><div class="vid reveal" data-yt="${p.video}" data-title="${esc(p.name)}" style="max-width:960px"></div></div></section>` : ''}
<section class="bg-paper"><div class="wrap"><div class="head split reveal"><div><span class="sec-no">Proyek lainnya</span><h2 class="h2">Lihat juga.</h2></div><p class="lead"><a class="btn btn-ghost" href="/portofolio/">Semua portofolio →</a></p></div><div class="cards">${others.map((x) => projectCard(x)).join('')}</div></div></section>
${ctaSection()}`,
  });
}

// BLOG: indeks + artikel
add({
  path: '/blog/', active: '/blog/',
  title: 'Blog & Panduan Membangun Rumah dan Renovasi | Kalmer',
  description: 'Panduan dari kontraktor: cara membaca RAB, lama membangun rumah, sistem pembayaran termin, garansi bangunan, dan tips memilih kontraktor.',
  ld: [breadcrumbLd([['Beranda', '/'], ['Blog', '/blog/']]), { '@type': 'Blog', name: 'Blog Kalmer', url: abs('/blog/'), publisher: { '@id': BIZ_ID } }],
  body: `${pageHero({ items: [['Beranda', '/'], ['Blog', '/blog/']], h1: 'Panduan sebelum <em>Anda membangun.</em>', lead: 'Jawaban jujur atas pertanyaan yang paling sering kami terima dari calon klien.', cover: 'lavi-render-3', cta: false })}
<section class="bg-paper"><div class="wrap"><div class="cards">${posts.map(postCard).join('')}</div></div></section>
${ctaSection()}`,
});

for (const p of posts) {
  const path_ = urls.post(p.slug);
  const svc = S[p.service];
  const others = posts.filter((x) => x.slug !== p.slug).slice(0, 3);
  add({
    path: path_, active: '/blog/',
    title: `${p.metaTitle} | Kalmer`, ogTitle: p.title, description: p.description, ogImage: ogImg(p.cover), ogType: 'article',
    ld: [
      breadcrumbLd([['Beranda', '/'], ['Blog', '/blog/'], [p.title, path_]]),
      { '@type': 'BlogPosting', headline: p.title, description: p.description, image: abs(`/img/${p.cover}-${meta[p.cover].sizes.at(-1)}.webp`), datePublished: p.date, dateModified: p.updated || p.date, inLanguage: 'id-ID', mainEntityOfPage: abs(path_), author: { '@type': 'Organization', name: 'Tim Kalmer', url: site.url + '/' }, publisher: { '@id': BIZ_ID } },
    ],
    body: `${pageHero({ items: [['Beranda', '/'], ['Blog', '/blog/'], [p.title, path_]], h1: esc(p.title), lead: esc(p.description), cta: false, extra: `<div class="meta-row"><span>Oleh <b>Tim Kalmer</b></span><span>Terbit <b><time datetime="${p.date}">${tanggal(p.date)}</time></b></span><span><b>${readTime(p.body)} menit</b> baca</span></div>` })}
<section class="bg-paper"><div class="wrap with-aside">
  <article class="prose">
    ${img(p.cover, { sizes: '(max-width:1000px) 100vw, 720px', eager: true })}
    ${p.body}
  </article>
  <aside class="aside">
    <div class="aside-card"><h3>${esc(svc.name)}</h3><p>${esc(strip(svc.lead))}</p><a class="btn btn-primary" href="${wa(`Halo Kalmer, saya membaca artikel "${p.title}" dan ingin konsultasi.`)}" target="_blank" rel="noopener">${icon.wa} Konsultasi Gratis</a><a href="${urls.service(svc.slug)}" style="display:block;margin-top:16px;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#e9c9a0">Tentang layanan ini →</a></div>
    <div class="aside-links"><h4>Artikel lainnya</h4>${others.map((o) => `<a href="${urls.post(o.slug)}">${esc(o.title)}</a>`).join('')}</div>
  </aside>
</div></section>
${ctaSection()}`,
  });
}

// HUB (link di bio Instagram) — tidak diindeks
add({
  path: '/hub/', bare: true, noindex: true,
  title: 'Kalmer Multi Teknik | Link', description: 'Satu pintu untuk kebutuhan bangunan Anda: bangun & renovasi rumah, konstruksi komersial, dan spesialis cafe & F&B.',
  body: `<section class="hub bg-ink grid-d"><div class="wrap">
  <a href="/" class="logo-box"><img src="/img/logo.webp" width="${meta.logo.w}" height="${meta.logo.h}" alt="Logo Kalmer Multi Teknik"></a>
  <h1>${site.legalName}</h1>
  <p>Satu pintu untuk segala kebutuhan bangunan Anda.</p>
  <nav class="hub-links" aria-label="Tautan Kalmer">
    <a class="primary" href="${wa()}" target="_blank" rel="noopener"><b>Konsultasi via WhatsApp</b><span>Respon ${esc(site.hours[0].label)}</span></a>
    ${services.map((s) => `<a href="${urls.service(s.slug)}"><b>${esc(s.name)}</b><span>${esc(strip(s.lead)).slice(0, 80)}…</span></a>`).join('\n    ')}
    <a href="/portofolio/"><b>Portofolio Proyek</b><span>Studi kasus dan galeri serah terima.</span></a>
    <a href="${wa('Halo admin Kalmer, saya mandor/vendor dan ingin bergabung sebagai mitra.')}" target="_blank" rel="noopener"><b>Kerja Sama Mandor/Vendor</b><span>Gabung ekosistem Kalmer. Chat admin untuk prosedur.</span></a>
  </nav>
</div></section>`,
});

// 404
add({
  path: '/404.html', file: '404.html', noindex: true,
  title: 'Halaman tidak ditemukan | Kalmer', description: 'Halaman yang Anda cari tidak ditemukan.',
  body: `${pageHero({ items: [['Beranda', '/'], ['404', '/404.html']], h1: 'Halaman ini <em>tidak ditemukan.</em>', lead: 'Mungkin alamatnya sudah berubah. Coba mulai dari beranda atau lihat layanan kami.', cta: false, extra: `<div class="hero-cta"><a class="btn btn-primary" href="/">Ke beranda</a><a class="btn btn-ghost" href="/layanan/">Lihat layanan →</a></div>` })}`,
});

// ---------- tulis file ----------
await fs.rm(DIST, { recursive: true, force: true });
await fs.mkdir(path.join(DIST, 'assets'), { recursive: true });
await fs.cp(path.join(ROOT, 'public'), DIST, { recursive: true });

const minCss = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s*\n\s*/g, '').replace(/\s*([{};,>])\s*/g, '$1').replace(/;}/g, '}');
const css = minCss((await fs.readFile(path.join(ROOT, 'src/assets/site.css'), 'utf8')) + '\n' + (await fs.readFile(path.join(ROOT, 'src/assets/pages.css'), 'utf8'))
  // kelas utilitas untuk heading yang diturunkan levelnya demi struktur H1–H3 yang benar
  + '.kx .h4{font:inherit;margin:0}.kx .h5{font-size:10.5px;font-weight:700;color:#e9c9a0;letter-spacing:.28em;text-transform:uppercase;margin:0 0 24px}');
const js = await fs.readFile(path.join(ROOT, 'src/assets/site.js'), 'utf8');
const hash = (s) => crypto.createHash('md5').update(s).digest('hex').slice(0, 8);
ASSETS = { css: `site.${hash(css)}.css`, js: `site.${hash(js)}.js` };
await fs.writeFile(path.join(DIST, 'assets', ASSETS.css), css);
await fs.writeFile(path.join(DIST, 'assets', ASSETS.js), js);

for (const p of pages) {
  const file = p.file ? path.join(DIST, p.file) : path.join(DIST, p.path, 'index.html');
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, layout(p));
}

// sitemap & robots
const indexable = pages.filter((p) => !p.noindex);
const lastmod = (p) => (p.path.startsWith('/blog/') && POST[p.path.split('/')[2]]?.date) || BUILD_DATE;
await fs.writeFile(path.join(DIST, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${indexable.map((p) => `  <url><loc>${abs(p.path)}</loc><lastmod>${lastmod(p)}</lastmod></url>`).join('\n')}
</urlset>
`);
await fs.writeFile(path.join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${abs('/sitemap.xml')}\n`);
await fs.writeFile(path.join(DIST, 'site.webmanifest'), JSON.stringify({ name: site.legalName, short_name: site.name, start_url: '/', display: 'browser', background_color: '#0b0f12', theme_color: '#0b0f12', icons: [{ src: '/icon-512.png', sizes: '512x512', type: 'image/png' }] }));

// Pengalihan URL lama WordPress → URL baru (301), untuk berbagai jenis hosting
const redirects = [
  ['/cafe/', '/layanan/kontraktor-cafe/'], ['/komersil/', '/layanan/kontraktor-komersial/'],
  ['/home/', '/'], ['/hello-world/', '/blog/'], ['/vendor/', '/hub/'],
  ['/wp-sitemap.xml', '/sitemap.xml'], ['/feed/', '/blog/'],
];
await fs.writeFile(path.join(DIST, '_redirects'), redirects.map(([a, b]) => `${a} ${b} 301\n${a.replace(/\/$/, '')} ${b} 301`).join('\n') + '\n');
await fs.writeFile(path.join(DIST, '_headers'), `/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n/img/*\n  Cache-Control: public, max-age=2592000\n/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n`);
await fs.writeFile(path.join(DIST, '.htaccess'), `# Untuk hosting Apache/LiteSpeed (cPanel)
Options -Indexes
ErrorDocument 404 /404.html
DirectorySlash On

<IfModule mod_rewrite.c>
RewriteEngine On
# paksa https dan tanpa www
RewriteCond %{HTTPS} off [OR]
RewriteCond %{HTTP_HOST} ^www\\. [NC]
RewriteRule ^ https://kalmer.id%{REQUEST_URI} [L,R=301]
</IfModule>

${redirects.map(([a, b]) => `Redirect 301 ${a.replace(/\/$/, '')} ${b}`).join('\n')}

<IfModule mod_expires.c>
ExpiresActive On
ExpiresByType text/css "access plus 1 year"
ExpiresByType application/javascript "access plus 1 year"
ExpiresByType image/webp "access plus 1 month"
ExpiresByType image/png "access plus 1 month"
ExpiresByType image/jpeg "access plus 1 month"
ExpiresByType text/html "access plus 0 seconds"
</IfModule>

<IfModule mod_deflate.c>
AddOutputFilterByType DEFLATE text/html text/css application/javascript application/json image/svg+xml application/xml text/plain
</IfModule>

<IfModule mod_headers.c>
Header set X-Content-Type-Options "nosniff"
Header set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>
`);

console.log(`✔ ${pages.length} halaman → dist/  (css ${(css.length / 1024).toFixed(0)} KB, js ${(js.length / 1024).toFixed(0)} KB)`);
