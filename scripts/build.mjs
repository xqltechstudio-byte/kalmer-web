// Bangun situs dari database tanpa menjalankan server (sama dengan tombol "Publikasikan").
//   npm run build
import { publish } from '../server/publish.mjs';

const r = await publish();
console.log(`✔ ${r.pages} halaman → dist/ dalam ${r.ms} ms`);
r.warnings.forEach((w) => console.log('  ⚠', w));
