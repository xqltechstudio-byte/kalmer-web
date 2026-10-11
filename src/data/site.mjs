// Data bisnis inti. Nama, alamat, dan telepon (NAP) di sini harus SAMA PERSIS
// dengan Google Business Profile dan profil media sosial.

export const site = {
  url: 'https://kalmer.id',
  name: 'Kalmer',
  legalName: 'Kalmer Multi Teknik',
  tagline: 'Kontraktor Premium Residential & Commercial',
  description: 'Kontraktor bangun dan renovasi rumah mewah serta ruang komersial di Jabodetabek. RAB transparan, diawasi site engineer, bergaransi.',
  phone: '+6281250505181',
  phoneDisplay: '0812-5050-5181',
  email: 'admin@kalmer.id',
  address: {
    street: 'Jl. Salak 1 No.66 Blok A5, RT.001/RW.013, Teluk Pucung',
    locality: 'Bekasi Utara',
    city: 'Kota Bekasi',
    region: 'Jawa Barat',
    postal: '17121',
    country: 'ID',
    short: 'Jl. Salak 1 No.66 Blok A5, Bekasi Utara, Jawa Barat 17121',
  },
  hours: [
    { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '09:00', closes: '16:30', label: 'Senin–Jumat 09.00–16.30' },
    { days: ['Saturday'], opens: '09:00', closes: '12:00', label: 'Sabtu 09.00–12.00' },
  ],
  founder: { name: 'Rahadian Fatrah', role: 'Founder & CEO' },
  areaServed: ['Jakarta', 'Bogor', 'Depok', 'Tangerang', 'Bekasi'],
  social: [
    { name: 'Instagram', handle: '@kalmermultiteknik', url: 'https://www.instagram.com/kalmermultiteknik/' },
    { name: 'TikTok', handle: '@kalmer.id', url: 'https://tiktok.com/@kalmer.id' },
    { name: 'YouTube', handle: '@kalmerofficial', url: 'https://www.youtube.com/@kalmerofficial' },
    { name: 'Facebook', handle: 'Kalmer Multi Teknik', url: 'https://www.facebook.com/kalmer.multitek' },
    { name: 'Shopee', handle: 'Kalmer', url: 'https://shopee.co.id/kalmer' },
  ],
  // ID Meta Pixel dari situs lama. Kosongkan ('') jika tidak dipakai lagi.
  metaPixelId: '1888764848538921',
  // Isi setelah membuat properti GA4 / verifikasi Search Console (opsional).
  ga4Id: '',
  googleSiteVerification: '',
};

export const wa = (text = 'Halo Kalmer, saya ingin konsultasi mengenai rencana pembangunan properti saya.') =>
  `https://wa.me/${site.phone.replace('+', '')}?text=${encodeURIComponent(text)}`;

// Angka yang tampil di hero. Perbarui jika sudah berubah.
export const stats = [
  { n: '8', suffix: '+', label: 'Tahun pengalaman' },
  { n: '9', suffix: '', label: 'Proyek aktif' },
  { n: '100', suffix: '%', label: 'RAB transparan' },
  { n: '3', suffix: 'bln', label: 'Retensi + garansi' },
];

// Testimoni video (YouTube). `project` menautkan ke studi kasus jika ada.
export const testimonials = [
  { yt: 'W9-mN76cCCs', title: 'Owner Testimonial', text: 'Bekerja sama mewujudkan tempat usaha.' },
  { yt: 'F81Yq95_Rjg', title: 'Review Hasil Renovasi', text: 'Kualitas pengerjaan dan detail finishing.' },
  { yt: 'wooZCkQZPds', title: 'Red Chicken Burger', text: 'Ruko menjadi outlet F&B modern.', project: 'red-chicken-burger-setu' },
  { yt: 'awPnIb0Y6NQ', title: 'Pengalaman Klien', text: 'Ketepatan waktu dan komunikasi tim.' },
];
export const shorts = ['q46fspEHF0U', 'HKiPiOvHwJQ', 'aC108JFanEM', 'JgUexXg67fg', 'M4kwhmb1HPs'];

