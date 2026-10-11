// Panel admin Kalmer. Satu file, tanpa framework.
// Semua teks dari server dimasukkan lewat textContent (bukan innerHTML) kecuali
// isi editor artikel, yang sudah dibersihkan server.

// ---------- utilitas DOM ----------
const $ = (s, r = document) => r.querySelector(s);
function h(tag, props = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'style') el.style.cssText = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k === 'html') el.innerHTML = v; // hanya untuk HTML yang sudah disanitasi server
    else if (k in el && k !== 'list') { try { el[k] = v; } catch { el.setAttribute(k, v); } }
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const kid of kids.flat(Infinity)) if (kid != null && kid !== false) el.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
  return el;
}
const ICON = {
  dash: 'M3 13h8V3H3zm0 8h8v-6H3zm10 0h8V11h-8zm0-18v6h8V3z',
  home: 'M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  services: 'M4 6h16M4 12h16M4 18h10',
  projects: 'M3 7h18v13H3zM8 7V4h8v3',
  blog: 'M5 4h14v16H5zM8 8h8M8 12h8M8 16h5',
  map: 'M9 4l6 2 6-2v16l-6 2-6-2-6 2V6zM9 4v16M15 6v16',
  clients: 'M4 18V8l8-4 8 4v10M9 18v-5h6v5',
  media: 'M4 5h16v14H4zM4 15l5-5 4 4 3-3 4 4M15 9h.01',
  settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z',
  pages: 'M6 3h9l4 4v14H6zM14 3v5h5',
  redirect: 'M4 12h13M13 6l6 6-6 6',
  users: 'M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 20v-2a4 4 0 0 0-3-3.9M16 2.1a4 4 0 0 1 0 7.8',
  menu: 'M3 6h18M3 12h18M3 18h18',
  up: 'M12 19V5M5 12l7-7 7 7', down: 'M12 5v14M19 12l-7 7-7-7', x: 'M18 6L6 18M6 6l12 12', left: 'M15 18l-6-6 6-6', right: 'M9 18l6-6-6-6',
};
const svg = (name) => { const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('fill', 'none'); s.setAttribute('stroke', 'currentColor'); s.setAttribute('stroke-width', '1.8'); s.setAttribute('stroke-linecap', 'round'); s.setAttribute('stroke-linejoin', 'round'); const p = document.createElementNS('http://www.w3.org/2000/svg', 'path'); p.setAttribute('d', ICON[name] || ICON.pages); s.append(p); return s; };
const iconBtn = (name, title, onclick, disabled) => h('button', { type: 'button', class: 'icon-btn', title, 'aria-label': title, onclick, disabled }, svg(name));

