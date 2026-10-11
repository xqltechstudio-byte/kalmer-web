// Daftar semua foto situs. `src` = sumber asli (WordPress lama), hanya dipakai
// oleh scripts/images.mjs untuk mengunduh sekali. Setelah itu foto disimpan di
// src/images/raw dan situs tidak lagi bergantung ke WordPress.
// `og: true` = dibuatkan versi JPG 1200x630 untuk preview WhatsApp/Facebook.

const WP = 'https://kalmer.id/wp-content/uploads/';

export const images = {
  // A Better Cup — Tebet
  'abc-tebet-1': { src: WP + '2026/01/WhatsApp-Image-2026-01-05-at-9.27.43-AM-1.jpeg', alt: 'Interior A Better Cup Tebet dengan dinding panel kayu melengkung dan pencahayaan tersembunyi', og: true },
  'abc-tebet-2': { src: WP + '2026/01/WhatsApp-Image-2026-01-05-at-9.27.30-AM-1.jpeg', alt: 'Area duduk A Better Cup Tebet hasil renovasi Kalmer' },
  'abc-tebet-3': { src: WP + '2026/01/WhatsApp-Image-2026-01-05-at-9.27.43-AM.jpeg', alt: 'Detail sofa built-in dan dinding dekoratif di A Better Cup Tebet' },
  'abc-tebet-4': { src: WP + '2026/01/WhatsApp-Image-2026-01-05-at-9.27.30-AM-3.jpeg', alt: 'Ruang dalam A Better Cup Tebet setelah renovasi total', og: true },
  'abc-tebet-5': { src: WP + '2026/01/WhatsApp-Image-2026-01-05-at-9.31.59-AM.jpeg', alt: 'Tangga dan area lantai atas A Better Cup Tebet' },
  'abc-tebet-6': { src: WP + '2026/01/WhatsApp-Image-2026-01-05-at-9.31.46-AM.jpeg', alt: 'Pencahayaan dekoratif dan finishing plafon A Better Cup Tebet' },
  'abc-tebet-7': { src: WP + '2026/01/WhatsApp-Image-2026-01-05-at-9.31.37-AM.jpeg', alt: 'Detail finishing interior A Better Cup Tebet' },

  // A Better Cup — Universitas Tarumanagara
  'abc-untar-1': { src: WP + '2026/01/WhatsApp-Image-2026-01-05-at-10.42.37-AM-1.jpeg', alt: 'Kios A Better Cup di Universitas Tarumanagara dengan plafon kayu melengkung dan lampu LED', og: true },
  'abc-untar-2': { src: WP + '2026/01/WhatsApp-Image-2026-01-05-at-10.42.37-AM.jpeg', alt: 'Area publik A Better Cup Universitas Tarumanagara, Jakarta Barat' },

  // Red Chicken Burger — Setu
  'rcb-setu-before': { src: WP + '2026/01/WhatsApp-Image-2026-01-05-at-11.31.43-AM.jpeg', alt: 'Kondisi awal ruko sebelum direnovasi menjadi Red Chicken Burger di Setu, Bekasi' },
  'rcb-setu-after': { src: WP + '2026/01/WhatsApp-Image-2026-01-05-at-11.32.43-AM.jpeg', alt: 'Fasad Red Chicken Burger Setu setelah renovasi oleh Kalmer', og: true },

  // A Better Cup — Depok
  'abc-depok-render': { src: WP + '2026/01/Gemini_Generated_Image_xynmq0xynmq0xynm.png', alt: 'Visualisasi 3D desain A Better Cup cabang Depok', og: true },
  'abc-depok-site': { src: WP + '2026/01/WhatsApp-Image-2026-01-04-at-1.00.24-PM.jpeg', alt: 'Kondisi lokasi eksisting A Better Cup Depok sebelum pengerjaan' },

  // A Better Cup — Surabaya (tahap desain)
  'abc-surabaya-render': { src: WP + '2026/01/Gemini_Generated_Image_a72xmea72xmea72x-1.png', alt: 'Visualisasi 3D desain A Better Cup Tunjungan Surabaya', og: true },

  // Butik Batik Tulis Lavi — Kebayoran Lama
  'lavi-render-fasad': { src: WP + '2026/01/WhatsApp-Image-2026-01-06-at-11.31.30-1-1.jpeg', alt: 'Desain 3D fasad Butik Batik Tulis Lavi, Kebayoran Lama', og: true },
  'lavi-render-2': { src: WP + '2026/01/WhatsApp-Image-2026-01-06-at-11.31.30-2-1.jpeg', alt: 'Desain 3D area lounge Butik Batik Tulis Lavi dengan void dua lantai', og: true },
  'lavi-render-3': { src: WP + '2026/01/WhatsApp-Image-2026-01-06-at-11.31.30-3-1.jpeg', alt: 'Desain 3D lorong display butik dengan pencahayaan hangat', og: true },
  'lavi-render-4': { src: WP + '2026/01/WhatsApp-Image-2026-01-06-at-11.31.31-1-1.jpeg', alt: 'Desain 3D area display Butik Batik Tulis Lavi' },
  'lavi-render-5': { src: WP + '2026/01/WhatsApp-Image-2026-01-06-at-11.31.31-3-1.jpeg', alt: 'Desain 3D pantry dengan meja marmer dan aksen tegel motif' },
  'lavi-render-layout': { src: WP + '2026/01/WhatsApp-Image-2026-01-06-at-11.31.32-1-1.jpeg', alt: 'Desain 3D ruang kerja di Butik Batik Tulis Lavi' },
  'lavi-progres-struktur': { src: WP + '2026/01/WhatsApp-Image-2025-09-23-at-15.42.12-1-1.jpeg', alt: 'Progres pekerjaan struktur utama Butik Batik Tulis Lavi' },
  'lavi-progres-interior-1': { src: WP + '2026/01/WhatsApp-Image-2025-09-23-at-15.41.45-2-1.jpeg', alt: 'Progres pekerjaan interior Butik Batik Tulis Lavi' },
  'lavi-progres-fasad': { src: WP + '2026/01/WhatsApp-Image-2025-09-23-at-15.41.46-1-1.jpeg', alt: 'Progres pekerjaan fasad Butik Batik Tulis Lavi' },
  'lavi-progres-interior-2': { src: WP + '2026/01/WhatsApp-Image-2025-09-23-at-15.41.43-2-1.jpeg', alt: 'Progres pekerjaan interior lantai atas Butik Batik Tulis Lavi' },
  'lavi-progres-bekisting': { src: WP + '2026/01/WhatsApp-Image-2025-09-23-at-15.42.09-1-1.jpeg', alt: 'Pemasangan bekisting pada proyek Butik Batik Tulis Lavi' },
  'lavi-progres-pembesian': { src: WP + '2026/01/WhatsApp-Image-2025-09-23-at-15.42.07-1.jpeg', alt: 'Pekerjaan pembesian struktur pada proyek Butik Batik Tulis Lavi', og: true },

  // Founder
  'founder-rahadian-fatrah': { src: WP + '2026/01/Gemini_Generated_Image_d5c8sbd5c8sbd5c8-1.png', alt: 'Rahadian Fatrah, Founder dan CEO Kalmer Multi Teknik' },

  // Serah terima kunci
  'serah-terima-1': { src: WP + '2025/09/20230731_175628-scaled-1.jpg', alt: 'Serah terima rumah bersama pemilik di ruang keluarga yang sudah selesai', cat: 'serah' },
  'serah-terima-2': { src: WP + '2025/09/20230731_175406-scaled-1.jpg', alt: 'Penyerahan dokumen serah terima kepada pemilik rumah', cat: 'serah', og: true },
  'serah-terima-3': { src: WP + '2025/09/20230503_120436-scaled-1.jpg', alt: 'Tim Kalmer dan klien di depan rumah saat serah terima', cat: 'serah' },
  'serah-terima-4': { src: WP + '2025/09/20221213_153024-scaled-1.jpg', alt: 'Serah terima rumah dengan pagar ornamen kepada klien', cat: 'serah' },
  'serah-terima-5': { src: WP + '2025/09/20221126_135708-scaled-1.jpg', alt: 'Serah terima rumah dua lantai dengan pagar kayu', cat: 'serah', og: true },
  'serah-terima-bekasi': { src: WP + '2025/09/STK-Bekasi-1-scaled-1.jpg', alt: 'Serah terima kunci proyek rumah di Bekasi', cat: 'serah', og: true },

  // Galeri proyek lainnya
  'galeri-1': { src: WP + '2025/09/WhatsApp-Image-2025-08-12-at-13.30.39_335cd501.jpg', alt: 'Rumah dua lantai modern dengan fasad panel kayu hasil pembangunan Kalmer', cat: 'hunian', og: true },
  'galeri-2': { src: WP + '2025/09/0d715551c63adcd5428fcf471787375b-scaled-1.jpg', alt: 'Pemasangan rangka atap baja pada proyek bangunan industri', cat: 'struktur' },
  'galeri-3': { src: WP + '2025/09/e196b4837b5c5a8748849b33009bc030-scaled-1.jpg', alt: 'Tim lapangan Kalmer memasang struktur rangka baja', cat: 'struktur' },
  'galeri-4': { src: WP + '2025/09/22ad14211583fd1fada312ce626beb3e-scaled-1.jpg', alt: 'Crane mengangkat rangka baja di lokasi proyek', cat: 'struktur', og: true },
  'galeri-5': { src: WP + '2025/09/3bbb060527dd265e19ebb77beaf827e9-scaled-1.jpg', alt: 'Pekerjaan erection rangka baja dengan bantuan crane', cat: 'struktur' },
  'galeri-6': { src: WP + '2025/09/d1b0cb3be53d321275560bdc16b92a55-scaled-1.jpg', alt: 'Instalasi tangki stainless dan perpipaan di bawah atap baja', cat: 'struktur' },
  'galeri-7': { src: WP + '2025/09/011a994f8d87c010972b3cfecddb0c19-scaled-1.jpg', alt: 'Teknisi Kalmer memasang panel dan peralatan utilitas', cat: 'struktur' },
  'galeri-8': { src: WP + '2025/09/ed4e898d0428f01c033d72bdb94bb47d.jpeg', alt: 'Ruang keluarga bernuansa hijau dengan lengkung arsitektural', cat: 'hunian', og: true },
  'galeri-9': { src: WP + '2025/09/d572815c6fc5c270b6f204634e43e924.jpg', alt: 'Dapur putih minimalis dengan dinding motif marmer dan pintu kayu', cat: 'hunian' },
  'galeri-10': { src: WP + '2025/09/ba625f81836a4d87662cb38b66841dcc-scaled-1.jpeg', alt: 'Ruang keluarga dengan tangga dan aksen panel kayu', cat: 'hunian', og: true },
  'galeri-11': { src: WP + '2025/09/a2b423e1dd9b3d4ef026067d14cd2493.jpeg', alt: 'Ruang tamu dengan sofa biru dan rak besi dekoratif', cat: 'hunian' },
  'galeri-12': { src: WP + '2025/09/338252d86a61783f52b6ae4c065bd8a4-scaled-1.jpeg', alt: 'Ruang makan dan dapur terbuka dengan pintu kaca ke taman', cat: 'hunian', og: true },
};