// Proyek yang sedang berjalan. `city` = slug halaman area.
export const ongoing = [
  { name: 'Bekasi Jaya Indah', scope: 'Renovasi rumah pribadi', type: 'Residential', city: 'bekasi' },
  { name: 'Taman Parahyangan, Lippo Village', scope: 'Renovasi rumah mewah', type: 'Residential', city: 'tangerang' },
  { name: 'Taman Royale Poris', scope: 'Renovasi rumah modern tropis', type: 'Residential', city: 'tangerang' },
  { name: 'Kebayoran Lama Raya', scope: 'Butik Batik Tulis Lavi', type: 'Commercial', city: 'jakarta', project: 'butik-batik-tulis-lavi' },
  { name: 'Taman Meruya Ilir', scope: 'Renovasi total & interior', type: 'Luxury', city: 'jakarta' },
  { name: 'Kota Wisata', scope: 'Renovasi rumah mewah', type: 'Luxury', city: 'bogor' },
  { name: 'Summarecon Morizen', scope: 'Renovasi rumah konsep Jepang', type: 'Luxury', city: 'bekasi' },
  { name: 'A Better Cup Depok', scope: 'Fit-out outlet F&B', type: 'Commercial', city: 'depok', project: 'a-better-cup-depok' },
  { name: 'Pondok China', scope: 'Kos mahasiswa premium', type: 'Investment', city: 'depok' },
];

// FAQ umum (homepage). Diambil dari situs lama.
export const faqs = [
  { q: 'Berapa biaya jasa konstruksi di Kalmer?', a: 'Kami tidak memakai sistem “harga borongan per meter” yang sering menjebak dengan spesifikasi tidak jelas. Biaya dihitung dari RAB detail yang mencantumkan volume, harga satuan, dan merek material secara transparan, tanpa biaya siluman di tengah jalan.' },
  { q: 'Apakah ada biaya untuk konsultasi dan survey lokasi?', a: 'Konsultasi awal via Zoom atau telepon gratis. Survey lokasi dan pengukuran dikenakan biaya mulai Rp1.000.000 (tergantung lokasi dan luas), dan Anda mendapat denah eksisting yang akurat sebagai dasar perencanaan.' },
  { q: 'Apakah bisa memakai desain dari arsitek saya sendiri?', a: 'Sangat bisa. Tim teknis kami menerjemahkan gambar desain (DED) menjadi realita konstruksi dengan presisi tinggi, dan melakukan value engineering bila perlu untuk menyesuaikan budget tanpa mengurangi estetika utama.' },
  { q: 'Bagaimana sistem pembayarannya? Aman?', a: 'Pembayaran bertahap (termin) berdasarkan progres fisik di lapangan sesuai kontrak (SPK). Anda hanya membayar untuk yang sudah terbangun. DP yang wajar hanya untuk mobilisasi awal.' },
  { q: 'Apakah ada garansi setelah bangunan selesai?', a: 'Ada masa retensi (pemeliharaan) 3 bulan setelah serah terima untuk perbaikan minor, ditambah garansi struktur beton dan kebocoran atap sesuai klausul kontrak resmi.' },
  { q: 'Berapa lama proses pembangunannya?', a: 'Tergantung luas dan kerumitan desain. Sebagai gambaran, rumah 2 lantai tipe 150–200 m² biasanya 6–8 bulan. Timeline (Kurva S) dicantumkan mengikat di kontrak.' },
  { q: 'Apakah Kalmer menerima renovasi kecil?', a: 'Saat ini kami tidak menerima renovasi skala mikro seperti hanya mengganti keramik, cat ulang satu ruangan, atau perbaikan bocor ringan. Kami fokus pada renovasi total, bangun baru, dan renovasi komersial menyeluruh.' },
  { q: 'Saya sibuk, bagaimana memantau proyek?', a: 'Dedicated Project Manager mengirim laporan progres mingguan (foto dan video) via WhatsApp Group, sehingga Anda tetap bisa fokus pada pekerjaan.' },
  { q: 'Area mana saja yang dilayani?', a: 'Jabodetabek (Jakarta, Bogor, Depok, Tangerang, Bekasi) untuk memastikan kontrol kualitas dan pengawasan maksimal dari tim pusat kami di Bekasi.' },
];