let toastT;
function toast(msg, err) { const t = $('#toast'); t.textContent = msg; t.className = 'show' + (err ? ' err' : ''); clearTimeout(toastT); toastT = setTimeout(() => (t.className = ''), err ? 6000 : 3500); }
const fmtTime = (s) => { if (!s) return '—'; const d = new Date(s.includes('T') ? s : s.replace(' ', 'T') + 'Z'); return d.toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }); };
const fmtDate = (s) => (s ? new Date(s + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '—');
const slugify = (s) => String(s).normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/&/g, ' dan ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
const clone = (o) => JSON.parse(JSON.stringify(o ?? null));

// ---------- API ----------
class ApiError extends Error { constructor(status, errors, data) { super(errors.join('\n')); this.status = status; this.errors = errors; this.data = data; } }
async function api(method, url, body, headers = {}) {
  const isFile = body instanceof Blob;
  const res = await fetch(url, {
    method, credentials: 'same-origin',
    headers: { 'X-Kalmer': '1', ...(body && !isFile ? { 'Content-Type': 'application/json' } : {}), ...headers },
    body: body == null ? undefined : isFile ? body : JSON.stringify(body),
  });
  let data = null;
  try { data = await res.json(); } catch { /* respons kosong */ }
  if (res.status === 401 && url !== '/api/login') { S.user = null; renderLogin(); throw new ApiError(401, ['Sesi berakhir, silakan login lagi']); }
  if (!res.ok) throw new ApiError(res.status, data?.errors || ['Terjadi kesalahan'], data);
  if (data?.status) setStatus(data.status);
  return data;
}

// ---------- state ----------
const S = { user: null, schema: null, status: null, media: [], dirty: false, options: {} };
const mediaBySlug = () => Object.fromEntries(S.media.map((m) => [m.slug, m]));
const thumbUrl = (slug) => {
  const m = mediaBySlug()[slug];
  if (!m) return null;
  return m.kind === 'logo' ? `/api/file/${slug}.webp` : `/api/file/${slug}-${m.sizes[0]}.webp`;
};
const loadMedia = async () => (S.media = await api('GET', '/api/media'));
const options = async (col, fresh) => (!fresh && S.options[col]) || (S.options[col] = await api('GET', `/api/options/${col}`));

function setDirty(v) {
  S.dirty = v;
  const m = $('.savebar .msg');
  if (m) { m.textContent = v ? 'Ada perubahan yang belum disimpan' : 'Semua perubahan tersimpan'; m.classList.toggle('dirty', v); }
}
addEventListener('beforeunload', (e) => { if (S.dirty) { e.preventDefault(); e.returnValue = ''; } });

function setStatus(st) {
  S.status = st;
  const pill = $('#pubPill');
  if (!pill) return;
  pill.className = 'pill' + (st.pending ? ' warn' : '');
  pill.textContent = st.pending ? 'Ada perubahan belum tayang' : 'Situs sudah terbaru';
  $('#pubBtn').classList.toggle('red', !!st.pending);
}

// ---------- login ----------
function renderLogin() {
  const err = h('div', { class: 'errors hidden' });
  const form = h('form', {
    async onsubmit(e) {
      e.preventDefault();
      err.classList.add('hidden');
      const btn = $('button', form); btn.disabled = true;
      try {
        const r = await api('POST', '/api/login', { username: form.username.value.trim(), password: form.password.value });
        S.user = r.user; await boot();
      } catch (x) { err.textContent = x.errors.join(' '); err.classList.remove('hidden'); btn.disabled = false; }
    },
  },
  h('img', { src: '/img/logo.webp', alt: 'Kalmer' }),
  h('h1', {}, 'Panel Admin'), h('p', {}, 'Masuk untuk mengelola konten situs.'),
  err,
  h('div', { class: 'form' },
    h('div', { class: 'field' }, h('label', { for: 'u' }, 'Username'), h('input', { id: 'u', name: 'username', type: 'text', autocomplete: 'username', required: true, autofocus: true })),
    h('div', { class: 'field' }, h('label', { for: 'p' }, 'Password'), h('input', { id: 'p', name: 'password', type: 'password', autocomplete: 'current-password', required: true }))),
  h('button', { class: 'btn primary', type: 'submit' }, 'Masuk'));
  $('#app').replaceChildren(h('div', { class: 'login' }, form));
}

// ---------- kerangka ----------
function navItems() {
  const isAdmin = S.user.role === 'admin';
  const c = S.schema.collections;
  return [
    ['', [['#/', 'Dasbor', 'dash']]],
    ['Konten', [['#/s/home', 'Beranda', 'home'], ['#/c/services', 'Layanan', 'services'], ['#/c/projects', 'Portofolio', 'projects'], ['#/c/posts', 'Blog', 'blog'], ['#/c/locations', 'Area', 'map'], ['#/c/clients', 'Logo Klien', 'clients'], ['#/media', 'Foto & Media', 'media']]],
    ['Pengaturan', [['#/s/site', 'Pengaturan Situs', 'settings'], ['#/s/pages', 'Halaman Daftar', 'pages'], c.redirects && ['#/c/redirects', 'Pengalihan URL', 'redirect'], isAdmin && ['#/users', 'Pengguna', 'users']].filter(Boolean)],
  ];
}
function renderShell() {
  const nav = h('nav', {}, navItems().map(([sec, items]) => [sec && h('div', { class: 'sec' }, sec), items.map(([href, label, ic]) => h('a', { class: 'item', href, 'data-href': href }, svg(ic), label))]));
  const side = h('aside', { class: 'side' },
    h('a', { class: 'brand', href: '#/' }, h('img', { src: '/img/logo.webp', alt: '' }), 'Admin Kalmer'),
    nav,
    h('div', { class: 'me' }, h('b', {}, S.user.name), h('span', { class: 'muted' }, S.user.role === 'admin' ? 'Admin' : 'Editor'),
      h('div', { class: 'row' }, h('a', { class: 'btn', href: '#/akun' }, 'Akun saya'), h('button', { class: 'btn', onclick: logout }, 'Keluar'))));
  const top = h('header', { class: 'top' },
    h('button', { class: 'icon-btn burger', 'aria-label': 'Menu', onclick: () => $('.shell').classList.toggle('menu') }, svg('menu')),
    h('div', { class: 'pub' },
      h('span', { id: 'pubPill', class: 'pill' }, '…'),
      h('a', { class: 'btn', href: '/', target: '_blank', rel: 'noopener' }, 'Lihat situs ↗'),
      h('button', { id: 'pubBtn', class: 'btn primary', onclick: doPublish }, 'Publikasikan')));
  const shell = h('div', { class: 'shell' }, side, h('div', { class: 'main' }, top, h('main', { class: 'view', id: 'view' })));
  shell.addEventListener('click', (e) => { if (e.target.closest('.side a')) shell.classList.remove('menu'); });
  $('#app').replaceChildren(shell);
  if (S.status) setStatus(S.status);
}
const view = () => $('#view');
function markNav() {
  const hash = location.hash || '#/';
  document.querySelectorAll('.side a.item').forEach((a) => a.classList.toggle('on', a.dataset.href === '#/' ? hash === '#/' : hash.startsWith(a.dataset.href)));
}

async function logout() {
  if (S.dirty && !confirm('Ada perubahan yang belum disimpan. Tetap keluar?')) return;
  await api('POST', '/api/logout').catch(() => {});
  S.user = null; setDirty(false); renderLogin();
}

async function doPublish() {
  const btn = $('#pubBtn');
  if (S.dirty && !confirm('Ada perubahan di halaman ini yang BELUM disimpan dan tidak akan ikut dipublikasikan. Lanjutkan?')) return;
  btn.disabled = true; btn.textContent = 'Memublikasikan…';
  try {
    const r = await api('POST', '/api/publish');
    toast(`Situs diperbarui: ${r.pages} halaman dalam ${(r.ms / 1000).toFixed(1)} detik`);
    if (r.warnings?.length) modal('Dipublikasikan dengan catatan', h('div', {}, h('p', {}, 'Situs berhasil diperbarui, tetapi ada yang perlu diperiksa:'), h('ul', {}, r.warnings.map((w) => h('li', {}, w)))), [['Tutup', null, 'primary']]);
    if (location.hash === '#/' || location.hash === '') route();
  } catch (e) { toast(e.message, true); }
  btn.disabled = false; btn.textContent = 'Publikasikan';
}

// ---------- modal ----------
function modal(title, body, buttons = [['Tutup']], { wide } = {}) {
  return new Promise((resolve) => {
    const close = (v) => { m.remove(); resolve(v); };
    const m = h('div', { class: 'modal', onclick: (e) => e.target === m && close(null) },
      h('div', { class: 'box' + (wide ? '' : ' narrow'), role: 'dialog', 'aria-modal': 'true', 'aria-label': title },
        h('div', { class: 'mh' }, h('h2', {}, title), iconBtn('x', 'Tutup', () => close(null))),
        h('div', { class: 'mb' }, body),
        buttons.length ? h('div', { class: 'mf' }, buttons.map(([label, value, cls]) => h('button', { type: 'button', class: 'btn ' + (cls || ''), onclick: () => close(typeof value === 'function' ? value() : value) }, label))) : null));
    m.addEventListener('keydown', (e) => e.key === 'Escape' && close(null));
    document.body.append(m);
    ($('input,select,textarea,button.primary', m) || $('button', m)).focus();
  });
}

// ---------- pemilih foto ----------
// Pilih satu foto (klik langsung memilih) atau banyak foto (centang lalu "Pakai").
// Hasil: array slug, atau null jika dibatalkan.
async function pickMedia({ multi = false, kind = 'photo' } = {}) {
  await loadMedia();
  return new Promise((resolve) => {
    const picked = [];
    let q = '', cat = '';
    const finish = (v) => { box.remove(); resolve(v); };
    const grid = h('div', { class: 'mgrid' });
    const draw = () => {
      const list = S.media.filter((m) => m.kind === kind && (!cat || m.cat === cat) && (!q || (m.slug + ' ' + m.alt).toLowerCase().includes(q)));
      grid.replaceChildren(...list.map((m) => h('div', {
        class: 'm' + (kind === 'logo' ? ' logo' : '') + (picked.includes(m.slug) ? ' sel' : ''), title: m.alt || m.slug, tabIndex: 0,
        onclick() {
          if (!multi) return finish([m.slug]);
          const i = picked.indexOf(m.slug); i === -1 ? picked.push(m.slug) : picked.splice(i, 1); draw();
        },
      }, h('img', { src: thumbUrl(m.slug), alt: '', loading: 'lazy' }), h('div', { class: 'cap' }, m.alt || m.slug))));
      if (!list.length) grid.replaceChildren(h('div', { class: 'empty' }, 'Tidak ada foto.'));
    };
    const up = uploader(kind, async (items) => {
      await loadMedia();
      if (!multi) return finish([items[0].slug]);
      items.forEach((i) => picked.push(i.slug)); draw();
    });
    const tools = h('div', { class: 'bar' },
      h('input', { type: 'search', placeholder: 'Cari foto…', oninput: (e) => { q = e.target.value.toLowerCase(); draw(); }, style: 'max-width:260px' }),
      kind === 'photo' ? catSelect('', (v) => { cat = v; draw(); }, 'Semua kategori') : null);
    const title = multi ? 'Pilih foto (bisa lebih dari satu)' : kind === 'logo' ? 'Pilih logo' : 'Pilih foto';
    const box = h('div', { class: 'modal', onclick: (e) => e.target === box && finish(null), onkeydown: (e) => e.key === 'Escape' && finish(null) },
      h('div', { class: 'box', role: 'dialog', 'aria-modal': 'true', 'aria-label': title },
        h('div', { class: 'mh' }, h('h2', {}, title), iconBtn('x', 'Tutup', () => finish(null))),
        h('div', { class: 'mb' }, up.el, tools, grid),
        h('div', { class: 'mf' }, h('button', { type: 'button', class: 'btn', onclick: () => finish(null) }, 'Batal'),
          multi ? h('button', { type: 'button', class: 'btn primary', onclick: () => finish([...picked]) }, 'Pakai foto terpilih') : null)));
    document.body.append(box);
    draw();
    $('input[type=search]', box).focus();
  });
}
function catSelect(value, onchange, emptyLabel) {
  const opts = [['', emptyLabel || '— Tidak tampil di galeri —'], ['komersial', 'Komersial & F&B'], ['hunian', 'Hunian'], ['serah', 'Serah Terima'], ['desain', 'Desain 3D'], ['progres', 'Progres Lapangan'], ['struktur', 'Struktur Baja']];
  return h('select', { onchange: (e) => onchange(e.target.value), style: 'max-width:240px' }, opts.map(([v, l]) => h('option', { value: v, selected: v === value }, l)));
}
// area upload (seret-lepas / pilih file), upload satu per satu
function uploader(kind, onDone) {
  const log = h('div', { class: 'uploads' });
  const input = h('input', { type: 'file', accept: 'image/jpeg,image/png,image/webp,image/heic,image/avif', multiple: true, class: 'hidden', onchange: (e) => run([...e.target.files]) });
  const el = h('div', {}, h('div', { class: 'drop', ondragover: (e) => { e.preventDefault(); el.firstChild.classList.add('over'); }, ondragleave: () => el.firstChild.classList.remove('over'), ondrop: (e) => { e.preventDefault(); el.firstChild.classList.remove('over'); run([...e.dataTransfer.files]); } },
    `Seret ${kind === 'logo' ? 'logo' : 'foto'} ke sini, atau `, h('button', { type: 'button', class: 'btn sm', onclick: () => input.click() }, 'pilih dari komputer'), input,
    h('div', { class: 'small', style: 'margin-top:6px' }, 'JPG, PNG, atau WebP, maks. 20 MB. Foto otomatis dikompres.')), log);
  async function run(files) {
    const done = [];
    for (const f of files) {
      const line = h('div', {}, `⏳ ${f.name}`); log.append(line);
      try {
        const item = await api('POST', '/api/media', f, { 'X-Filename': encodeURIComponent(f.name), 'X-Kind': kind, 'Content-Type': 'application/octet-stream' });
        line.textContent = `✓ ${f.name}`; done.push(item);
      } catch (e) { line.textContent = `✗ ${f.name}: ${e.message}`; line.style.color = 'var(--red)'; }
    }
    if (done.length) { toast(`${done.length} foto diunggah. Jangan lupa isi keterangannya.`); onDone(done); }
  }
  return { el };
}

// ---------- widget field ----------
// get/set nilai ke objek `data[f.key]`; panggil `changed()` saat berubah
function fieldWidget(f, data, changed) {
  const set = (v) => { data[f.key] = v; changed(); };
  const val = data[f.key];
  const wrap = (control, extra) => h('div', { class: 'field', 'data-key': f.key }, h('label', {}, f.label), control, f.hint ? h('div', { class: 'hint' }, f.hint) : null, extra);

  switch (f.type) {
    case 'textarea': case 'text': {
      const count = f.max ? h('div', { class: 'count' }) : null;
      const upd = (v) => { if (count) { count.textContent = `${v.length} / ${f.max}`; count.classList.toggle('over', v.length > f.max); } };
      const el = f.type === 'textarea' ? h('textarea', { oninput: (e) => { upd(e.target.value); set(e.target.value); } }) : h('input', { type: 'text', value: val ?? '', oninput: (e) => { upd(e.target.value); set(e.target.value); } });
      if (f.type === 'textarea') el.value = val ?? '';
      upd(String(val ?? ''));
      return wrap(el, count);
    }
    case 'number': return wrap(h('input', { type: 'number', value: val ?? '', min: f.min, max: f.max, style: 'max-width:160px', oninput: (e) => set(e.target.value === '' ? null : +e.target.value) }));
    case 'date': return wrap(h('input', { type: 'date', value: val || '', style: 'max-width:200px', oninput: (e) => set(e.target.value) }));
    case 'boolean': return h('div', { class: 'field' }, h('label', { class: 'toggle' }, h('input', { type: 'checkbox', checked: !!val, onchange: (e) => set(e.target.checked) }), f.label), f.hint ? h('div', { class: 'hint' }, f.hint) : null);
    case 'select': {
      if (val == null && f.options[0]) data[f.key] = f.options[0].value;
      return wrap(h('select', { style: 'max-width:340px', onchange: (e) => set(e.target.value) }, f.options.map((o) => h('option', { value: o.value, selected: o.value === data[f.key] }, o.label))));
    }
    case 'multiselect': {
      const cur = new Set(val || []);
      return wrap(h('div', { class: 'checks' }, f.options.map((o) => h('label', {}, h('input', { type: 'checkbox', checked: cur.has(o.value), onchange: (e) => { e.target.checked ? cur.add(o.value) : cur.delete(o.value); set(f.options.map((x) => x.value).filter((x) => cur.has(x))); } }), o.label))));
    }
    case 'tags': {
      const arr = [...(val || [])];
      const box = h('div', { class: 'tags' });
      const input = h('input', { type: 'text', placeholder: f.youtube ? 'Tempel link YouTube lalu Enter' : 'Ketik lalu tekan Enter', onkeydown: (e) => { if ((e.key === 'Enter' || e.key === ',') && input.value.trim()) { e.preventDefault(); arr.push(input.value.trim()); input.value = ''; draw(); set([...arr]); } else if (e.key === 'Backspace' && !input.value && arr.length) { arr.pop(); draw(); set([...arr]); } }, onblur: () => { if (input.value.trim()) { arr.push(input.value.trim()); input.value = ''; draw(); set([...arr]); } } });
      const draw = () => box.replaceChildren(...arr.map((t, i) => h('span', { class: 'tag' }, t, iconBtn('x', 'Hapus', () => { arr.splice(i, 1); draw(); set([...arr]); }))), input);
      draw();
      return wrap(box);
    }
    case 'image': {
      const box = h('div', { class: 'pic' });
      const kind = f.kind || 'photo';
      const draw = () => {
        const url = data[f.key] && thumbUrl(data[f.key]);
        box.replaceChildren(url ? h('img', { src: url, alt: '', class: kind === 'logo' ? 'logo' : '' }) : h('div', { class: 'none' }, data[f.key] ? 'Tidak ditemukan' : 'Belum ada'),
          h('div', { style: 'display:flex;gap:8px;flex-wrap:wrap' },
            h('button', { type: 'button', class: 'btn sm', async onclick() { const r = await pickMedia({ kind }); if (r?.length) { set(r[0]); draw(); } } }, data[f.key] ? 'Ganti' : (kind === 'logo' ? 'Pilih logo' : 'Pilih foto')),
            data[f.key] ? h('button', { type: 'button', class: 'btn sm ghost', onclick: () => { set(''); draw(); } }, 'Kosongkan') : null));
      };
      draw();
      return wrap(box);
    }
    case 'images': {
      const arr = [...(val || [])];
      const box = h('div', { class: 'pics' });
      const draw = () => box.replaceChildren(...arr.map((slug, i) => h('div', { class: 'p' }, h('img', { src: thumbUrl(slug) || '', alt: '', title: mediaBySlug()[slug]?.alt || slug }), h('div', { class: 'ctl' },
        iconBtn('left', 'Geser ke kiri', () => { [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]]; draw(); set([...arr]); }, i === 0),
        iconBtn('x', 'Lepas dari daftar', () => { arr.splice(i, 1); draw(); set([...arr]); }),
        iconBtn('right', 'Geser ke kanan', () => { [arr[i + 1], arr[i]] = [arr[i], arr[i + 1]]; draw(); set([...arr]); }, i === arr.length - 1)))),
      h('div', { class: 'add', role: 'button', tabIndex: 0, async onclick() { const r = await pickMedia({ multi: true }); if (r?.length) { r.forEach((s) => !arr.includes(s) && arr.push(s)); draw(); set([...arr]); } } }, '+ Tambah foto'));
      draw();
      return wrap(box);
    }
    case 'ref': {
      const sel = h('select', { style: 'max-width:420px', onchange: (e) => set(e.target.value) }, h('option', { value: '' }, '— Tidak ada —'));
      options(f.collection).then((opts) => opts.forEach((o) => sel.append(h('option', { value: o.value, selected: o.value === val }, o.label))));
      return wrap(sel);
    }
    case 'refs': {
      const arr = [...(val || [])];
      const chips = h('div', { class: 'chips' });
      const sel = h('select', { style: 'max-width:420px', onchange: (e) => { if (e.target.value && !arr.includes(e.target.value)) { arr.push(e.target.value); draw(); set([...arr]); } e.target.value = ''; } });
      let opts = [];
      const label = (v) => opts.find((o) => o.value === v)?.label || v;
      const draw = () => {
        chips.replaceChildren(...arr.map((v, i) => h('span', { class: 'chip' }, label(v), iconBtn('left', 'Pindah ke depan', () => { [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]]; draw(); set([...arr]); }, i === 0), iconBtn('x', 'Hapus', () => { arr.splice(i, 1); draw(); set([...arr]); }))));
        sel.replaceChildren(h('option', { value: '' }, '+ Tambahkan…'), ...opts.filter((o) => !arr.includes(o.value)).map((o) => h('option', { value: o.value }, o.label)));
      };
      options(f.collection).then((o) => { opts = o; draw(); });
      return wrap(h('div', {}, chips, sel));
    }
    case 'richtext': return wrap(richText(val || '', set));
    case 'list': return wrap(listWidget(f, data, changed));
    default: return wrap(h('em', {}, 'Tipe field tidak dikenal: ' + f.type));
  }
}

