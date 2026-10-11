// Generator situs statis Kalmer.
// build(content, dirs) membuat seluruh HTML ke folder output dari konten database.
// Dipanggil oleh server saat admin menekan "Publikasikan", atau lewat `npm run build`.

import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

export const esc = (s = '') => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const strip = (s = '') => String(s ?? '').replace(/<[^>]+>/g, '');
// Teks pendek dari admin: **tebal** dan *miring berwarna*
export const fmt = (s = '') => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\*(.+?)\*/g, '<em>$1</em>');
export const plain = (s = '') => String(s ?? '').replace(/\*+/g, '');
const tanggal = (d) => { const [y, m, dd] = String(d).split('-'); return `${+dd} ${BULAN[+m - 1]} ${y}`; };
const readTime = (h) => Math.max(1, Math.round(strip(h).split(/\s+/).length / 200));
const pad2 = (n) => String(n).padStart(2, '0');

const ICONS = {
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/></svg>',
  tool: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z"/></svg>',
  cup: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M4 8h13v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M17 10h1.5a2.5 2.5 0 0 1 0 5H17"/><path d="M8 2.5v2M11.5 2.5v2"/></svg>',
  building: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M4 21V5l8-3v19M12 8l8 3v10"/><path d="M2 21h20M7.5 8h1M7.5 12h1M7.5 16h1M15.5 13h1M15.5 17h1"/></svg>',
  wa: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 21l2.1-5.6A8.4 8.4 0 1 1 21 11.5z"/></svg>',
};

export const GALLERY_CATS = [['komersial', 'Komersial & F&B'], ['hunian', 'Hunian'], ['serah', 'Serah Terima'], ['desain', 'Desain 3D'], ['progres', 'Progres Lapangan'], ['struktur', 'Struktur Baja']];

/**
 * @param c   { site, home, pages, services, locations, projects, posts, clients, redirects, media }
 * @param dir { out, public, media, assets }  folder output & sumber
 */
export async function build(c, dir) {
  const { site, home, pages: pg } = c;
  const services = c.services, locations = c.locations, projects = c.projects;
  const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Jakarta' });
  const posts = c.posts.filter((p) => p.status === 'published' && p.date <= today).sort((a, b) => b.date.localeCompare(a.date));
  const media = c.media; // { slug: { alt, cat, w, h, sizes, kind } }
  const warnings = [];

  const bySlug = (arr) => Object.fromEntries(arr.map((x) => [x.slug, x]));
  const P = bySlug(projects), S = bySlug(services), L = bySlug(locations), POST = bySlug(posts);
  const urls = { service: (s) => `/layanan/${s}/`, location: (s) => `/kontraktor-${s}/`, project: (s) => `/portofolio/${s}/`, post: (s) => `/blog/${s}/` };
  const abs = (p) => site.url + p;
  const wa = (text = site.waMessage) => `https://wa.me/${String(site.phone).replace(/\D/g, '')}?text=${encodeURIComponent(text || '')}`;

  // foto yang dihapus/tidak ada → dilewati dengan peringatan, situs tetap bisa dibangun
  const has = (slug) => !!(slug && media[slug] && media[slug].sizes?.length);
  const ok = (list = []) => list.filter((s) => { if (has(s)) return true; if (s) warnings.push(`Foto "${s}" tidak ditemukan`); return false; });

  function img(slug, o = {}) {
    if (!has(slug)) { if (slug) warnings.push(`Foto "${slug}" tidak ditemukan`); return ''; }
    const m = media[slug];
    const set = m.sizes.map((w) => `/img/${slug}-${w}.webp ${w}w`).join(', ');
    const max = m.sizes[m.sizes.length - 1];
    const src = `/img/${slug}-${m.sizes[0]}.webp`;
    const w = m.sizes[0], h = Math.round((m.h * w) / m.w);
    const alt = o.alt ?? m.alt ?? '';
    const load = o.eager ? 'fetchpriority="high" decoding="sync"' : 'loading="lazy" decoding="async"';
    const srcAttrs = o.defer ? `data-src="${src}" data-srcset="${set}"` : `src="${src}" srcset="${set}"`;
    return `<img ${srcAttrs} sizes="${o.sizes || '100vw'}" width="${w}" height="${h}" alt="${esc(alt)}" ${load} data-full="/img/${slug}-${max}.webp"${o.cls ? ` class="${o.cls}"` : ''}${o.attrs ? ' ' + o.attrs : ''}>`;
  }
  const defaultOg = has(site.ogDefault) ? site.ogDefault : Object.keys(media).find((s) => media[s].kind === 'photo');
  const ogImg = (slug) => `/img/og/${has(slug) ? slug : defaultOg}.jpg`;

  // ---------- JSON-LD ----------
  const BIZ_ID = site.url + '/#business';
  const business = {
    '@type': 'GeneralContractor', '@id': BIZ_ID,
    name: site.legalName, alternateName: site.name, url: site.url + '/',
    logo: abs('/img/logo.png'), image: abs(ogImg(defaultOg)),
    description: site.description, telephone: site.phone, email: site.email,
    address: { '@type': 'PostalAddress', streetAddress: site.addrStreet, addressLocality: site.addrLocality, addressRegion: site.addrRegion, postalCode: site.addrPostal, addressCountry: site.addrCountry || 'ID' },
    areaServed: (site.areaServed || []).map((name) => ({ '@type': 'City', name })),
    openingHoursSpecification: (site.hours || []).map((h) => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: h.days, opens: h.opens, closes: h.closes })),
    founder: { '@type': 'Person', name: site.founderName, jobTitle: site.founderRole },
    sameAs: (site.social || []).map((s) => s.url),
  };
  const breadcrumbLd = (items) => ({ '@type': 'BreadcrumbList', itemListElement: items.map(([name, url], i) => ({ '@type': 'ListItem', position: i + 1, name: plain(name), item: abs(url) })) });
  const faqLd = (list) => ({ '@type': 'FAQPage', mainEntity: list.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) });

  // ---------- layout ----------
  const NAV = [['/layanan/', 'Layanan'], ['/portofolio/', 'Portofolio'], ['/galeri/', 'Galeri'], ['/area-layanan/', 'Area'], ['/blog/', 'Blog'], ['/#faq', 'FAQ']];
  const hours0 = site.hours?.[0]?.label || '';
  const logo = c.logo; // { w, h }

  const header = (active) => `
<a class="skip" href="#main">Langsung ke konten</a>
<div class="topbar">
  <div class="wrap">
    <div class="l"><span><b>●</b> ${esc(site.topbarText)}</span><span class="hide-m">${esc(hours0)}</span></div>
    <div class="l"><a class="hide-m" href="mailto:${esc(site.email)}">${esc(site.email)}</a><a href="${wa()}" target="_blank" rel="noopener"><b>●</b> ${esc(site.phoneDisplay)}</a></div>
  </div>
</div>
<header class="nav" id="nav">
  <div class="wrap">
    <a href="/" class="logo" aria-label="${esc(site.name)}, ke beranda">
      <img src="/img/logo.webp" width="${logo.w}" height="${logo.h}" alt="Logo ${esc(site.legalName)}">
      <span class="lt"><b>${esc(site.legalName)}</b>General Contractor</span>
    </a>
    <nav class="nav-links" id="navLinks" aria-label="Menu utama">
      ${NAV.map(([href, label]) => `<a href="${href}"${active && href.startsWith(active) ? ' aria-current="page"' : ''}>${label}</a>`).join('\n      ')}
    </nav>
    <a class="btn btn-primary" href="${wa()}" target="_blank" rel="noopener">Konsultasi Gratis</a>
    <button class="burger" id="burger" aria-label="Buka menu" aria-expanded="false" aria-controls="navLinks"><span></span><span></span><span></span></button>
  </div>
</header>`;

  const footer = () => `
<footer class="bg-ink grid-d">
  <div class="wrap">
    <div class="foot">
      <div>
        <a href="/" class="logo logo-box"><img src="/img/logo.webp" width="${logo.w}" height="${logo.h}" alt="Logo ${esc(site.legalName)}" loading="lazy"></a>
        <p style="margin-top:22px;max-width:360px">${esc(site.footerText)}</p>
        <p style="margin-top:16px">${(site.hours || []).map((h) => esc(h.label)).join('<br>')}</p>
      </div>
      <div>
        <h2 class="h5">Layanan</h2>
        <ul>${services.map((s) => `<li><a href="${urls.service(s.slug)}">${esc(s.name)}</a></li>`).join('')}<li><a href="/portofolio/">Portofolio</a></li><li><a href="/galeri/">Galeri Foto</a></li><li><a href="/blog/">Blog &amp; Panduan</a></li></ul>
      </div>
      <div>
        <h2 class="h5">Area Layanan</h2>
        <ul>${locations.map((l) => `<li><a href="${urls.location(l.slug)}">Kontraktor ${esc(l.name)}</a></li>`).join('')}</ul>
      </div>
      <div>
        <h2 class="h5">Hubungi Kami</h2>
        <ul>
          <li>${esc(site.addrShort)}</li>
          <li><a href="${wa()}" target="_blank" rel="noopener">${esc(site.phoneDisplay)}</a></li>
          <li><a href="mailto:${esc(site.email)}">${esc(site.email)}</a></li>
          ${(site.social || []).map((s) => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name)} · ${esc(s.handle)}</a></li>`).join('\n          ')}
        </ul>
      </div>
    </div>
    <div class="copy"><span>© ${new Date().getFullYear()} ${esc(site.legalName)}</span><span>General Contractor · Jabodetabek</span></div>
  </div>
