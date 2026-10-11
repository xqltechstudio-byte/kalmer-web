// Definisi semua konten yang bisa diedit di panel admin.
// Panel admin membangun form otomatis dari sini; server memakai ini untuk validasi.
//
// Tipe field:
//   text, textarea, richtext (editor artikel), number, date, boolean,
//   select (options), tags (daftar teks), image (1 foto), images (banyak foto),
//   ref / refs (pilih dari koleksi lain), list (daftar berulang dengan sub-field)
// `em: true` → teks mendukung *miring berwarna* dan **tebal**.

const EM_HINT = 'Tulis *kata* untuk miring berwarna, **kata** untuk tebal.';
const t = (key, label, o = {}) => ({ key, label, type: 'text', ...o });
const em = (key, label, o = {}) => ({ key, label, type: 'text', em: true, hint: EM_HINT, ...o });
const area = (key, label, o = {}) => ({ key, label, type: 'textarea', ...o });
const list = (key, label, fields, o = {}) => ({ key, label, type: 'list', fields, ...o });
const titleText = [t('title', 'Judul'), area('text', 'Keterangan')];
const faqFields = [t('q', 'Pertanyaan'), area('a', 'Jawaban')];
const seo = (prefix = '') => [
  t(prefix + 'metaTitle', 'Judul di Google', { max: 60, hint: 'Maks. ±60 karakter. Muncul sebagai judul biru di hasil Google dan di tab browser.' }),
  area(prefix + 'metaDesc', 'Deskripsi di Google', { max: 160, hint: 'Idealnya 120–160 karakter. Muncul di bawah judul pada hasil Google.' }),
];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((d, i) => ({ value: d, label: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'][i] }));
export const PHOTO_CATS = [
  { value: '', label: '— Tidak tampil di galeri —' },
  { value: 'komersial', label: 'Komersial & F&B' }, { value: 'hunian', label: 'Hunian' }, { value: 'serah', label: 'Serah Terima' },
  { value: 'desain', label: 'Desain 3D' }, { value: 'progres', label: 'Progres Lapangan' }, { value: 'struktur', label: 'Struktur Baja' },
];

export const singletons = {
  site: {
    label: 'Pengaturan Situs', icon: 'settings', adminOnly: false,
    groups: [
      ['Identitas', [t('name', 'Nama singkat'), t('legalName', 'Nama perusahaan'), area('description', 'Deskripsi bisnis', { hint: 'Dipakai untuk data bisnis di Google.' }), area('footerText', 'Teks di footer'), t('topbarText', 'Teks bar atas', { hint: 'Contoh: Melayani Jabodetabek' })]],
      ['Kontak', [
        t('phone', 'Nomor WhatsApp (format internasional)', { hint: 'Contoh: +6281250505181. Dipakai untuk semua tombol WhatsApp.', pattern: '^\\+?[0-9]{8,15}$' }),
        t('phoneDisplay', 'Nomor yang ditampilkan', { hint: 'Contoh: 0812-5050-5181' }),
        t('email', 'Email'),
        area('waMessage', 'Pesan WhatsApp otomatis', { hint: 'Teks awal saat pengunjung menekan tombol WhatsApp.' }),
      ]],
      ['Alamat', [t('addrStreet', 'Jalan'), t('addrLocality', 'Kecamatan'), t('addrRegion', 'Provinsi'), t('addrPostal', 'Kode pos'), t('addrShort', 'Alamat singkat (ditampilkan)')]],
      ['Jam operasional', [list('hours', 'Jam buka', [t('label', 'Teks yang ditampilkan', { hint: 'Contoh: Senin–Jumat 09.00–16.30' }), { key: 'days', label: 'Hari', type: 'multiselect', options: DAYS }, t('opens', 'Buka (HH:MM)'), t('closes', 'Tutup (HH:MM)')], { itemTitle: 'label' })]],
      ['Pendiri & area', [t('founderName', 'Nama pendiri'), t('founderRole', 'Jabatan'), { key: 'areaServed', label: 'Kota yang dilayani', type: 'tags' }]],
      ['Media sosial', [list('social', 'Akun', [t('name', 'Platform'), t('handle', 'Nama akun'), t('url', 'Link')], { itemTitle: 'name' })]],
      ['SEO & pelacakan', [
        { key: 'ogDefault', label: 'Gambar preview default', type: 'image', hint: 'Dipakai saat link dibagikan di WhatsApp/Facebook jika halaman tidak punya foto sendiri.' },
        t('url', 'Alamat situs', { hint: 'Contoh: https://kalmer.id (tanpa garis miring di akhir)', adminOnly: true }),
        t('metaPixelId', 'Meta Pixel ID', { hint: 'Hanya angka. Kosongkan jika tidak dipakai.' }),
        t('ga4Id', 'Google Analytics 4 ID', { hint: 'Format G-XXXXXXX. Kosongkan jika tidak dipakai.' }),
        t('googleSiteVerification', 'Kode verifikasi Google Search Console'),
      ]],
    ],
  },
  home: {
    label: 'Beranda', icon: 'home',
    groups: [
      ['SEO', seo()],
      ['Hero (layar pertama)', [
        t('heroTagStrong', 'Label kecil (tebal)'), t('heroTagRest', 'Label kecil (lanjutan)', { hint: 'Label kecil ini adalah H1 halaman, sertakan kata kunci seperti "Kontraktor".' }),
        em('heroTitle', 'Judul besar'), em('heroSub', 'Paragraf'), t('heroCta1', 'Tombol utama'), t('heroCta2', 'Tombol kedua'),
        list('slides', 'Foto slider', [{ key: 'image', label: 'Foto', type: 'image' }, { key: 'project', label: 'Tautkan ke studi kasus', type: 'ref', collection: 'projects' }], { itemTitle: 'project', hint: 'Foto pertama dimuat paling cepat, pilih yang terbaik.' }),
        list('stats', 'Angka statistik', [t('n', 'Angka'), t('suffix', 'Akhiran', { hint: 'Contoh: + atau % atau bln' }), t('label', 'Keterangan')], { itemTitle: 'label' }),
      ]],
      ['Logo klien', [t('clientsTitle', 'Judul'), t('clientsSub', 'Sub-judul')]],
      ['Layanan', [em('layananTitle', 'Judul'), em('layananLead', 'Paragraf')]],
      ['Pendiri', [{ key: 'founderPhoto', label: 'Foto', type: 'image' }, t('founderBadge', 'Label jabatan'), em('founderTitle', 'Judul'), em('founderQuote', 'Kutipan'), em('founderBody', 'Paragraf'), em('founderPull', 'Kutipan sorotan')]],
      ['Masalah vs solusi', [em('masalahTitle', 'Judul'), em('masalahLead', 'Paragraf'), t('masalahLinkText', 'Teks tautan (opsional)'), t('masalahLink', 'Alamat tautan', { hint: 'Contoh: /blog/kontraktor-vs-pemborong/' }), list('risks', 'Risiko', titleText, { itemTitle: 'title' }), t('compareBad', 'Kolom kiri'), t('compareGood', 'Kolom kanan'), list('compare', 'Baris perbandingan', [t('badTitle', 'Kiri: judul'), area('badText', 'Kiri: keterangan'), t('goodTitle', 'Kanan: judul'), area('goodText', 'Kanan: keterangan')], { itemTitle: 'goodTitle' })]],
      ['Keunggulan', [em('keunggulanTitle', 'Judul'), em('keunggulanLead', 'Paragraf'), { key: 'keunggulanImage', label: 'Foto', type: 'image' }, t('expNumber', 'Angka besar', { hint: 'Contoh: 8+' }), t('expText', 'Keterangan angka'), list('keunggulan', 'Poin keunggulan', titleText, { itemTitle: 'title' })]],
      ['Alur kerja (dipakai di semua halaman)', [em('prosesTitle', 'Judul'), em('prosesLead', 'Paragraf'), list('steps', 'Tahapan', titleText, { itemTitle: 'title' })]],
      ['Portofolio', [em('portfolioTitle', 'Judul'), { key: 'portfolioTabs', label: 'Proyek yang ditampilkan', type: 'refs', collection: 'projects' }]],
      ['Testimoni', [em('testimoniTitle', 'Judul'), em('testimoniLead', 'Paragraf'), list('testimonials', 'Video testimoni', [t('yt', 'Link atau ID YouTube', { youtube: true }), t('title', 'Judul'), t('text', 'Keterangan'), { key: 'project', label: 'Tautkan ke studi kasus', type: 'ref', collection: 'projects' }], { itemTitle: 'title' }), em('shortsTitle', 'Judul video pendek'), { key: 'shorts', label: 'Video pendek (link atau ID YouTube)', type: 'tags', youtube: true }]],
      ['Galeri', [em('galeriTitle', 'Judul'), { key: 'galeriCats', label: 'Kategori yang ditampilkan', type: 'multiselect', options: PHOTO_CATS.slice(1) }, { key: 'galeriPerCat', label: 'Jumlah foto per kategori', type: 'number', min: 1, max: 12 }]],
      ['Proyek berjalan (dipakai di beberapa halaman)', [em('berjalanTitle', 'Judul'), em('berjalanLead', 'Paragraf'), list('ongoing', 'Daftar proyek', [t('name', 'Lokasi / nama'), t('scope', 'Lingkup'), { key: 'type', label: 'Kategori', type: 'select', options: ['Residential', 'Commercial', 'Luxury', 'Investment'].map((v) => ({ value: v, label: v })) }, { key: 'city', label: 'Kota', type: 'ref', collection: 'locations' }, { key: 'project', label: 'Studi kasus (opsional)', type: 'ref', collection: 'projects' }], { itemTitle: 'name' })]],
      ['Blog', [em('blogTitle', 'Judul')]],
      ['Ajakan konsultasi (dipakai di semua halaman)', [em('ctaTitle', 'Judul'), em('ctaNote', 'Paragraf'), t('ctaBoxTitle', 'Judul kotak'), area('ctaBoxText', 'Teks kotak'), { key: 'ctaImage', label: 'Foto latar', type: 'image' }]],
      ['FAQ', [em('faqTitle', 'Judul'), em('faqLead', 'Paragraf'), list('faqs', 'Pertanyaan', faqFields, { itemTitle: 'q' })]],
    ],
  },
  pages: {
    label: 'Halaman Daftar', icon: 'pages',
    // field: <k>MetaTitle, <k>MetaDesc, <k>Title, <k>Lead, <k>Cover
    groups: [['layanan', 'Layanan'], ['area', 'Area Layanan'], ['porto', 'Portofolio'], ['galeri', 'Galeri'], ['blog', 'Blog']].map(([k, label]) => [label, [
      t(k + 'MetaTitle', 'Judul di Google', { max: 60 }),
      area(k + 'MetaDesc', 'Deskripsi di Google', { max: 160, hint: k === 'galeri' ? 'Diawali otomatis dengan jumlah foto, contoh: "44 foto proyek…".' : undefined }),
      em(k + 'Title', 'Judul halaman'), em(k + 'Lead', 'Paragraf', { hint: k === 'galeri' ? 'Diawali otomatis dengan jumlah foto.' : EM_HINT }),
      { key: k + 'Cover', label: 'Foto latar', type: 'image' },
    ]]).concat([['Halaman link (bio Instagram)', [area('hubText', 'Teks pembuka')]]]),
  },
};

export const collections = {
  services: {
    label: 'Layanan', icon: 'services', slugPrefix: '/layanan/', titleField: 'name', sortable: true,
    fields: [
      t('name', 'Nama layanan', { required: true }), t('short', 'Nama pendek', { hint: 'Dipakai di kalimat, contoh: "konsultasi renovasi rumah".' }),
      ...seo(), em('h1', 'Judul halaman'), area('lead', 'Paragraf pembuka'), { key: 'cover', label: 'Foto sampul', type: 'image' },
      { key: 'icon', label: 'Ikon', type: 'select', options: [{ value: 'home', label: 'Rumah' }, { value: 'tool', label: 'Perkakas' }, { value: 'cup', label: 'Cangkir' }, { value: 'building', label: 'Gedung' }] },
      { key: 'intro', label: 'Isi halaman', type: 'richtext' },
      em('problemsTitle', 'Judul bagian masalah (opsional)'), list('problems', 'Masalah yang sering terjadi (opsional)', titleText, { itemTitle: 'title' }),
      list('includes', 'Lingkup pekerjaan', titleText, { itemTitle: 'title' }), list('docs', 'Dokumen (opsional)', titleText, { itemTitle: 'title' }),
      list('faqs', 'FAQ', faqFields, { itemTitle: 'q' }), { key: 'posts', label: 'Artikel terkait', type: 'refs', collection: 'posts' },
    ],
  },
  locations: {
    label: 'Area', icon: 'map', slugPrefix: '/kontraktor-', titleField: 'name', sortable: true,
    fields: [t('name', 'Nama kota', { required: true }), ...seo(), em('h1', 'Judul halaman'), area('lead', 'Paragraf pembuka'), { key: 'cover', label: 'Foto sampul', type: 'image' }, { key: 'body', label: 'Isi halaman', type: 'richtext', hint: 'Tulis isi yang unik untuk kota ini, sebutkan proyek nyata di sana.' }, { key: 'areas', label: 'Kawasan yang dilayani', type: 'tags' }, { key: 'photos', label: 'Foto dokumentasi (opsional)', type: 'images' }],
  },
  projects: {
    label: 'Portofolio', icon: 'projects', slugPrefix: '/portofolio/', titleField: 'name', sortable: true,
    fields: [
      t('name', 'Nama proyek', { required: true }), t('title', 'Judul halaman', { hint: 'Judul di Google, contoh: "Renovasi Cafe A Better Cup Tebet".' }),
      t('tabLabel', 'Label pendek di beranda', { hint: 'Contoh: ABC Tebet' }),
      t('category', 'Kategori'), t('chip', 'Label kecil'),
      { key: 'status', label: 'Status', type: 'select', options: ['Selesai', 'Sedang berjalan', 'Tahap konstruksi', 'Tahap desain'].map((v) => ({ value: v, label: v })) },
      t('location', 'Lokasi'), { key: 'city', label: 'Kota (halaman area)', type: 'ref', collection: 'locations' }, { key: 'services', label: 'Layanan terkait', type: 'refs', collection: 'services' },
      area('summary', 'Ringkasan', { hint: 'Juga dipakai sebagai deskripsi di Google (±150 karakter).' }),
      { key: 'cover', label: 'Foto sampul', type: 'image' }, { key: 'gallery', label: 'Foto galeri', type: 'images' }, { key: 'progress', label: 'Foto progres lapangan', type: 'images' },
      { key: 'before', label: 'Foto sebelum (opsional)', type: 'image' }, { key: 'after', label: 'Foto sesudah (opsional)', type: 'image' },
      t('beforeLabel', 'Label foto sebelum', { hint: 'Kosongkan untuk "Sebelum"' }), t('afterLabel', 'Label foto sesudah', { hint: 'Kosongkan untuk "Sesudah"' }),
      t('video', 'Video YouTube (opsional)', { youtube: true }), list('facts', 'Data proyek', [t('k', 'Label'), t('v', 'Isi')], { itemTitle: 'k' }),
      { key: 'body', label: 'Cerita proyek', type: 'richtext' },
    ],
  },
  posts: {
    label: 'Blog', icon: 'blog', slugPrefix: '/blog/', titleField: 'title', sortable: false, orderBy: 'date',
    fields: [
      t('title', 'Judul artikel', { required: true }),
      { key: 'status', label: 'Status', type: 'select', options: [{ value: 'draft', label: 'Draf (belum tampil)' }, { value: 'published', label: 'Terbit' }] },
      { key: 'date', label: 'Tanggal terbit', type: 'date', hint: 'Artikel dengan tanggal di masa depan baru tampil setelah tanggal itu dan setelah dipublikasikan ulang.' },
      { key: 'updated', label: 'Tanggal diperbarui (opsional)', type: 'date' }, t('author', 'Penulis', { hint: 'Kosongkan untuk "Tim Kalmer"' }),
      t('metaTitle', 'Judul di Google', { max: 60 }), area('description', 'Deskripsi', { max: 160 }),
      { key: 'cover', label: 'Foto sampul', type: 'image' }, { key: 'service', label: 'Layanan terkait', type: 'ref', collection: 'services' },
      { key: 'body', label: 'Isi artikel', type: 'richtext' },
    ],
  },
  clients: {
    label: 'Logo Klien', icon: 'clients', titleField: 'name', sortable: true, autoId: true,
    fields: [t('name', 'Nama klien', { required: true }), { key: 'logo', label: 'Logo', type: 'image', kind: 'logo' }, { key: 'big', label: 'Tampilkan lebih besar', type: 'boolean' }],
  },
  redirects: {
    label: 'Pengalihan URL', icon: 'redirect', titleField: 'from', sortable: false, autoId: true, adminOnly: true,
    fields: [t('from', 'Dari alamat', { required: true, hint: 'Contoh: /cafe/' }), t('to', 'Ke alamat', { required: true, hint: 'Contoh: /layanan/kontraktor-cafe/' })],
  },
};

// Koleksi dengan alamat halaman (slug = bagian URL)
export const hasSlug = (col) => !collections[col]?.autoId;