function listWidget(f, data, changed) {
  if (!Array.isArray(data[f.key])) data[f.key] = [];
  const arr = data[f.key];
  const box = h('div', { class: 'items' });
  const titleOf = (it, i) => (f.itemTitle && it[f.itemTitle]) || `Item ${i + 1}`;
  const open = new Set();
  const draw = () => {
    box.replaceChildren(...arr.map((it, i) => {
      const tEl = h('span', { class: 't' }, titleOf(it, i));
      const body = h('div', { class: 'ib' }, f.fields.map((sf) => fieldWidget(sf, it, () => { tEl.textContent = titleOf(it, i); changed(); })));
      const el = h('div', { class: 'litem' + (open.has(i) ? '' : ' closed') },
        h('div', { class: 'ih', onclick: (e) => { if (e.target.closest('button')) return; el.classList.toggle('closed'); el.classList.contains('closed') ? open.delete(i) : open.add(i); } },
          h('span', { class: 'n' }, `${i + 1}.`), tEl,
          iconBtn('up', 'Naikkan', () => { [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]]; open.clear(); draw(); changed(); }, i === 0),
          iconBtn('down', 'Turunkan', () => { [arr[i + 1], arr[i]] = [arr[i], arr[i + 1]]; open.clear(); draw(); changed(); }, i === arr.length - 1),
          iconBtn('x', 'Hapus item ini', () => { if (confirm(`Hapus "${titleOf(it, i)}"?`)) { arr.splice(i, 1); open.clear(); draw(); changed(); } })),
        body);
      return el;
    }), h('button', { type: 'button', class: 'btn sm', style: 'justify-self:start', onclick: () => { arr.push({}); open.add(arr.length - 1); draw(); changed(); } }, '+ Tambah'));
  };
  draw();
  return box;
}

