// Studi kasus portofolio. Setiap entri menjadi halaman /portofolio/<slug>/.
// Hanya fakta yang sudah dipublikasikan Kalmer di situs lama yang dicantumkan;
// lengkapi `facts` (durasi, luas, dll.) jika datanya tersedia.

export const projects = [
  {
    slug: 'a-better-cup-tebet',
    name: 'A Better Cup Tebet',
    title: 'Renovasi Cafe A Better Cup Tebet',
    category: 'Cafe & F&B',
    chip: 'Luxury Commercial',
    status: 'Selesai',
    location: 'Tebet Timur, Jakarta Selatan',
    city: 'jakarta',
    services: ['kontraktor-cafe', 'kontraktor-komersial'],
    cover: 'abc-tebet-1',
    gallery: ['abc-tebet-1', 'abc-tebet-2', 'abc-tebet-3', 'abc-tebet-4', 'abc-tebet-5', 'abc-tebet-6', 'abc-tebet-7'],
    facts: [['Lingkup', 'Renovasi total, MEP, interior fit-out'], ['Kategori', 'Cafe & F&B'], ['Status', 'Selesai, terbuka untuk umum']],
    summary: 'Renovasi total kantor pusat A Better Cup di Tebet Timur: dari pekerjaan MEP hingga interior fit-out dengan dinding panel kayu melengkung dan pencahayaan tersembunyi.',
    body: `
<p>A Better Cup Tebet adalah kantor pusat sekaligus outlet utama brand kopi A Better Cup. Lingkup pekerjaan Kalmer mencakup renovasi total bangunan, instalasi MEP (mekanikal, elektrikal, dan plumbing), serta interior fit-out lengkap.</p>
<p>Karakter ruang dibangun lewat dinding panel kayu dengan lengkung organik, sofa built-in, dan pencahayaan tidak langsung yang tersembunyi di balik panel. Detail seperti ini menuntut presisi: lengkung panel harus menerus tanpa sambungan terlihat, dan jalur kabel lampu harus disiapkan sejak tahap rangka.</p>
<h2>Tantangan</h2>
<p>Untuk bisnis F&B, setiap hari keterlambatan berarti biaya sewa berjalan tanpa pemasukan. Instalasi listrik juga harus siap menanggung beban mesin espresso dan peralatan bar, dengan jalur air bersih dan air kotor yang rapi dan mudah dirawat.</p>
<h2>Hasil</h2>
<p>Outlet kini beroperasi dan terbuka untuk umum. Calon klien dipersilakan berkunjung langsung untuk melihat kualitas finishing kami.</p>`,
  },
  {
    slug: 'a-better-cup-untar',
    name: 'A Better Cup Universitas Tarumanagara',
    title: 'Fit-out A Better Cup Universitas Tarumanagara',
    category: 'Fasilitas Pendidikan',
    chip: 'Educational Facility',
    status: 'Selesai',
    location: 'Kampus Untar, Jakarta Barat',
    city: 'jakarta',
    services: ['kontraktor-cafe', 'kontraktor-komersial'],
    cover: 'abc-untar-1',
    gallery: ['abc-untar-1', 'abc-untar-2'],
    facts: [['Lingkup', 'Interior, furniture, lantai high-traffic'], ['Kategori', 'Fasilitas pendidikan & F&B'], ['Status', 'Selesai, terbuka untuk umum']],
    summary: 'Kios F&B dan area publik di kampus Universitas Tarumanagara dengan plafon kayu melengkung, lampu LED linear, dan lantai yang dirancang untuk lalu lintas tinggi.',
    body: `
<p>Proyek di lingkungan kampus Universitas Tarumanagara ini menghadirkan kios A Better Cup sekaligus area publik yang nyaman untuk mahasiswa. Lingkup kerja Kalmer meliputi interior, furniture, dan pekerjaan lantai untuk area dengan lalu lintas tinggi.</p>
<p>Elemen utamanya adalah plafon bilah kayu melengkung dengan lampu LED linear yang mengikuti bentuk konter. Bentuk melengkung seperti ini membutuhkan rangka plafon yang presisi agar garis lampu tetap mulus dari setiap sudut pandang.</p>
<h2>Tantangan</h2>
<p>Bekerja di lingkungan institusi berarti jadwal dan akses lokasi lebih ketat, serta material harus tahan dipakai ribuan orang setiap hari tanpa cepat terlihat kusam.</p>
<h2>Hasil</h2>
<p>Area ini sudah beroperasi dan dapat dikunjungi publik di kampus Untar, Jakarta Barat.</p>`,
  },
  {
    slug: 'red-chicken-burger-setu',
    name: 'Red Chicken Burger Setu',
    title: 'Renovasi Ruko Menjadi Outlet Red Chicken Burger',
    category: 'Cafe & F&B',
    chip: 'Commercial Revamp',
    status: 'Selesai',
    location: 'Setu, Bekasi',
    city: 'bekasi',
    services: ['kontraktor-cafe', 'kontraktor-komersial'],
    cover: 'rcb-setu-after',
    before: 'rcb-setu-before',
    after: 'rcb-setu-after',
    video: 'wooZCkQZPds',
    facts: [['Lingkup', 'Fasad, interior, MEP dapur'], ['Kategori', 'Outlet F&B'], ['Status', 'Selesai, terbuka untuk umum']],
    summary: 'Transformasi total ruko di Setu, Bekasi menjadi outlet F&B modern: fasad baru, interior, dan instalasi MEP dapur komersial.',
    body: `
<p>Ruko eksisting di Setu, Bekasi diubah total menjadi outlet Red Chicken Burger. Kalmer mengerjakan fasad baru, interior, dan instalasi MEP dapur yang sesuai kebutuhan operasional F&B.</p>
<p>Fasad adalah “papan nama” terbesar sebuah outlet. Desain baru membuat outlet lebih menonjol dari jalan, sementara bagian dalam ditata ulang agar alur kerja dapur dan antrean pelanggan tidak saling bertabrakan.</p>
<h2>Tantangan</h2>
<p>Dapur komersial membutuhkan jalur gas, exhaust, listrik daya tinggi, dan saluran pembuangan yang aman. Semua harus dipasang rapi tanpa mengganggu estetika area depan.</p>
<h2>Hasil</h2>
<p>Geser slider di atas untuk melihat perbandingan sebelum dan sesudah renovasi, dan tonton video dokumentasi hasil akhirnya.</p>`,
  },
  {
    slug: 'butik-batik-tulis-lavi',
    name: 'Butik Batik Tulis Lavi',
    title: 'Pembangunan Butik Batik Tulis Lavi Kebayoran Lama',
    category: 'Retail & Komersial',
    chip: 'Premium Commercial',
    status: 'Sedang berjalan',
    location: 'Kebayoran Lama Raya, Jakarta Selatan',
    city: 'jakarta',
    services: ['kontraktor-komersial'],
    cover: 'lavi-render-fasad',
    gallery: ['lavi-render-fasad', 'lavi-render-2', 'lavi-render-3', 'lavi-render-4', 'lavi-render-5', 'lavi-render-layout'],
    progress: ['lavi-progres-struktur', 'lavi-progres-fasad', 'lavi-progres-interior-1', 'lavi-progres-interior-2', 'lavi-progres-bekisting', 'lavi-progres-pembesian'],
    facts: [['Valuasi proyek', '± Rp1,3 miliar'], ['Lingkup', 'Struktur, arsitektur, interior & MEP'], ['Konsep', 'Etnik modern'], ['Status', 'Sedang berjalan']],
    summary: 'Butik dengan konsep etnik modern yang memadukan elemen batik tradisional dan arsitektur kontemporer. Lingkup penuh dari struktur hingga interior dan MEP.',
    body: `
<p>Butik Batik Tulis Lavi di Kebayoran Lama Raya adalah proyek komersial premium dengan nilai sekitar Rp1,3 miliar. Kalmer menangani lingkup penuh: struktur, arsitektur, interior, dan MEP.</p>
<p>Konsepnya etnik modern, yaitu memadukan elemen batik tradisional dengan arsitektur kontemporer. Konsep ini menuntut presisi tinggi pada detail finishing dan pemilihan material premium agar karakter etnik tetap terasa tanpa kesan berlebihan.</p>
<h2>Dari desain 3D ke lapangan</h2>
<p>Seluruh ruang divisualisasikan dalam 3D sebelum konstruksi dimulai, mulai dari fasad, area lounge dengan void dua lantai, lorong display, pantry, hingga ruang kerja. Visualisasi ini menjadi acuan bersama antara pemilik, desainer, dan tim lapangan.</p>
<p>Foto progres di bawah menunjukkan tahapan pekerjaan struktur: pembesian, bekisting, hingga struktur utama yang mulai berdiri.</p>`,
  },
  {
    slug: 'a-better-cup-depok',
    name: 'A Better Cup Depok',
    title: 'Konstruksi Outlet A Better Cup Cabang Depok',
    category: 'Cafe & F&B',
    chip: 'In Development',
    status: 'Tahap konstruksi',
    location: 'Depok, Jawa Barat',
    city: 'depok',
    services: ['kontraktor-cafe'],
    cover: 'abc-depok-render',
    before: 'abc-depok-site',
    after: 'abc-depok-render',
    beforeLabel: 'Lokasi saat ini',
    afterLabel: 'Desain 3D',
    facts: [['Lingkup', 'Fit-out outlet F&B'], ['Desain', 'Modern minimalis sesuai permintaan owner'], ['Status', 'Tahap konstruksi']],
    summary: 'Cabang baru A Better Cup di Depok, repeat order dari klien yang sama. Desain modern minimalis divisualisasikan dalam 3D sebelum konstruksi dimulai.',
    body: `
<p>A Better Cup Depok adalah proyek ketiga Kalmer bersama A Better Cup setelah Tebet dan Universitas Tarumanagara. Klien yang kembali memesan adalah ukuran kepuasan yang paling jujur.</p>
<p>Desainnya modern minimalis sesuai permintaan owner, dan sudah divisualisasikan dalam 3D sebelum pekerjaan dimulai. Geser slider di atas untuk membandingkan kondisi lokasi saat ini dengan desain akhir yang akan dibangun.</p>`,
  },
  {
    slug: 'a-better-cup-surabaya',
    name: 'A Better Cup Tunjungan Surabaya',
    title: 'Desain A Better Cup Tunjungan Surabaya',
    category: 'Cafe & F&B',
    chip: 'Design Phase',
    status: 'Tahap desain',
    location: 'Tunjungan, Surabaya',
    city: null,
    services: ['kontraktor-cafe'],
    cover: 'abc-surabaya-render',
    gallery: ['abc-surabaya-render'],
    facts: [['Lingkup', 'Desain & visualisasi 3D'], ['Status', 'Tahap desain']],
    summary: 'Tahap desain dan visualisasi 3D cabang A Better Cup di kawasan Tunjungan, Surabaya, kelanjutan kerja sama dengan brand yang sama setelah Tebet, Untar, dan Depok.',
    body: `
<p>Proyek A Better Cup di kawasan Tunjungan, Surabaya saat ini berada pada tahap desain dan visualisasi 3D. Ini menunjukkan kepercayaan berkelanjutan dari brand yang sudah bekerja sama dengan Kalmer di beberapa cabang.</p>`,
  },
];
