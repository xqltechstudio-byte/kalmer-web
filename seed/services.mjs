// Halaman layanan: /layanan/<slug>/
// Setiap halaman menargetkan satu kelompok kata kunci utama (lihat `keyword`).

export const services = [
  {
    slug: 'bangun-rumah',
    name: 'Jasa Bangun Rumah',
    short: 'Bangun Rumah Baru',
    keyword: 'jasa bangun rumah Jabodetabek',
    metaTitle: 'Jasa Bangun Rumah Mewah Jabodetabek, RAB Transparan | Kalmer',
    metaDesc: 'Kontraktor bangun rumah baru di Jabodetabek. Desain 3D, RAB detail per item, diawasi site engineer, pembayaran termin sesuai progres, dan garansi struktur.',
    h1: 'Jasa bangun rumah dengan <em>presisi dan transparansi.</em>',
    lead: 'Membangun rumah adalah keputusan investasi besar. Kami memastikan spesifikasi di kontrak adalah apa yang terpasang di lapangan, dari pondasi hingga serah terima kunci.',
    cover: 'galeri-1',
    icon: 'home',
    intro: `
<p>Kalmer membangun rumah tinggal baru untuk pemilik yang tidak mencari “yang termurah”, tetapi kepastian: harga yang jelas sejak awal, material sesuai kontrak, dan jadwal yang bisa dipegang.</p>
<p>Anda bisa datang dengan desain dari arsitek sendiri, atau merancang bersama tim kami mulai dari konsep hingga visualisasi 3D. Setiap proyek diawasi site engineer, bukan sekadar mandor, dan Anda mendapat laporan progres mingguan tanpa harus datang ke lokasi setiap hari.</p>`,
    includes: [
      ['Desain & visualisasi 3D', 'Lihat hasil akhir rumah Anda sebelum batu pertama diletakkan.'],
      ['RAB detail per item', 'Volume, harga satuan, dan merek material tertulis jelas di kontrak.'],
      ['Struktur beton bertulang', 'Pondasi, kolom, balok, dan pelat dikerjakan sesuai gambar kerja dan diawasi engineer.'],
      ['Instalasi MEP', 'Listrik, air bersih, air kotor, dan drainase yang rapi dan tersembunyi.'],
      ['Finishing premium', 'Marmer, granit, kusen, plafon, hingga custom furniture.'],
      ['Serah terima & garansi', 'As-built drawing, masa retensi 3 bulan, dan garansi struktur sesuai kontrak.'],
    ],
    faqs: [
      { q: 'Berapa lama membangun rumah 2 lantai?', a: 'Sebagai gambaran, rumah 2 lantai tipe 150–200 m² biasanya membutuhkan 6–8 bulan. Jadwal pasti dituangkan dalam Kurva S yang mengikat di kontrak.' },
      { q: 'Apakah harga dihitung per meter persegi?', a: 'Tidak. Kami menghitung biaya dari RAB detail berdasarkan gambar kerja dan spesifikasi material yang Anda pilih, sehingga tidak ada biaya siluman di tengah jalan.' },
      { q: 'Bisakah saya memakai desain arsitek sendiri?', a: 'Bisa. Tim kami menerjemahkan gambar DED menjadi konstruksi dan dapat melakukan value engineering bila perlu menyesuaikan budget.' },
    ],
    posts: ['biaya-bangun-rumah-rab-vs-harga-per-meter', 'berapa-lama-bangun-rumah-2-lantai', 'bangun-rumah-dengan-desain-arsitek-sendiri'],
  },
  {
    slug: 'renovasi-rumah',
    name: 'Renovasi Rumah Total',
    short: 'Renovasi Rumah',
    keyword: 'kontraktor renovasi rumah Jabodetabek',
    metaTitle: 'Kontraktor Renovasi Rumah Total & Mewah Jabodetabek | Kalmer',
    metaDesc: 'Renovasi rumah total dan high-end di Jabodetabek: struktur, MEP, hingga interior. Diawasi site engineer, laporan progres mingguan, pembayaran sesuai progres.',
    h1: 'Renovasi rumah total, <em>tanpa drama di tengah jalan.</em>',
    lead: 'Dari perubahan layout dan penambahan lantai hingga renovasi interior menyeluruh. Kami menangani rumah yang sedang dihuni maupun kosong dengan pengawasan teknis setiap hari.',
    cover: 'galeri-12',
    icon: 'tool',
    intro: `
<p>Renovasi sering lebih rumit dari bangun baru. Kondisi struktur lama, instalasi yang tidak terdokumentasi, dan rumah yang mungkin masih dihuni menuntut perencanaan yang matang sebelum palu pertama diayunkan.</p>
<p>Saat ini Kalmer sedang mengerjakan renovasi rumah di Summarecon Morizen, Kota Wisata, Taman Meruya Ilir, Taman Parahyangan Lippo Village, Taman Royale Poris, dan Bekasi Jaya Indah. Kami fokus pada <strong>renovasi total dan menyeluruh</strong>, bukan perbaikan skala kecil seperti ganti keramik satu ruangan atau perbaikan bocor ringan.</p>`,
    includes: [
      ['Survey & denah eksisting', 'Pengukuran detail kondisi rumah sebagai dasar perencanaan yang akurat.'],
      ['Perubahan layout & tambah lantai', 'Analisa struktur sebelum dinding dibongkar atau lantai ditambah.'],
      ['Peremajaan MEP', 'Mengganti instalasi listrik dan pipa lama yang sudah tidak layak.'],
      ['Interior & finishing', 'Plafon, lantai, dinding, kitchen set, dan custom furniture.'],
      ['Fasad', 'Tampak depan baru yang meningkatkan nilai properti.'],
      ['Laporan progres mingguan', 'Foto dan video via WhatsApp Group dari project manager.'],
    ],
    faqs: [
      { q: 'Apakah Kalmer menerima renovasi kecil?', a: 'Saat ini kami tidak menerima renovasi skala mikro seperti ganti keramik, cat ulang satu ruangan, atau perbaikan bocor ringan. Kami fokus pada renovasi total dan menyeluruh.' },
      { q: 'Bisakah renovasi saat rumah masih dihuni?', a: 'Bisa, dengan pembagian zona kerja dan jadwal yang disepakati di awal. Hal ini dibahas saat survey agar keamanan dan kenyamanan penghuni tetap terjaga.' },
      { q: 'Berapa biaya survey renovasi?', a: 'Konsultasi awal gratis. Survey dan pengukuran mulai Rp1.000.000 tergantung lokasi dan luas, dan Anda mendapat denah eksisting yang akurat.' },
    ],
    posts: ['memantau-proyek-konstruksi-saat-sibuk', 'sistem-pembayaran-termin-kontraktor', 'garansi-dan-masa-retensi-bangunan'],
  },
  {
    slug: 'kontraktor-cafe',
    name: 'Kontraktor Cafe & F&B',
    short: 'Cafe & F&B',
    keyword: 'kontraktor cafe Jakarta',
    metaTitle: 'Kontraktor Cafe & Restoran Jabodetabek, Tepat Waktu | Kalmer',
    metaDesc: 'Spesialis bangun dan renovasi cafe, coffee shop, dan resto di Jabodetabek. Dipercaya A Better Cup dan Red Chicken Burger. Layout bar efektif, MEP dapur aman.',
    h1: 'Kontraktor cafe yang paham <em>bisnis F&B itu perang melawan waktu.</em>',
    lead: 'Sewa ruko jalan terus selama renovasi belum selesai. Kami memastikan outlet Anda buka sesuai jadwal, dengan layout bar yang efektif dan instalasi dapur yang aman.',
    cover: 'abc-untar-1',
    icon: 'cup',
    intro: `
<p>Kontraktor biasa membangun ruangan. Kontraktor F&B harus memahami operasional: di mana barista berdiri, ke mana air kotor mengalir, berapa daya listrik yang dibutuhkan mesin espresso, dan bagaimana antrean pelanggan tidak menghalangi pintu masuk.</p>
<p>Kalmer telah mengerjakan A Better Cup di Tebet, Universitas Tarumanagara, dan Depok, serta Red Chicken Burger di Setu, Bekasi. Klien yang kembali memesan untuk cabang berikutnya adalah bukti yang paling jujur.</p>`,
    problems: [
      ['Opening molor', 'Sewa ruko jalan terus, tapi renovasi tidak kunjung selesai. Cashflow minus sebelum mulai jualan.'],
      ['Workflow bar kacau', 'Barista bertabrakan karena layout sempit, pesanan lambat keluar, pelanggan komplain.'],
      ['Budget membengkak', '“Biaya siluman” terus muncul, sehingga ROI makin lama tercapai.'],
    ],
    includes: [
      ['Layout ramah barista', 'Alur kerja bar, dapur, dan antrean dirancang sejak awal.'],
      ['MEP untuk F&B', 'Instalasi mesin espresso, jalur air bersih/kotor, dan listrik daya tinggi yang aman dan rapi.'],
      ['Kurva S & kontrol jadwal', 'Progres dipantau terhadap jadwal opening yang disepakati.'],
      ['Fasad & identitas outlet', 'Tampak depan yang menonjol dan sesuai brand.'],
      ['Interior & furniture', 'Konter bar, seating, plafon dekoratif, dan pencahayaan.'],
      ['Material sesuai RAB', 'Tidak ada downgrade diam-diam.'],
    ],
    faqs: [
      { q: 'Bolehkah saya melihat langsung hasil proyek cafe Kalmer?', a: 'Tentu. A Better Cup Tebet, A Better Cup Universitas Tarumanagara, dan Red Chicken Burger Setu terbuka untuk umum, jadi Anda bisa berkunjung mandiri. Untuk proyek yang sedang berjalan, harap buat janji dengan tim kami terlebih dahulu.' },
      { q: 'Apakah Kalmer kontraktor paling murah?', a: 'Secara jujur, tidak. Kami menawarkan ketepatan waktu, spesifikasi material yang jujur, dan ketenangan pikiran yang sulit didapat dari kontraktor harga miring.' },
      { q: 'Kapan sebaiknya mulai konsultasi?', a: 'Sedini mungkin, idealnya sebelum menandatangani sewa tempat. Kami bisa membantu menilai kelayakan layout dan utilitas lokasi sebelum Anda berkomitmen.' },
    ],
    posts: ['kontraktor-vs-pemborong', 'sistem-pembayaran-termin-kontraktor', 'biaya-bangun-rumah-rab-vs-harga-per-meter'],
  },
  {
    slug: 'kontraktor-komersial',
    name: 'Kontraktor Ruko, Kantor & Komersial',
    short: 'Komersial & Kantor',
    keyword: 'kontraktor ruko dan kantor Jakarta',
    metaTitle: 'Kontraktor Ruko, Kantor & Komersial Jabodetabek | Kalmer',
    metaDesc: 'Bangun dan renovasi ruko, kantor, butik, dan ruang usaha di Jabodetabek. Dokumen lengkap untuk korporasi: RAB, Kurva S, BAST, invoice, dan faktur pajak.',
    h1: 'Konstruksi komersial dengan <em>standar korporasi.</em>',
    lead: 'Ruko, kantor, butik, kos-kosan, hingga kawasan komersial. Properti bisnis adalah aset produktif, jadi ketepatan waktu dan efisiensi capex adalah prioritas kami.',
    cover: 'lavi-render-fasad',
    icon: 'building',
    intro: `
<p>Untuk bisnis, keterlambatan handover berarti biaya sewa tanpa pemasukan, dan layout yang buruk berarti produktivitas tim yang hilang setiap hari. Kalmer membawa standar manajemen proyek yang kami terapkan untuk klien korporasi seperti Kapal Api Group ke setiap proyek komersial.</p>
<p>Proyek komersial kami mencakup Butik Batik Tulis Lavi di Kebayoran Lama (nilai sekitar Rp1,3 miliar), outlet F&B, area publik kampus, hingga hunian sewa seperti kos-kosan mahasiswa premium di Pondok China, Depok.</p>`,
    includes: [
      ['Ruko & retail', 'Rumah toko, butik fashion, dan ruang retail.'],
      ['Kantor & studio', 'Office fit-out, creative space, dan studio podcast.'],
      ['Hunian sewa', 'Kos-kosan dan mess karyawan yang efisien dan tahan lama.'],
      ['Fasad komersial', 'Renovasi tampak depan pertokoan dan kawasan komersial.'],
      ['MEP beban tinggi', 'Instalasi mekanikal, elektrikal, dan plumbing untuk beban kerja komersial.'],
      ['Commercial feasibility', 'Masukan teknis kelayakan layout untuk operasional bisnis.'],
    ],
    docs: [
      ['Dokumen teknik', 'Desain & DED, visualisasi 3D, RAB (Bill of Quantities), jadwal Kurva S, laporan progres berkala, dan BAST.'],
      ['Dokumen keuangan', 'Quotation resmi berkop perusahaan, invoice per termin, faktur pajak (PPN/PPh), kwitansi, dan faktur lunas.'],
      ['Legalitas', 'NIB, NPWP perusahaan, serta dokumen SBU, SIUJK, dan SKK bila diperlukan.'],
    ],
    faqs: [
      { q: 'Apakah Kalmer bisa menyediakan dokumen untuk kebutuhan audit perusahaan?', a: 'Bisa. Kami menyediakan dokumen teknis (RAB, Kurva S, laporan progres, BAST) dan dokumen keuangan (quotation, invoice, faktur pajak, kwitansi) yang rapi dan dapat diaudit.' },
      { q: 'Bagaimana legalitas Kalmer?', a: 'Kalmer memiliki dokumen SBU, SIUJK, dan SKK yang lengkap. Tim kami terdiri dari sarjana dan magister teknik sipil yang berpengalaman di proyek skala nasional.' },
      { q: 'Apakah bisa bekerja di luar jam operasional toko?', a: 'Jadwal kerja dapat disesuaikan dengan operasional bisnis dan aturan pengelola gedung. Hal ini dibahas saat survey dan dituangkan dalam jadwal proyek.' },
    ],
    posts: ['kontraktor-vs-pemborong', 'garansi-dan-masa-retensi-bangunan', 'sistem-pembayaran-termin-kontraktor'],
  },
];