// editor artikel sederhana
function richText(html, set) {
  const ed = h('div', { class: 'ed', contentEditable: 'true', html, spellcheck: true });
  const exec = (cmd, arg) => { ed.focus(); document.execCommand(cmd, false, arg); set(ed.innerHTML); };
  const tb = h('div', { class: 'tb' },
    h('button', { type: 'button', title: 'Judul bagian', onclick: () => exec('formatBlock', '<h2>') }, 'H2'),
    h('button', { type: 'button', title: 'Sub-judul', onclick: () => exec('formatBlock', '<h3>') }, 'H3'),
    h('button', { type: 'button', title: 'Paragraf biasa', onclick: () => exec('formatBlock', '<p>') }, '¶'),
    h('span', { class: 'sep' }),
    h('button', { type: 'button', title: 'Tebal', onclick: () => exec('bold') }, 'B'),
    h('button', { type: 'button', title: 'Miring', onclick: () => exec('italic'), style: 'font-style:italic' }, 'I'),
    h('span', { class: 'sep' }),
    h('button', { type: 'button', title: 'Daftar berpoin', onclick: () => exec('insertUnorderedList') }, '• Daftar'),
    h('button', { type: 'button', title: 'Daftar bernomor', onclick: () => exec('insertOrderedList') }, '1. Daftar'),
    h('span', { class: 'sep' }),
    h('button', { type: 'button', title: 'Tambah tautan', onclick: () => { const u = prompt('Alamat tautan (contoh: /blog/judul-artikel/ atau https://…)'); if (u) exec('createLink', u.trim()); } }, '🔗 Tautan'),
    h('button', { type: 'button', title: 'Hapus tautan', onclick: () => exec('unlink') }, 'Lepas'),
    h('button', { type: 'button', title: 'Hapus format', onclick: () => exec('removeFormat') }, 'Tx'));
  ed.addEventListener('input', () => set(ed.innerHTML));
  // tempel sebagai teks biasa agar format dari Word/WhatsApp tidak ikut
  ed.addEventListener('paste', (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    const paras = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
    if (paras.length <= 1) document.execCommand('insertText', false, text);
    else document.execCommand('insertHTML', false, paras.map((p) => `<p>${p.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\n/g, '<br>')}</p>`).join(''));
    set(ed.innerHTML);
  });
  return h('div', { class: 'rte' }, tb, ed);
}