</footer>
<a class="wa" href="${wa()}" target="_blank" rel="noopener" aria-label="Chat WhatsApp ${esc(site.name)}">
  <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3a13 13 0 0 0-11.2 19.6L3 29l6.6-1.7A13 13 0 1 0 16 3zm0 23.6a10.6 10.6 0 0 1-5.4-1.5l-.4-.2-3.9 1 1-3.8-.3-.4A10.6 10.6 0 1 1 16 26.6zm5.8-7.9c-.3-.2-1.9-.9-2.2-1s-.5-.2-.7.2-.8 1-1 1.2-.4.2-.7 0a8.7 8.7 0 0 1-4.3-3.8c-.3-.6.3-.5 1-1.7.1-.2 0-.4 0-.5l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6a1.2 1.2 0 0 0-.9.4 3.6 3.6 0 0 0-1.1 2.7 6.3 6.3 0 0 0 1.3 3.3 14.4 14.4 0 0 0 5.5 4.9c2 .9 2.9 1 3.9.8a3.4 3.4 0 0 0 2.2-1.6 2.8 2.8 0 0 0 .2-1.6c-.1-.2-.3-.3-.6-.4z"/></svg>
</a>
<div class="lb" id="lb" role="dialog" aria-modal="true" aria-label="Galeri foto">
  <button class="c" aria-label="Tutup">✕</button><button class="p" aria-label="Foto sebelumnya">‹</button>
  <img alt=""><button class="n" aria-label="Foto berikutnya">›</button><div class="cnt"><span class="num"></span><span class="cap"></span><a class="go" hidden>Lihat studi kasus →</a></div>
</div>`;

  let ASSETS;
  const layout = (p) => {
    const canonical = abs(p.path);
    const graph = { '@context': 'https://schema.org', '@graph': [business, { '@type': 'WebSite', '@id': site.url + '/#website', url: site.url + '/', name: site.name, inLanguage: 'id-ID', publisher: { '@id': BIZ_ID } }, ...(p.ld || [])] };
    const pixel = /^\d+$/.test(site.metaPixelId || '') ? `