// Logo klien (diproses terpisah: tinggi tetap, tanpa versi besar)
export const clientLogos = {
  'klien-kapal-api': { src: WP + '2026/01/logokapalapiglobal.png', alt: 'Kapal Api Global' },
  'klien-2': { src: WP + '2026/01/imageukuuku.png', alt: 'Logo klien Kalmer' },
  'klien-3': { src: WP + '2026/01/grrsef.png', alt: 'Logo klien Kalmer' },
  'klien-4': { src: WP + '2026/01/dwadwa.png', alt: 'Logo klien Kalmer' },
  'klien-5': { src: WP + '2026/01/imagedsfvz.png', alt: 'Logo klien Kalmer' },
  'klien-6': { src: WP + '2026/01/imagesdawadwsda.png', alt: 'Logo klien Kalmer' },
  'klien-7': { src: WP + '2026/01/imagedwdwdad.png', alt: 'Logo klien Kalmer' },
  'klien-8': { src: WP + '2026/01/imagedwadwd.png', alt: 'Logo klien Kalmer' },
  'klien-9': { src: WP + '2026/01/imagefe.png', alt: 'Logo klien Kalmer' },
  'klien-10': { src: WP + '2026/01/imagefes-scaled.png', alt: 'Logo klien Kalmer' },
  'klien-11': { src: WP + '2026/01/image.png', alt: 'Logo klien Kalmer' },
};

export const logo = {
  src: WP + '2025/09/Logo-Sosmed-01-1.png',
  // area logo di dalam PNG (sisanya padding transparan): left, top, width, height
  crop: { left: 206, top: 161, width: 360, height: 425 },
};