function errorBox(errors) { return h('div', { class: 'errors' }, h('b', {}, 'Belum bisa disimpan:'), h('ul', {}, errors.map((e) => h('li', {}, e)))); }
function saveBar(onSave, extra = []) {
  const btn = h('button', { class: 'btn primary', type: 'button', async onclick() { btn.disabled = true; try { await onSave(); } finally { btn.disabled = false; } } }, 'Simpan');
  return h('div', { class: 'savebar' }, h('span', { class: 'msg' }, 'Semua perubahan tersimpan'), ...extra, btn);
}

// ---------- halaman: dasbor ----------
async function viewDashboard() {
  const [st, act] = await Promise.all([api('GET', '/api/status'), api('GET', '/api/activity')]);
  setStatus(st);
  view().replaceChildren(
    h('h1', {}, `Halo, ${S.user.name}`), h('p', { class: 'sub' }, 'Kelola isi situs kalmer.id dari sini.'),
    h('div', { class: 'grid2' },
      h('div', { class: 'card pad stat-card' },
        h('h3', {}, st.pending ? 'Ada perubahan yang belum tayang' : 'Situs sudah terbaru'),
        h('p', {}, st.pending ? 'Perubahan sudah tersimpan, tapi baru tampil di situs setelah Anda menekan Publikasikan.' : `Terakhir dipublikasikan ${fmtTime(st.publishedAt)}.`),
        h('button', { class: 'btn ' + (st.pending ? 'red' : 'primary'), onclick: doPublish }, 'Publikasikan sekarang')),
      h('div', { class: 'card pad stat-card' }, h('h3', {}, 'Cara kerja'), h('p', {}, '1. Ubah konten lalu klik Simpan. 2. Klik Publikasikan agar perubahan tampil di situs. Anda bisa menyimpan beberapa perubahan dulu, lalu publikasikan sekaligus.'),
        S.user.role === 'admin' ? h('a', { class: 'btn', href: '/api/export', download: '' }, 'Unduh cadangan konten') : null)),
    h('h2', { style: 'font-size:17px;margin:28px 0 12px' }, 'Pintasan'),
    h('div', { class: 'quick' },
      h('a', { href: '#/c/posts/new' }, 'Tulis artikel', h('small', {}, 'Artikel blog baru')),
      h('a', { href: '#/c/projects/new' }, 'Tambah proyek', h('small', {}, 'Studi kasus portofolio')),
      h('a', { href: '#/media' }, 'Upload foto', h('small', {}, 'Galeri & foto proyek')),
      h('a', { href: '#/s/home' }, 'Edit beranda', h('small', {}, 'Teks, slider, FAQ'))),
    h('h2', { style: 'font-size:17px;margin:28px 0 12px' }, 'Aktivitas terakhir'),
    h('div', { class: 'card pad' }, act.length ? h('ul', { class: 'activity' }, act.map((a) => h('li', {}, h('time', {}, fmtTime(a.at)), h('span', {}, h('b', {}, a.user || 'sistem'), ` ${a.action} `, a.target || '')))) : h('div', { class: 'muted' }, 'Belum ada aktivitas.')));
}

// ---------- halaman: pengaturan tunggal ----------
async function viewSingleton(name) {
  const def = S.schema.singletons[name];
  const data = clone(await api('GET', `/api/settings/${name}`)) || {};
  const errs = h('div');
  const changed = () => setDirty(true);
  const groups = def.groups.map(([label, fields], i) => h('details', { class: 'group', open: i === 0 }, h('summary', {}, label), h('div', { class: 'body' }, fields.map((f) => fieldWidget(f, data, changed)))));
  view().replaceChildren(h('h1', {}, def.label), h('p', { class: 'sub' }, 'Klik judul bagian untuk membuka. Perubahan tampil di situs setelah disimpan lalu dipublikasikan.'), errs, h('div', { class: 'form' }, groups),
    saveBar(async () => {
      errs.replaceChildren();
      try { await api('PUT', `/api/settings/${name}`, data); setDirty(false); toast('Tersimpan. Klik Publikasikan agar tampil di situs.'); }
      catch (e) { errs.replaceChildren(errorBox(e.errors)); errs.scrollIntoView({ behavior: 'smooth' }); }
    }));
}