<script>addEventListener('load',function(){setTimeout(function(){!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${site.metaPixelId}');fbq('track','PageView');},1500)});</script>` : '';
    const ga = /^G-[A-Z0-9]+$/.test(site.ga4Id || '') ? `
<script async src="https://www.googletagmanager.com/gtag/js?id=${site.ga4Id}"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${site.ga4Id}');</script>` : '';
    // JSON-LD: cegah "</script>" di dalam teks konten memutus tag
    const ld = JSON.stringify(graph).replace(/</g, '\\u003c');
    return `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(plain(p.title))}</title>
<meta name="description" content="${esc(plain(p.description))}">
<link rel="canonical" href="${canonical}">
<meta name="robots" content="${p.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large'}">
<meta property="og:type" content="${p.ogType || 'website'}">
<meta property="og:locale" content="id_ID">
<meta property="og:site_name" content="${esc(site.legalName)}">
<meta property="og:title" content="${esc(plain(p.ogTitle || p.title))}">
<meta property="og:description" content="${esc(plain(p.description))}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${abs(p.ogImage || ogImg(defaultOg))}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#0b0f12">
${site.googleSiteVerification ? `<meta name="google-site-verification" content="${esc(site.googleSiteVerification)}">\n` : ''}<link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,400;1,500;1,600&family=Manrope:wght@300;400;500;600;700&display=swap" rel="stylesheet">
${p.preload || ''}<link rel="stylesheet" href="/assets/${ASSETS.css}">
<script>document.documentElement.classList.add('js')</script>
<script type="application/ld+json">${ld}</script>${ga}
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
  };

  // ---------- komponen ----------
  const crumbs = (items) => `<ol class="crumbs">${items.map(([n, u], i) => i === items.length - 1 ? `<li aria-current="page">${esc(plain(n))}</li>` : `<li><a href="${u}">${esc(n)}</a></li>`).join('')}</ol>`;
  const pageHero = ({ items, h1, lead, cover, cta = true, extra = '' }) => `
<section class="page-hero">
  ${cover ? img(cover, { cls: 'bgimg', eager: true, alt: '' }) : ''}
  <div class="wrap">
    ${crumbs(items)}
    <h1>${h1}</h1>
    ${lead ? `<p class="lead">${lead}</p>` : ''}
    ${extra}
    ${cta ? `<div class="hero-cta"><a class="btn btn-primary" href="${wa()}" target="_blank" rel="noopener">${ICONS.wa} Konsultasi Gratis</a><a class="btn btn-ghost" href="/portofolio/">Lihat Portofolio →</a></div>` : ''}
  </div>
</section>`;
  const head = (no, label, title, lead = '') => `
    <div class="head${lead ? ' split' : ''} reveal">
      <div><span class="sec-no">${no ? `<b>${no}</b>` : ''}${esc(label)}</span><h2 class="h2">${fmt(title)}</h2></div>
      ${lead}
    </div>`;

  const stepsSection = (no = '') => `
<section class="bg-paper" id="proses">
  <div class="wrap">
    ${head(no, 'Alur kerja', home.prosesTitle, `<p class="lead">${fmt(home.prosesLead)}</p>`)}
    <div class="steps reveal">
      ${(home.steps || []).map((s, i) => `<div class="step"><div class="num">${pad2(i + 1)}</div><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></div>`).join('\n      ')}
    </div>
  </div>
</section>`;

  const faqSection = (list, { title = home.faqTitle, no = '' } = {}) => !list?.length ? '' : `
<section class="bg-paper" id="faq">
  <div class="wrap faq">
    <div class="reveal">
      <span class="sec-no">${no ? `<b>${no}</b>` : ''}FAQ</span>
      <h2 class="h2">${fmt(title)}</h2>
      <p class="lead">${fmt(home.faqLead)}</p>
      <a class="btn btn-primary" style="margin-top:32px" href="${wa()}" target="_blank" rel="noopener">Tanya via WhatsApp →</a>
    </div>
    <div class="faq-list reveal">
      ${list.map((f, i) => `<details${i === 0 ? ' open' : ''}><summary><i>Q.${pad2(i + 1)}</i>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('\n      ')}
    </div>
  </div>
</section>`;

  const ctaSection = (title = home.ctaTitle, msg) => `
<section class="cta-sec" id="konsultasi"${has(home.ctaImage) ? ` style="background-image:url('/img/${home.ctaImage}-${media[home.ctaImage].sizes.at(-1)}.webp')"` : ''}>
  <div class="wrap">
    <div class="cta">
      <div class="reveal">
        <span class="sec-no">Prioritas kualitas</span>
        <h2 style="margin-top:18px">${fmt(title)}</h2>
        <p class="note">${fmt(home.ctaNote)}</p>
      </div>
      <div class="cta-box marks reveal">
        <h3>${esc(home.ctaBoxTitle)}</h3>
        <p>${esc(home.ctaBoxText)}</p>
        <a class="btn" href="${wa(msg)}" target="_blank" rel="noopener">${ICONS.wa} Hubungi WhatsApp Kami</a>
        <div class="bonus"><b>Respon cepat</b><ul>${(site.hours || []).map((h) => `<li>${esc(h.label)}</li>`).join('')}</ul></div>
      </div>
    </div>
  </div>
</section>`;

  const projectCard = (p) => `
<a class="card reveal" href="${urls.project(p.slug)}">
  <div class="ph">${img(p.cover, { sizes: '(max-width:640px) 100vw, (max-width:1000px) 50vw, 33vw' })}</div>
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
  ${services.map((s) => `<a class="svc-card" href="${urls.service(s.slug)}"><span class="ic">${ICONS[s.icon] || ICONS.home}</span><h3>${esc(s.name)}</h3><p>${esc(plain(s.lead))}</p><span class="more">Selengkapnya</span></a>`).join('\n  ')}
</div>`;
  const chipCls = { Residential: ' b', Investment: ' g', Luxury: ' k' };
  const board = (list) => !list.length ? '' : `
<div class="board reveal">
  <div class="brow hd"><span>No</span><span>Lokasi</span><span>Lingkup</span><span>Kategori</span><span>Status</span></div>
  ${list.map((o, i) => `<div class="brow"><span class="no">${pad2(i + 1)}</span><h3 class="h4">${P[o.project] ? `<a href="${urls.project(o.project)}">${esc(o.name)}</a>` : esc(o.name)}</h3><span class="d">${esc(o.scope)}</span><span><span class="chip${chipCls[o.type] || ''}">${esc(o.type)}</span></span><span class="status"><span class="pulse"></span>ON PROGRESS</span></div>`).join('\n  ')}
</div>`;
  const areaTags = (exclude) => `<ul class="tags">${locations.filter((l) => l.slug !== exclude).map((l) => `<li><a href="${urls.location(l.slug)}">Kontraktor ${esc(l.name)}</a></li>`).join('')}</ul>`;

  // studi kasus pertama yang memakai sebuah foto (untuk tautan di lightbox)
  const projectOf = {};
  for (const p of projects) for (const s of [p.cover, p.before, p.after, ...(p.gallery || []), ...(p.progress || [])]) if (s && !projectOf[s]) projectOf[s] = p.slug;
  const gallery = (slugs, group, cols = 4) => `<div class="gallery${cols === 3 ? ' cols-3' : ''}" data-group="${group}">${ok(slugs).map((s) => {
    const attrs = [media[s].cat && `data-cat="${media[s].cat}"`, projectOf[s] && `data-project="${projectOf[s]}"`].filter(Boolean).join(' ');
    return img(s, { sizes: `(max-width:600px) 50vw, (max-width:900px) 33vw, ${Math.round(100 / cols)}vw`, attrs });
  }).join('')}</div>`;
  const photosByCat = (cat) => Object.keys(media).filter((s) => media[s].kind === 'photo' && media[s].cat === cat);
  const filterTabs = (cats, counts) => `${[['all', 'Semua'], ...cats].map(([v, label], i) => `<button class="tab" aria-selected="${i === 0}" data-filter="${v}">${label}${counts ? ` <small style="opacity:.55">${counts[v]}</small>` : ''}</button>`).join('')}`;

  const beforeAfter = (b, a, lb = 'Sebelum', la = 'Sesudah') => !(has(b) && has(a)) ? '' : `
<div class="ba">
  ${img(b, { sizes: '(max-width:900px) 100vw, 66vw' })}
  ${img(a, { sizes: '(max-width:900px) 100vw, 66vw', cls: 'after' })}
  <span class="lbl l">${esc(lb)}</span><span class="lbl r">${esc(la)}</span>
  <div class="bar"></div>
  <input type="range" min="0" max="100" value="50" aria-label="Geser untuk membandingkan ${esc(lb.toLowerCase())} dan ${esc(la.toLowerCase())}">
</div>
<p class="ba-hint">← Geser untuk membandingkan →</p>`;

  // ---------- halaman ----------
  const pages = [];
  const add = (p) => pages.push(p);

  // BERANDA
  {
    const slides = (home.slides || []).filter((s) => has(s.image));
    const slideInfo = (s) => P[s.project] || { name: s.title || site.legalName, location: s.location || '', slug: null };
    const tabs = (home.portfolioTabs || []).map((s) => P[s]).filter(Boolean);
    const galCats = GALLERY_CATS.filter(([v]) => (home.galeriCats || []).includes(v));
    const galeriHome = galCats.flatMap(([v]) => photosByCat(v).slice(0, home.galeriPerCat || 4));
    const first = slides[0];
    const body = `
${slides.length ? `<section class="hero" id="top" aria-roledescription="carousel" aria-label="Proyek pilihan">
  <div class="hs-slides">
    ${slides.map((s, i) => { const info = slideInfo(s); return `<div class="hs-slide${i === 0 ? ' active' : ''}" data-goto="${esc(s.project || '')}" data-href="${info.slug ? urls.project(info.slug) : '/portofolio/'}" data-title="${esc(info.name)}" data-loc="${esc(info.location)}" aria-roledescription="slide" aria-label="${i + 1} dari ${slides.length}">${img(s.image, { eager: i === 0, defer: i > 0, sizes: '100vw' })}</div>`; }).join('\n    ')}
  </div>
  <div class="hero-shade"></div>
  <div class="hero-main">
    <div class="wrap">
      <div class="hero-text">
        <h1 class="tag"><b>${esc(home.heroTagStrong)}</b><span>${esc(home.heroTagRest)}</span></h1>
        <p class="display">${fmt(home.heroTitle)}</p>
        <p class="sub">${fmt(home.heroSub)}</p>
        <div class="hero-cta">
          <a class="btn btn-primary" href="${wa()}" target="_blank" rel="noopener">${ICONS.wa} ${esc(home.heroCta1)}</a>
          <a class="btn btn-ghost" href="/portofolio/">${esc(home.heroCta2)} →</a>
        </div>
      </div>
    </div>
  </div>
  <div class="hero-bar">
    <div class="hs-progress"><i></i></div>
    <div class="wrap">
      <div class="stats">
        ${(home.stats || []).map((s) => `<div class="stat"><div class="n">${esc(s.n)}<span>${esc(s.suffix)}</span></div><div class="l">${esc(s.label)}</div></div>`).join('\n        ')}
      </div>
      <div class="hs-ctrl">
        <div class="hs-count"><b class="cur">01</b>/ <span class="tot">${pad2(slides.length)}</span></div>
        <a class="hs-now" href="${slideInfo(first).slug ? urls.project(slideInfo(first).slug) : '/portofolio/'}"><span class="t">${esc(slideInfo(first).name)}</span><span class="l">${esc(slideInfo(first).location)}</span></a>
        <div class="arrows"><button class="hs-prev" aria-label="Proyek sebelumnya">‹</button><button class="hs-next" aria-label="Proyek berikutnya">›</button></div>
      </div>
    </div>
  </div>
</section>` : `${pageHero({ items: [['Beranda', '/']], h1: fmt(home.heroTitle), lead: fmt(home.heroSub) })}`}

${c.clients.length ? `<div class="clients">
  <div class="wrap">
    <p><b>${esc(home.clientsTitle)}</b>${esc(home.clientsSub)}</p>
    <div class="marquee"><div class="track" id="track">
      ${c.clients.filter((k) => media[k.logo]).map((k) => `<img${k.big ? ' class="big"' : ''} src="/img/${k.logo}.webp" width="${media[k.logo].w}" height="${media[k.logo].h}" alt="${esc(k.name)}" loading="lazy">`).join('')}
    </div></div>
  </div>
</div>` : ''}

<section class="bg-paper" id="layanan">
  <div class="wrap">
    ${head('01', 'Layanan', home.layananTitle, `<p class="lead">${fmt(home.layananLead)}</p>`)}
    ${svcCards()}
  </div>
</section>

<section class="bg-paper" style="padding-top:0">
  <div class="wrap founder">
    <div class="founder-photo marks reveal">
      ${img(home.founderPhoto, { sizes: '(max-width:900px) 100vw, 45vw' })}
      <div class="badge"><strong>${esc(site.founderName)}</strong><span>${esc(home.founderBadge)}</span></div>
    </div>
    <div class="reveal">
      <span class="sec-no"><b>02</b>Founder's Commitment</span>
      <h2 class="h2">${fmt(home.founderTitle)}</h2>
      <blockquote>“${fmt(home.founderQuote)}”</blockquote>
      <p class="body">${fmt(home.founderBody)}</p>
      ${home.founderPull ? `<div class="pull">${fmt(home.founderPull)}</div>` : ''}
    </div>
  </div>
</section>

<section class="bg-bp grid-bp" id="masalah">
  <div class="wrap">
    ${head('03', 'Risiko terbesar konstruksi', home.masalahTitle, `<p class="lead">${fmt(home.masalahLead)}${home.masalahLink ? ` <a href="${esc(home.masalahLink)}" style="color:#e9c9a0;text-decoration:underline">${esc(home.masalahLinkText || 'Selengkapnya →')}</a>` : ''}</p>`)}
    <div class="risks reveal">
      ${(home.risks || []).map((r, i) => `<div class="risk"><div class="no">Risk / ${pad2(i + 1)}</div><h3>${esc(r.title)}</h3><p>${esc(r.text)}</p></div>`).join('\n      ')}
    </div>
    <div class="compare reveal">
      <div class="crow hd"><div>✕ ${esc(home.compareBad)}</div><div>✓ ${esc(home.compareGood)}</div></div>
      ${(home.compare || []).map((r) => `<div class="crow"><div><span class="x" aria-hidden="true">✕</span><div><h3 class="h4">${esc(r.badTitle)}</h3><p>${esc(r.badText)}</p></div></div><div><span class="v" aria-hidden="true">✓</span><div><h3 class="h4">${esc(r.goodTitle)}</h3><p>${esc(r.goodText)}</p></div></div></div>`).join('\n      ')}
    </div>
  </div>
</section>

<section class="bg-ink" id="keunggulan">
  <div class="wrap">
    ${head('04', 'Keunggulan', home.keunggulanTitle, `<p class="lead">${fmt(home.keunggulanLead)}</p>`)}
    <div class="svc-media reveal">
      ${img(home.keunggulanImage, { sizes: '(max-width:900px) 100vw, 60vw' })}
      <div class="exp"><span class="k">EST. EXPERIENCE</span><div class="n">${esc(home.expNumber)}</div><p>${esc(home.expText)}</p></div>
    </div>
    <div class="svc-grid">
      ${(home.keunggulan || []).map((k, i) => `<div class="svc reveal"><div class="top"><span class="no">${pad2(i + 1)}</span></div><h3>${esc(k.title)}</h3><p>${esc(k.text)}</p></div>`).join('\n      ')}
    </div>
  </div>
</section>

${stepsSection('05')}

${tabs.length ? `<section class="bg-ink grid-d" id="portofolio">
  <div class="wrap">
    ${head('06', 'Portofolio pilihan', home.portfolioTitle, '<p class="lead"><a class="btn btn-ghost" href="/portofolio/">Semua portofolio →</a></p>')}
    <div class="tabs" role="tablist">
      ${tabs.map((p, i) => `<button class="tab" role="tab" aria-selected="${i === 0}" aria-controls="tab-${p.slug}" data-tab="tab-${p.slug}">${esc(p.tabLabel || p.name)}</button>`).join('')}
    </div>
    ${tabs.map((p, i) => { const gal = ok(p.gallery); return `
    <div class="panel" id="tab-${p.slug}" role="tabpanel"${i ? ' hidden' : ''}>
      <div class="proj">
        <div class="proj-info">
          <span class="chip">${esc(p.chip)}</span>
          <h3>${esc(p.name)}</h3>
          <div class="loc">${esc(p.location)}</div>
          <dl class="spec">${(p.facts || []).map((f) => `<div><dt>${esc(f.k)}</dt><dd>${esc(f.v)}</dd></div>`).join('')}</dl>
          <a class="btn btn-ghost" style="margin-top:28px" href="${urls.project(p.slug)}">Studi kasus lengkap →</a>
        </div>
        ${has(p.before) && has(p.after) ? `<div>${beforeAfter(p.before, p.after, p.beforeLabel || undefined, p.afterLabel || undefined)}</div>` : `<div class="gal${gal.length === 2 ? ' two' : ''}" data-group="tab-${p.slug}">${gal.slice(0, 6).map((s, j) => img(s, { sizes: j === 0 ? '(max-width:900px) 100vw, 45vw' : '(max-width:900px) 50vw, 22vw', cls: j === 0 && gal.length > 2 ? 'wide' : '' })).join('')}</div>`}
      </div>
    </div>`; }).join('')}
  </div>
</section>` : ''}

<section class="bg-bp grid-bp" id="testimoni">
  <div class="wrap">
    ${head('07', 'Real client stories', home.testimoniTitle, `<p class="lead">${fmt(home.testimoniLead)}</p>`)}
    <div class="vids">
      ${(home.testimonials || []).map((t) => `<div><div class="vid" data-yt="${esc(t.yt)}" data-title="${esc(t.title)}"></div><div class="vid-cap"><div class="stars" aria-label="5 bintang">★★★★★</div><h3 class="h4">${P[t.project] ? `<a href="${urls.project(t.project)}">${esc(t.title)}</a>` : esc(t.title)}</h3><p>${esc(t.text)}</p></div></div>`).join('\n      ')}
    </div>
    ${(home.shorts || []).length ? `<div class="reveal" style="margin:88px 0 32px">
      <span class="sec-no">Shorts &amp; Reels</span>
      <h2 class="h2" style="font-size:clamp(28px,3.4vw,40px)">${fmt(home.shortsTitle)}</h2>
    </div>
    <div class="shorts">${home.shorts.map((id) => `<div class="vid short" data-yt="${esc(id)}" data-title="Liputan proyek ${esc(site.name)}"></div>`).join('')}</div>` : ''}
  </div>
</section>

${galeriHome.length ? `<section class="bg-paper" id="galeri">
  <div class="wrap">
    ${head('08', 'Proven track record', home.galeriTitle, `<div class="tabs" style="margin:0;justify-self:end;width:auto" role="group" aria-label="Filter galeri">${filterTabs(galCats)}</div>`)}
    ${gallery(galeriHome, 'galeri')}
    <p class="reveal" style="margin-top:40px;text-align:center"><a class="btn btn-ghost" href="/galeri/">Lihat semua foto →</a></p>
  </div>
</section>` : ''}

<section class="bg-ink grid-d" id="berjalan">
  <div class="wrap">
    ${head('09', 'Live update', home.berjalanTitle, `<p class="lead">${fmt(home.berjalanLead)}</p>`)}
    ${board(home.ongoing || [])}
    <div class="mt-l reveal"><span class="sec-no">Area layanan</span><div style="margin-top:20px">${areaTags()}</div></div>
  </div>
</section>

${posts.length ? `<section class="bg-paper" id="blog">
  <div class="wrap">
    ${head('10', 'Panduan', home.blogTitle, '<p class="lead"><a class="btn btn-ghost" href="/blog/">Semua artikel →</a></p>')}
    <div class="cards">${posts.slice(0, 3).map(postCard).join('')}</div>
  </div>
</section>` : ''}

${ctaSection()}
${faqSection(home.faqs, { no: '11' })}`;
    add({
      path: '/', active: null, title: home.metaTitle, description: home.metaDesc,
      ogImage: first ? ogImg(first.image) : undefined,
      preload: first ? `<link rel="preload" as="image" type="image/webp" imagesrcset="${media[first.image].sizes.map((w) => `/img/${first.image}-${w}.webp ${w}w`).join(', ')}" imagesizes="100vw" fetchpriority="high">\n` : '',
      ld: home.faqs?.length ? [faqLd(home.faqs)] : [],
      body,
    });
  }

  // LAYANAN
  add({
    path: '/layanan/', active: '/layanan/', title: pg.layananMetaTitle, description: pg.layananMetaDesc, ogImage: ogImg(pg.layananCover),
    ld: [breadcrumbLd([['Beranda', '/'], ['Layanan', '/layanan/']])],
    body: `${pageHero({ items: [['Beranda', '/'], ['Layanan', '/layanan/']], h1: fmt(pg.layananTitle), lead: fmt(pg.layananLead), cover: pg.layananCover })}
<section class="bg-paper"><div class="wrap">${svcCards()}</div></section>
${stepsSection()}
${ctaSection()}`,
  });

  for (const s of services) {
    const rel = projects.filter((p) => (p.services || []).includes(s.slug));
    const relPosts = (s.posts || []).map((x) => POST[x]).filter(Boolean);
    const path_ = urls.service(s.slug);
    const msg = `Halo ${site.name}, saya ingin konsultasi ${String(s.short || s.name).toLowerCase()}.`;
    add({
      path: path_, active: '/layanan/', title: s.metaTitle || s.name, description: s.metaDesc, ogImage: ogImg(s.cover),
      ld: [
        breadcrumbLd([['Beranda', '/'], ['Layanan', '/layanan/'], [s.name, path_]]),
        { '@type': 'Service', name: s.name, serviceType: s.name, url: abs(path_), description: s.metaDesc, provider: { '@id': BIZ_ID }, areaServed: (site.areaServed || []).map((name) => ({ '@type': 'City', name })) },
        ...(s.faqs?.length ? [faqLd(s.faqs)] : []),
      ],
      body: `${pageHero({ items: [['Beranda', '/'], ['Layanan', '/layanan/'], [s.name, path_]], h1: fmt(s.h1 || s.name), lead: fmt(s.lead), cover: s.cover })}
<section class="bg-paper"><div class="wrap with-aside">
  <div class="prose reveal">${s.intro || ''}</div>
  <aside class="aside">
    <div class="aside-card"><h3>Konsultasi gratis</h3><p>Ceritakan rencana Anda. Tim kami akan membantu menghitung kebutuhan awal.</p><a class="btn btn-primary" href="${wa(msg)}" target="_blank" rel="noopener">${ICONS.wa} Chat WhatsApp</a></div>
    ${relPosts.length ? `<div class="aside-links"><h4>Panduan terkait</h4>${relPosts.map((p) => `<a href="${urls.post(p.slug)}">${esc(p.title)}</a>`).join('')}</div>` : ''}
  </aside>
</div></section>
${s.problems?.length ? `<section class="bg-bp grid-bp"><div class="wrap">${head('', 'Masalah yang sering terjadi', s.problemsTitle || 'Jangan biarkan kontraktor *menghambat bisnis Anda.*')}<div class="risks reveal" style="margin:0">${s.problems.map((r, i) => `<div class="risk"><div class="no">Risk / ${pad2(i + 1)}</div><h3>${esc(r.title)}</h3><p>${esc(r.text)}</p></div>`).join('')}</div></div></section>` : ''}
${s.includes?.length ? `<section class="bg-ink"><div class="wrap">
  ${head('', 'Lingkup pekerjaan', 'Yang kami *kerjakan.*')}
  <div class="feat reveal">${s.includes.map((r, i) => `<div><span class="k">${pad2(i + 1)}</span><h3>${esc(r.title)}</h3><p>${esc(r.text)}</p></div>`).join('')}</div>
  ${s.docs?.length ? `<div class="head reveal mt-l" style="margin-bottom:40px"><span class="sec-no">Audit ready</span><h2 class="h2" style="font-size:clamp(30px,3.6vw,46px)">Dokumen lengkap untuk <em>kebutuhan korporasi.</em></h2></div><div class="feat reveal">${s.docs.map((r) => `<div><h3>${esc(r.title)}</h3><p>${esc(r.text)}</p></div>`).join('')}</div>` : ''}
</div></section>` : ''}
${rel.length ? `<section class="bg-paper"><div class="wrap">${head('', 'Portofolio', 'Proyek *terkait.*', '<p class="lead"><a class="btn btn-ghost" href="/portofolio/">Semua portofolio →</a></p>')}<div class="cards">${rel.slice(0, 3).map(projectCard).join('')}</div></div></section>` : ''}
${stepsSection()}
${faqSection(s.faqs, { title: `Seputar *${String(s.short || s.name).toLowerCase()}.*` })}
<section class="bg-paper" style="padding-top:0"><div class="wrap reveal"><span class="sec-no">Area layanan</span><div style="margin-top:20px">${areaTags()}</div></div></section>
${ctaSection(undefined, msg)}`,
    });
  }

  // AREA
  add({
    path: '/area-layanan/', active: '/area-layanan/', title: pg.areaMetaTitle, description: pg.areaMetaDesc, ogImage: ogImg(pg.areaCover),
    ld: [breadcrumbLd([['Beranda', '/'], ['Area Layanan', '/area-layanan/']])],
    body: `${pageHero({ items: [['Beranda', '/'], ['Area Layanan', '/area-layanan/']], h1: fmt(pg.areaTitle), lead: fmt(pg.areaLead), cover: pg.areaCover })}
<section class="bg-paper"><div class="wrap"><div class="cards">${locations.map((l) => `
<a class="card reveal" href="${urls.location(l.slug)}"><div class="ph">${img(l.cover, { sizes: '(max-width:640px) 100vw, (max-width:1000px) 50vw, 33vw', alt: '' })}</div><h3>Kontraktor ${esc(l.name)}</h3><span class="loc">${esc((l.areas || []).slice(0, 3).join(' · '))}</span><p>${esc(plain(l.lead))}</p><span class="more">Lihat area</span></a>`).join('')}</div></div></section>
${(home.ongoing || []).length ? `<section class="bg-ink grid-d"><div class="wrap">${head('', 'Live update', 'Proyek yang *sedang berjalan.*')}${board(home.ongoing)}</div></section>` : ''}
${ctaSection()}`,
  });

  for (const l of locations) {
    const path_ = urls.location(l.slug);
    const rel = projects.filter((p) => p.city === l.slug);
    const run = (home.ongoing || []).filter((o) => o.city === l.slug);
    const photos = ok(l.photos);
    const msg = `Halo ${site.name}, saya punya rencana proyek di ${l.name}.`;
    add({
      path: path_, active: '/area-layanan/', title: l.metaTitle || `Kontraktor ${l.name}`, description: l.metaDesc, ogImage: ogImg(l.cover),
      ld: [
        breadcrumbLd([['Beranda', '/'], ['Area Layanan', '/area-layanan/'], [`Kontraktor ${l.name}`, path_]]),
        { '@type': 'Service', name: `Kontraktor ${l.name}`, serviceType: 'Kontraktor bangun dan renovasi', url: abs(path_), provider: { '@id': BIZ_ID }, areaServed: { '@type': 'City', name: l.name } },
      ],
      body: `${pageHero({ items: [['Beranda', '/'], ['Area Layanan', '/area-layanan/'], [`Kontraktor ${l.name}`, path_]], h1: fmt(l.h1 || `Kontraktor ${l.name}`), lead: fmt(l.lead), cover: l.cover })}
<section class="bg-paper"><div class="wrap with-aside">
  <div>
    <div class="prose reveal">${l.body || ''}</div>
    ${(l.areas || []).length ? `<div class="reveal" style="margin-top:48px"><span class="sec-no">Kawasan yang kami layani</span><ul class="tags" style="margin-top:18px">${l.areas.map((a) => `<li>${esc(a)}</li>`).join('')}</ul></div>` : ''}
  </div>
  <aside class="aside">
    <div class="aside-card"><h3>Proyek di ${esc(l.name)}?</h3><p>Konsultasi awal gratis. Survey lokasi bisa dijadwalkan 3–7 hari ke depan.</p><a class="btn btn-primary" href="${wa(msg)}" target="_blank" rel="noopener">${ICONS.wa} Chat WhatsApp</a></div>
    <div class="aside-links"><h4>Layanan</h4>${services.map((s) => `<a href="${urls.service(s.slug)}">${esc(s.name)}</a>`).join('')}</div>
  </aside>
</div></section>
${rel.length ? `<section class="bg-paper" style="padding-top:0"><div class="wrap">${head('', 'Portofolio', `Proyek kami di *${l.name}.*`)}<div class="cards">${rel.map(projectCard).join('')}</div></div></section>` : ''}
${run.length ? `<section class="bg-ink grid-d"><div class="wrap">${head('', 'Live update', `Sedang berjalan di *${l.name}.*`)}${board(run)}</div></section>` : ''}
${photos.length ? `<section class="bg-paper"><div class="wrap">${head('', 'Dokumentasi', `Foto proyek di *${l.name}.*`)}${gallery(photos, 'area-' + l.slug)}</div></section>` : ''}
<section class="bg-paper"${photos.length ? ' style="padding-top:0"' : ''}><div class="wrap">${head('', `Layanan di ${l.name}`, 'Apa yang bisa *kami bangun.*')}${svcCards()}</div></section>
${faqSection((home.faqs || []).slice(0, 6))}
<section class="bg-paper" style="padding-top:0"><div class="wrap reveal"><span class="sec-no">Area lain</span><div style="margin-top:20px">${areaTags(l.slug)}</div></div></section>
${ctaSection(`Bangun di ${l.name}, *dimulai dari sini.*`, msg)}`,
    });
  }

  // PORTOFOLIO
  const portoGal = ['serah', 'hunian', 'struktur'].flatMap(photosByCat);
  add({
    path: '/portofolio/', active: '/portofolio/', title: pg.portoMetaTitle, description: pg.portoMetaDesc, ogImage: ogImg(pg.portoCover),
    ld: [breadcrumbLd([['Beranda', '/'], ['Portofolio', '/portofolio/']])],
    body: `${pageHero({ items: [['Beranda', '/'], ['Portofolio', '/portofolio/']], h1: fmt(pg.portoTitle), lead: fmt(pg.portoLead), cover: pg.portoCover, cta: false })}
<section class="bg-paper"><div class="wrap"><div class="cards">${projects.map(projectCard).join('')}</div></div></section>
${portoGal.length ? `<section class="bg-paper" style="padding-top:0" id="galeri"><div class="wrap">
  ${head('', 'Galeri', 'Serah terima &amp; *proyek lainnya.*'.replace('&amp;', '&'), `<div class="tabs" style="margin:0;justify-self:end;width:auto" role="group" aria-label="Filter galeri">${filterTabs(GALLERY_CATS.filter(([v]) => ['serah', 'hunian', 'struktur'].includes(v)))}</div>`)}
  ${gallery(portoGal, 'galeri', 3)}
  <p class="reveal" style="margin-top:40px;text-align:center"><a class="btn btn-ghost" href="/galeri/">Galeri lengkap →</a></p>
</div></section>` : ''}
${(home.ongoing || []).length ? `<section class="bg-ink grid-d"><div class="wrap">${head('', 'Live update', 'Sedang *kami kerjakan.*')}${board(home.ongoing)}</div></section>` : ''}
${ctaSection()}`,
  });

  for (const p of projects) {
    const path_ = urls.project(p.slug);
    const others = projects.filter((x) => x.slug !== p.slug).slice(0, 3);
    const loc = L[p.city];
    const gal = ok(p.gallery);
    const svcs = (p.services || []).filter((s) => S[s]);
    add({
      path: path_, active: '/portofolio/', title: `${p.title || p.name} | ${site.name}`, description: String(p.summary || '').slice(0, 158),
      ogImage: ogImg(p.cover), ogType: 'article',
      ld: [breadcrumbLd([['Beranda', '/'], ['Portofolio', '/portofolio/'], [p.name, path_]])],
      body: `${pageHero({ items: [['Beranda', '/'], ['Portofolio', '/portofolio/'], [p.name, path_]], h1: esc(p.title || p.name), lead: esc(p.summary), cover: p.cover, cta: false, extra: `<div class="meta-row"><span>Lokasi <b>${esc(p.location)}</b></span><span>Kategori <b>${esc(p.category)}</b></span><span>Status <b>${esc(p.status)}</b></span></div>` })}
<section class="bg-paper"><div class="wrap">
  ${has(p.before) && has(p.after) ? `<div class="reveal" style="margin-bottom:72px">${beforeAfter(p.before, p.after, p.beforeLabel || undefined, p.afterLabel || undefined)}</div>` : ''}
  ${gal.length ? `<div class="gal${gal.length === 2 ? ' two' : ''} reveal" data-group="proj" style="margin-bottom:72px">${gal.map((s, j) => img(s, { sizes: j === 0 ? '(max-width:900px) 100vw, 66vw' : '(max-width:900px) 50vw, 33vw', cls: j === 0 && gal.length > 2 ? 'wide' : '' })).join('')}</div>` : ''}
  <div class="with-aside">
    <div class="prose reveal">${p.body || ''}${svcs.length ? `<p>Layanan terkait: ${svcs.map((s) => `<a href="${urls.service(s)}">${esc(S[s].name)}</a>`).join(', ')}${loc ? `, dan <a href="${urls.location(loc.slug)}">kontraktor ${esc(loc.name)}</a>` : ''}.</p>` : ''}</div>
    <aside class="aside">
      <dl class="spec" style="margin:0">${(p.facts || []).map((f) => `<div><dt>${esc(f.k)}</dt><dd>${esc(f.v)}</dd></div>`).join('')}<div><dt>Lokasi</dt><dd>${esc(p.location)}</dd></div></dl>
      <div class="aside-card"><h3>Proyek serupa?</h3><p>Diskusikan rencana Anda dengan tim yang mengerjakan proyek ini.</p><a class="btn btn-primary" href="${wa(`Halo ${site.name}, saya melihat proyek ${p.name} dan ingin konsultasi proyek serupa.`)}" target="_blank" rel="noopener">${ICONS.wa} Chat WhatsApp</a></div>
    </aside>
  </div>
</div></section>
${ok(p.progress).length ? `<section class="bg-ink"><div class="wrap">${head('', 'Progres lapangan', 'Dari desain *ke struktur nyata.*')}${gallery(p.progress, 'progres', 3)}</div></section>` : ''}
${p.video ? `<section class="bg-bp grid-bp"><div class="wrap">${head('', 'Video', 'Dokumentasi *hasil akhir.*')}<div class="vid reveal" data-yt="${esc(p.video)}" data-title="${esc(p.name)}" style="max-width:960px"></div></div></section>` : ''}
${others.length ? `<section class="bg-paper"><div class="wrap">${head('', 'Proyek lainnya', 'Lihat juga.', '<p class="lead"><a class="btn btn-ghost" href="/portofolio/">Semua portofolio →</a></p>')}<div class="cards">${others.map(projectCard).join('')}</div></div></section>` : ''}
${ctaSection()}`,
    });
  }

  // GALERI
  {
    const cats = GALLERY_CATS.filter(([v]) => photosByCat(v).length);
    const items = cats.flatMap(([v]) => photosByCat(v));
    const counts = { all: items.length, ...Object.fromEntries(cats.map(([v]) => [v, photosByCat(v).length])) };
    add({
      path: '/galeri/', active: '/galeri/', title: pg.galeriMetaTitle, description: `${items.length} ${plain(pg.galeriMetaDesc)}`, ogImage: ogImg(pg.galeriCover),
      ld: [
        breadcrumbLd([['Beranda', '/'], ['Galeri', '/galeri/']]),
        { '@type': 'ImageGallery', name: `Galeri Proyek ${site.name}`, url: abs('/galeri/'), publisher: { '@id': BIZ_ID }, image: items.map((s) => ({ '@type': 'ImageObject', contentUrl: abs(`/img/${s}-${media[s].sizes.at(-1)}.webp`), caption: media[s].alt })) },
      ],
      body: `${pageHero({ items: [['Beranda', '/'], ['Galeri', '/galeri/']], h1: fmt(pg.galeriTitle), lead: `${items.length} ${fmt(pg.galeriLead)}`, cover: pg.galeriCover, cta: false })}
<section class="bg-paper" id="galeri"><div class="wrap">
  <div class="tabs reveal" role="group" aria-label="Filter galeri" style="margin-bottom:40px">${filterTabs(cats, counts)}</div>
  ${gallery(items, 'galeri-page')}
</div></section>
${projects.length ? `<section class="bg-ink grid-d"><div class="wrap">${head('', 'Studi kasus', 'Cerita di balik *foto-foto ini.*', '<p class="lead"><a class="btn btn-ghost" href="/portofolio/">Semua portofolio →</a></p>')}<div class="cards">${projects.slice(0, 3).map(projectCard).join('')}</div></div></section>` : ''}
${ctaSection()}`,
    });
  }

  // BLOG
  add({
    path: '/blog/', active: '/blog/', title: pg.blogMetaTitle, description: pg.blogMetaDesc, ogImage: ogImg(pg.blogCover),
    ld: [breadcrumbLd([['Beranda', '/'], ['Blog', '/blog/']]), { '@type': 'Blog', name: `Blog ${site.name}`, url: abs('/blog/'), publisher: { '@id': BIZ_ID } }],
    body: `${pageHero({ items: [['Beranda', '/'], ['Blog', '/blog/']], h1: fmt(pg.blogTitle), lead: fmt(pg.blogLead), cover: pg.blogCover, cta: false })}
<section class="bg-paper"><div class="wrap"><div class="cards">${posts.map(postCard).join('') || '<p>Belum ada artikel.</p>'}</div></div></section>
${ctaSection()}`,
  });

  for (const p of posts) {
    const path_ = urls.post(p.slug);
    const svc = S[p.service];
    const others = posts.filter((x) => x.slug !== p.slug).slice(0, 3);
    add({
      path: path_, active: '/blog/', title: `${p.metaTitle || p.title} | ${site.name}`, ogTitle: p.title, description: p.description, ogImage: ogImg(p.cover), ogType: 'article',
      ld: [
        breadcrumbLd([['Beranda', '/'], ['Blog', '/blog/'], [p.title, path_]]),
        { '@type': 'BlogPosting', headline: p.title, description: p.description, ...(has(p.cover) ? { image: abs(`/img/${p.cover}-${media[p.cover].sizes.at(-1)}.webp`) } : {}), datePublished: p.date, dateModified: p.updated || p.date, inLanguage: 'id-ID', mainEntityOfPage: abs(path_), author: { '@type': 'Organization', name: p.author || `Tim ${site.name}`, url: site.url + '/' }, publisher: { '@id': BIZ_ID } },
      ],
      body: `${pageHero({ items: [['Beranda', '/'], ['Blog', '/blog/'], [p.title, path_]], h1: esc(p.title), lead: esc(p.description), cta: false, extra: `<div class="meta-row"><span>Oleh <b>${esc(p.author || `Tim ${site.name}`)}</b></span><span>Terbit <b><time datetime="${p.date}">${tanggal(p.date)}</time></b></span><span><b>${readTime(p.body)} menit</b> baca</span></div>` })}
<section class="bg-paper"><div class="wrap with-aside">
  <article class="prose">
    ${img(p.cover, { sizes: '(max-width:1000px) 100vw, 720px', eager: true })}
    ${p.body || ''}
  </article>
  <aside class="aside">
    ${svc ? `<div class="aside-card"><h3>${esc(svc.name)}</h3><p>${esc(plain(svc.lead))}</p><a class="btn btn-primary" href="${wa(`Halo ${site.name}, saya membaca artikel "${p.title}" dan ingin konsultasi.`)}" target="_blank" rel="noopener">${ICONS.wa} Konsultasi Gratis</a><a href="${urls.service(svc.slug)}" style="display:block;margin-top:16px;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#e9c9a0">Tentang layanan ini →</a></div>` : `<div class="aside-card"><h3>Konsultasi gratis</h3><p>${esc(home.ctaBoxText)}</p><a class="btn btn-primary" href="${wa()}" target="_blank" rel="noopener">${ICONS.wa} Chat WhatsApp</a></div>`}
    ${others.length ? `<div class="aside-links"><h4>Artikel lainnya</h4>${others.map((o) => `<a href="${urls.post(o.slug)}">${esc(o.title)}</a>`).join('')}</div>` : ''}
  </aside>
</div></section>
${ctaSection()}`,
    });
  }

  // HUB (link di bio Instagram), tidak diindeks
  add({
    path: '/hub/', bare: true, noindex: true, title: `${site.legalName} | Link`, description: pg.hubText || site.description,
    body: `<section class="hub bg-ink grid-d"><div class="wrap">
  <a href="/" class="logo-box"><img src="/img/logo.webp" width="${logo.w}" height="${logo.h}" alt="Logo ${esc(site.legalName)}"></a>
  <h1>${esc(site.legalName)}</h1>
  <p>${esc(pg.hubText)}</p>
  <nav class="hub-links" aria-label="Tautan ${esc(site.name)}">
    <a class="primary" href="${wa()}" target="_blank" rel="noopener"><b>Konsultasi via WhatsApp</b><span>Respon ${esc(hours0)}</span></a>
    ${services.map((s) => `<a href="${urls.service(s.slug)}"><b>${esc(s.name)}</b><span>${esc(plain(s.lead)).slice(0, 80)}…</span></a>`).join('\n    ')}
    <a href="/portofolio/"><b>Portofolio Proyek</b><span>Studi kasus dan galeri serah terima.</span></a>
    <a href="${wa(`Halo admin ${site.name}, saya mandor/vendor dan ingin bergabung sebagai mitra.`)}" target="_blank" rel="noopener"><b>Kerja Sama Mandor/Vendor</b><span>Gabung ekosistem ${esc(site.name)}. Chat admin untuk prosedur.</span></a>
  </nav>
</div></section>`,
  });

  add({
    path: '/404.html', file: '404.html', noindex: true, title: `Halaman tidak ditemukan | ${site.name}`, description: 'Halaman yang Anda cari tidak ditemukan.',
    body: pageHero({ items: [['Beranda', '/'], ['404', '/404.html']], h1: 'Halaman ini <em>tidak ditemukan.</em>', lead: 'Mungkin alamatnya sudah berubah. Coba mulai dari beranda atau lihat layanan kami.', cta: false, extra: '<div class="hero-cta"><a class="btn btn-primary" href="/">Ke beranda</a><a class="btn btn-ghost" href="/layanan/">Lihat layanan →</a></div>' }),
  });

  // ---------- tulis file ----------
  const OUT = dir.out;
  await fs.rm(OUT, { recursive: true, force: true });
  await fs.mkdir(path.join(OUT, 'assets'), { recursive: true });
  await fs.cp(dir.public, OUT, { recursive: true });
  await fs.cp(dir.media, path.join(OUT, 'img'), { recursive: true });

  const minCss = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s*\n\s*/g, '').replace(/\s*([{};,>])\s*/g, '$1').replace(/;}/g, '}');
  const css = minCss((await fs.readFile(path.join(dir.assets, 'site.css'), 'utf8')) + '\n' + (await fs.readFile(path.join(dir.assets, 'pages.css'), 'utf8'))
    + '.kx .h4{font:inherit;margin:0}.kx .h5{font-size:10.5px;font-weight:700;color:#e9c9a0;letter-spacing:.28em;text-transform:uppercase;margin:0 0 24px}');
  const js = await fs.readFile(path.join(dir.assets, 'site.js'), 'utf8');
  const hash = (s) => crypto.createHash('md5').update(s).digest('hex').slice(0, 8);
  ASSETS = { css: `site.${hash(css)}.css`, js: `site.${hash(js)}.js` };
  await fs.writeFile(path.join(OUT, 'assets', ASSETS.css), css);
  await fs.writeFile(path.join(OUT, 'assets', ASSETS.js), js);

  for (const p of pages) {
    const file = p.file ? path.join(OUT, p.file) : path.join(OUT, p.path, 'index.html');
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, layout(p));
  }

  const indexable = pages.filter((p) => !p.noindex);
  const lastmod = (p) => (p.path.startsWith('/blog/') && (POST[p.path.split('/')[2]]?.updated || POST[p.path.split('/')[2]]?.date)) || today;
  await fs.writeFile(path.join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${indexable.map((p) => `  <url><loc>${abs(p.path)}</loc><lastmod>${lastmod(p)}</lastmod></url>`).join('\n')}
</urlset>
`);
  await fs.writeFile(path.join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: ${abs('/sitemap.xml')}\n`);
  await fs.writeFile(path.join(OUT, 'site.webmanifest'), JSON.stringify({ name: site.legalName, short_name: site.name, start_url: '/', display: 'browser', background_color: '#0b0f12', theme_color: '#0b0f12', icons: [{ src: '/icon-512.png', sizes: '512x512', type: 'image/png' }] }));

  // Redirect untuk hosting statis lain (Netlify/Cloudflare/cPanel). Server Kalmer membaca tabel redirect langsung.
  const redirects = c.redirects.filter((r) => r.from?.startsWith('/') && r.to);
  await fs.writeFile(path.join(OUT, '_redirects'), redirects.map((r) => `${r.from} ${r.to} 301\n${r.from.replace(/\/$/, '')} ${r.to} 301`).join('\n') + '\n');
  await fs.writeFile(path.join(OUT, '.htaccess'), `Options -Indexes\nErrorDocument 404 /404.html\n${redirects.map((r) => `Redirect 301 ${r.from.replace(/\/$/, '')} ${r.to}`).join('\n')}\n`);

  return { pages: pages.length, warnings: [...new Set(warnings)] };
}