// ---------- halaman: daftar koleksi ----------
async function viewList(col) {
  const def = S.schema.collections[col];
  if (!def) return viewNotFound();
  let items = await api('GET', `/api/c/${col}`);
  let q = '';
  const tbody = h('tbody');
  const isLogo = col === 'clients';
  const draw = () => {
    const list = items.filter((it) => !q || String(it.title).toLowerCase().includes(q));
    tbody.replaceChildren(...list.map((it) => {
      const idx = items.indexOf(it);
      return h('tr', { class: 'click', onclick: (e) => { if (!e.target.closest('button')) location.hash = `#/c/${col}/${encodeURIComponent(it.id)}`; } },
        h('td', { style: 'width:72px' }, it.cover && thumbUrl(it.cover) ? h('img', { class: 'thumb' + (isLogo ? ' logo' : ''), src: thumbUrl(it.cover), alt: '' }) : h('div', { class: 'thumb' })),
        h('td', {}, h('b', {}, it.title || '(tanpa judul)'), col === 'posts' ? h('div', { class: 'small muted' }, fmtDate(it.date)) : null),
        h('td', {}, col === 'posts' ? h('span', { class: 'badge ' + (it.status === 'published' ? 'ok' : 'warn') }, it.status === 'published' ? 'Terbit' : 'Draf') : null),
        h('td', { class: 'small muted' }, fmtTime(it.updated), it.by ? ` · ${it.by}` : ''),
        def.sortable ? h('td', { style: 'width:80px;white-space:nowrap' },
          iconBtn('up', 'Naikkan', () => move(idx, -1), idx === 0 || !!q), iconBtn('down', 'Turunkan', () => move(idx, 1), idx === items.length - 1 || !!q)) : null);
    }));
    if (!list.length) tbody.replaceChildren(h('tr', {}, h('td', { colSpan: 5, class: 'empty' }, q ? 'Tidak ada yang cocok.' : 'Belum ada data.')));
  };
  async function move(i, d) {
    [items[i], items[i + d]] = [items[i + d], items[i]]; draw();
    try { await api('PUT', `/api/c/${col}/_order`, { ids: items.map((x) => x.id) }); toast('Urutan disimpan'); } catch (e) { toast(e.message, true); }
  }
  view().replaceChildren(h('h1', {}, def.label), h('p', { class: 'sub' }, def.sortable ? 'Urutan di sini sama dengan urutan tampil di situs.' : ''),
    h('div', { class: 'bar' }, h('input', { type: 'search', placeholder: 'Cari…', style: 'max-width:280px', oninput: (e) => { q = e.target.value.toLowerCase(); draw(); } }), h('span', { class: 'grow' }), h('a', { class: 'btn primary', href: `#/c/${col}/new` }, '+ Tambah')),
    h('div', { class: 'card' }, h('table', { class: 'list' }, h('thead', {}, h('tr', {}, h('th', {}), h('th', {}, 'Judul'), h('th', {}, col === 'posts' ? 'Status' : ''), h('th', {}, 'Diperbarui'), def.sortable ? h('th', {}, 'Urutan') : null)), tbody)));
  draw();
}

// ---------- halaman: edit item koleksi ----------
async function viewEdit(col, id) {
  const def = S.schema.collections[col];
  if (!def) return viewNotFound();
  const isNew = id === 'new';
  const data = isNew ? (col === 'posts' ? { status: 'draft', date: new Date().toLocaleDateString('sv-SE') } : {}) : clone(await api('GET', `/api/c/${col}/${encodeURIComponent(id)}`));
  const hasSlug = !def.autoId;
  let slug = isNew ? '' : id, slugTouched = !isNew;
  const errs = h('div');
  const slugInput = h('input', { type: 'text', value: slug, oninput: (e) => { slugTouched = true; slug = slugify(e.target.value); setDirty(true); }, onblur: (e) => (e.target.value = slug) });
  const changed = () => {
    setDirty(true);
    if (hasSlug && !slugTouched) { slug = slugify(data[def.titleField] || ''); slugInput.value = slug; }
  };
  const prefix = def.slugPrefix || '/';
  const slugField = hasSlug ? h('div', { class: 'field' }, h('label', {}, 'Alamat halaman'),
    h('div', { class: 'slug' }, h('span', {}, `kalmer.id${prefix}`), slugInput, h('span', { style: 'padding-right:12px' }, '/')),
    h('div', { class: 'hint' }, isNew ? 'Terisi otomatis dari judul. Gunakan huruf kecil dan tanda strip.' : 'Mengubah alamat akan otomatis membuat pengalihan dari alamat lama agar link dari Google tidak putus.')) : null;

  const publicUrl = hasSlug && !isNew && def.slugPrefix ? `${def.slugPrefix}${id}/` : null;
  const del = !isNew ? h('button', {
    class: 'btn danger', type: 'button', async onclick() {
      if (!confirm(`Hapus "${data[def.titleField] || id}"? Halaman ini akan hilang dari situs setelah dipublikasikan.`)) return;
      try { await api('DELETE', `/api/c/${col}/${encodeURIComponent(id)}`); setDirty(false); S.options = {}; toast('Dihapus'); location.hash = `#/c/${col}`; } catch (e) { toast(e.message, true); }
    },
  }, 'Hapus') : null;

  view().replaceChildren(
    h('a', { href: `#/c/${col}`, class: 'small' }, `← ${def.label}`),
    h('div', { class: 'bar', style: 'margin-top:8px' }, h('h1', { class: 'grow', style: 'margin:0' }, isNew ? `Tambah ${def.label.toLowerCase()}` : (data[def.titleField] || id)),
      publicUrl ? h('a', { class: 'btn', href: publicUrl, target: '_blank', rel: 'noopener' }, 'Lihat di situs ↗') : null),
    errs,
    h('div', { class: 'form' }, h('div', { class: 'group' }, h('div', { class: 'body', style: 'border-top:0' }, slugField, def.fields.map((f) => fieldWidget(f, data, changed))))),
    saveBar(async () => {
      errs.replaceChildren();
      const body = { ...data, ...(hasSlug ? { _slug: slug } : {}) };
      try {
        const r = isNew ? await api('POST', `/api/c/${col}`, body) : await api('PUT', `/api/c/${col}/${encodeURIComponent(id)}`, body);
        setDirty(false); S.options = {};
        toast(col === 'posts' && data.status !== 'published' ? 'Tersimpan sebagai draf' : 'Tersimpan. Klik Publikasikan agar tampil di situs.');
        const newId = r.id || id;
        if (newId !== id) location.hash = `#/c/${col}/${encodeURIComponent(newId)}`;
      } catch (e) { errs.replaceChildren(errorBox(e.errors)); errs.scrollIntoView({ behavior: 'smooth' }); }
    }, [del]));
  if (isNew) setTimeout(() => $('.form input')?.focus(), 50);
}

// ---------- halaman: media ----------
async function viewMedia() {
  await loadMedia();
  let q = '', cat = 'any', kind = 'photo', noAlt = false;
  const grid = h('div', { class: 'mgrid' });
  const count = h('span', { class: 'muted small' });
  const draw = () => {
    const list = S.media.filter((m) => m.kind === kind && (cat === 'any' || m.cat === cat) && (!noAlt || !m.alt) && (!q || (m.slug + ' ' + m.alt + ' ' + (m.original_name || '')).toLowerCase().includes(q)));
    count.textContent = `${list.length} ${kind === 'logo' ? 'logo' : 'foto'}`;
    grid.replaceChildren(...list.map((m) => h('div', { class: 'm' + (m.kind === 'logo' ? ' logo' : '') + (m.alt ? '' : ' noalt'), tabIndex: 0, onclick: () => editMedia(m, draw), onkeydown: (e) => e.key === 'Enter' && editMedia(m, draw) },
      h('img', { src: thumbUrl(m.slug), alt: '', loading: 'lazy' }), h('div', { class: 'cap' }, m.alt || '⚠ Belum ada keterangan'))));
    if (!list.length) grid.replaceChildren(h('div', { class: 'empty' }, 'Tidak ada foto.'));
  };
  const kindSel = h('select', { style: 'max-width:160px', onchange: (e) => { kind = e.target.value; up.el.replaceWith((up = uploader(kind, async () => { await loadMedia(); draw(); })).el); draw(); } }, h('option', { value: 'photo' }, 'Foto'), h('option', { value: 'logo' }, 'Logo klien'));
  let up = uploader(kind, async () => { await loadMedia(); draw(); });
  view().replaceChildren(h('h1', {}, 'Foto & Media'), h('p', { class: 'sub' }, 'Upload foto di sini, lalu pilih di halaman mana pun. Isi keterangan foto agar ramah Google dan tunanetra. Kategori menentukan di mana foto tampil di galeri.'),
    up.el,
    h('div', { class: 'bar' }, kindSel, h('input', { type: 'search', placeholder: 'Cari…', style: 'max-width:240px', oninput: (e) => { q = e.target.value.toLowerCase(); draw(); } }),
      h('select', { style: 'max-width:220px', onchange: (e) => { cat = e.target.value; draw(); } }, [['any', 'Semua kategori'], ['', 'Tidak di galeri'], ['komersial', 'Komersial & F&B'], ['hunian', 'Hunian'], ['serah', 'Serah Terima'], ['desain', 'Desain 3D'], ['progres', 'Progres Lapangan'], ['struktur', 'Struktur Baja']].map(([v, l]) => h('option', { value: v }, l))),
      h('label', { class: 'toggle small' }, h('input', { type: 'checkbox', onchange: (e) => { noAlt = e.target.checked; draw(); } }), 'Belum ada keterangan'), h('span', { class: 'grow' }), count),
    grid);
  draw();
}
async function editMedia(m, redraw) {
  const alt = h('textarea', { value: m.alt, rows: 2 });
  alt.value = m.alt;
  let cat = m.cat;
  const full = m.kind === 'logo' ? `/api/file/${m.slug}.webp` : `/api/file/${m.slug}-${m.sizes.at(-1)}.webp`;
  const body = h('div', { class: 'form' },
    h('img', { class: 'preview-img', src: full, alt: '' }),
    h('div', { class: 'field' }, h('label', {}, 'Keterangan foto (alt text)'), alt, h('div', { class: 'hint' }, 'Jelaskan isi foto dalam satu kalimat, contoh: "Fasad Red Chicken Burger Setu setelah renovasi". Dipakai Google dan pembaca layar.')),
    m.kind === 'photo' ? h('div', { class: 'field' }, h('label', {}, 'Kategori galeri'), catSelect(cat, (v) => (cat = v))) : null,
    h('div', { class: 'small muted' }, `Nama file: ${m.slug} · ${m.w}×${m.h} px · diunggah ${fmtTime(m.created_at)}`));
  const r = await modal('Detail foto', body, [['Hapus foto', 'delete', 'danger'], ['Batal', null], ['Simpan', 'save', 'primary']]);
  if (r === 'save') {
    try { await api('PUT', `/api/media/${m.slug}`, { alt: alt.value, cat }); m.alt = alt.value.trim(); m.cat = cat; toast('Keterangan disimpan'); redraw(); } catch (e) { toast(e.message, true); }
  } else if (r === 'delete') {
    try {
      await api('DELETE', `/api/media/${m.slug}`);
    } catch (e) {
      if (e.status !== 409) return toast(e.message, true);
      const go = await modal('Foto masih dipakai', h('div', {}, h('p', {}, 'Foto ini masih dipakai di:'), h('ul', {}, e.data.used.map((u) => h('li', {}, u))), h('p', {}, 'Jika tetap dihapus, bagian tersebut akan tampil tanpa foto. Lebih aman ganti fotonya dulu di halaman terkait.')), [['Batal', null], ['Tetap hapus', 'yes', 'danger']]);
      if (go !== 'yes') return;
      try { await api('DELETE', `/api/media/${m.slug}?force=1`); } catch (x) { return toast(x.message, true); }
    }
    toast('Foto dihapus'); await loadMedia(); redraw();
  }
}

// ---------- halaman: pengguna ----------
const genPass = () => { const a = new Uint8Array(12); crypto.getRandomValues(a); return btoa(String.fromCharCode(...a)).replace(/[+/=]/g, '').slice(0, 14); };
async function viewUsers() {
  if (S.user.role !== 'admin') return viewNotFound();
  const list = await api('GET', '/api/users');
  const userForm = (u = {}) => {
    const f = { username: h('input', { type: 'text', value: u.username || '', disabled: !!u.id, autocomplete: 'off' }), name: h('input', { type: 'text', value: u.name || '' }), role: h('select', {}, h('option', { value: 'editor', selected: u.role !== 'admin' }, 'Editor: kelola konten & foto'), h('option', { value: 'admin', selected: u.role === 'admin' }, 'Admin: termasuk pengguna & pengalihan URL')), password: h('input', { type: 'text', autocomplete: 'off', placeholder: u.id ? 'Kosongkan jika tidak diganti' : '' }) };
    const el = h('div', { class: 'form' },
      h('div', { class: 'field' }, h('label', {}, 'Username'), f.username), h('div', { class: 'field' }, h('label', {}, 'Nama tampilan'), f.name), h('div', { class: 'field' }, h('label', {}, 'Peran'), f.role),
      h('div', { class: 'field' }, h('label', {}, u.id ? 'Password baru' : 'Password'), h('div', { style: 'display:flex;gap:8px' }, f.password, h('button', { type: 'button', class: 'btn', onclick: () => (f.password.value = genPass()) }, 'Buat otomatis')), h('div', { class: 'hint' }, 'Minimal 10 karakter. Berikan ke orangnya lewat jalur pribadi; minta diganti setelah login pertama.')));
    return { el, values: () => ({ username: f.username.value.trim(), name: f.name.value.trim(), role: f.role.value, password: f.password.value }) };
  };
  const open = async (u) => {
    const form = userForm(u);
    const r = await modal(u ? `Edit ${u.username}` : 'Tambah pengguna', form.el, [['Batal', null], ['Simpan', () => form.values(), 'primary']]);
    if (!r) return;
    try {
      if (u) { const body = { name: r.name, role: r.role }; if (r.password) body.password = r.password; await api('PUT', `/api/users/${u.id}`, body); }
      else await api('POST', '/api/users', r);
      toast('Pengguna disimpan'); viewUsers();
    } catch (e) { toast(e.message, true); }
  };
  view().replaceChildren(h('h1', {}, 'Pengguna'), h('p', { class: 'sub' }, 'Editor bisa mengelola semua konten dan foto. Admin juga bisa mengelola pengguna dan pengalihan URL.'),
    h('div', { class: 'bar' }, h('span', { class: 'grow' }), h('button', { class: 'btn primary', onclick: () => open() }, '+ Tambah pengguna')),
    h('div', { class: 'card' }, h('table', { class: 'list' }, h('thead', {}, h('tr', {}, h('th', {}, 'Nama'), h('th', {}, 'Username'), h('th', {}, 'Peran'), h('th', {}))),
      h('tbody', {}, list.map((u) => h('tr', {}, h('td', {}, h('b', {}, u.name)), h('td', {}, u.username), h('td', {}, h('span', { class: 'badge' + (u.role === 'admin' ? ' ok' : '') }, u.role === 'admin' ? 'Admin' : 'Editor')),
        h('td', { style: 'text-align:right;white-space:nowrap' }, h('button', { class: 'btn sm', onclick: () => open(u) }, 'Edit'), ' ',
          u.id !== S.user.id ? h('button', { class: 'btn sm danger', async onclick() { if (!confirm(`Hapus pengguna ${u.username}?`)) return; try { await api('DELETE', `/api/users/${u.id}`); toast('Dihapus'); viewUsers(); } catch (e) { toast(e.message, true); } } }, 'Hapus') : h('span', { class: 'small muted' }, '(Anda)'))))))));
}

// ---------- halaman: akun saya ----------
function viewAccount() {
  const cur = h('input', { type: 'password', autocomplete: 'current-password' }), nw = h('input', { type: 'password', autocomplete: 'new-password' }), nw2 = h('input', { type: 'password', autocomplete: 'new-password' });
  const errs = h('div');
  view().replaceChildren(h('h1', {}, 'Akun saya'), h('p', { class: 'sub' }, `${S.user.name} · ${S.user.username}`),
    h('div', { class: 'card pad', style: 'max-width:480px' }, h('h3', { style: 'margin-top:0' }, 'Ganti password'), errs,
      h('div', { class: 'form' }, h('div', { class: 'field' }, h('label', {}, 'Password sekarang'), cur), h('div', { class: 'field' }, h('label', {}, 'Password baru'), nw, h('div', { class: 'hint' }, 'Minimal 10 karakter. Gunakan kalimat yang mudah diingat tapi sulit ditebak.')), h('div', { class: 'field' }, h('label', {}, 'Ulangi password baru'), nw2),
        h('button', {
          class: 'btn primary', style: 'justify-self:start', async onclick() {
            errs.replaceChildren();
            if (nw.value !== nw2.value) return errs.replaceChildren(errorBox(['Password baru tidak sama']));
            try { await api('PUT', '/api/me/password', { current: cur.value, next: nw.value }); toast('Password diganti. Silakan login lagi.'); S.user = null; renderLogin(); } catch (e) { errs.replaceChildren(errorBox(e.errors)); }
          },
        }, 'Ganti password'))));
}

function viewNotFound() { view().replaceChildren(h('h1', {}, 'Halaman tidak ditemukan'), h('a', { href: '#/' }, '← Kembali ke dasbor')); }

// ---------- router ----------
let lastHash = location.hash;
async function route() {
  if (!S.user) return;
  const parts = (location.hash || '#/').slice(2).split('/').map(decodeURIComponent);
  setDirty(false);
  markNav();
  view().replaceChildren(h('div', { class: 'muted' }, 'Memuat…'));
  try {
    if (!parts[0]) await viewDashboard();
    else if (parts[0] === 's') await viewSingleton(parts[1]);
    else if (parts[0] === 'c' && parts[2]) await viewEdit(parts[1], parts[2]);
    else if (parts[0] === 'c') await viewList(parts[1]);
    else if (parts[0] === 'media') await viewMedia();
    else if (parts[0] === 'users') await viewUsers();
    else if (parts[0] === 'akun') viewAccount();
    else viewNotFound();
    window.scrollTo(0, 0);
  } catch (e) { if (e.status !== 401) view().replaceChildren(errorBox(e.errors || [e.message])); }
}
addEventListener('hashchange', () => {
  if (S.dirty && !confirm('Ada perubahan yang belum disimpan. Tinggalkan halaman ini?')) { history.replaceState(null, '', lastHash); return; }
  lastHash = location.hash; route();
});

async function boot() {
  try {
    const me = await api('GET', '/api/me');
    S.user = me.user; S.status = me.status;
  } catch { return renderLogin(); }
  S.schema = await api('GET', '/api/schema');
  await loadMedia();
  renderShell();
  lastHash = location.hash;
  route();
}
boot();
