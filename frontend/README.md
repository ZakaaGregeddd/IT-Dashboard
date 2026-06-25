# Aplikasi Client Frontend - IT Dashboard

Folder ini berisi antarmuka pengguna (Frontend Client) dari sistem **IT Dashboard** yang dibangun menggunakan React, TypeScript, dan Vite.

---

##  Stack Teknologi

* **Framework**: React (v18) & TypeScript
* **Build Tool**: Vite (Sangat cepat untuk proses development dan bundling)
* **Gaya (Styling)**: Vanilla CSS & TailwindCSS (untuk tata letak layout dasar)
* **Pustaka Grafik**: Chart.js dengan wrapper `react-chartjs-2`
* **Ikon**: Lucide React

---

##  Perintah yang Tersedia (Scripts)

Di dalam folder `/frontend`, Anda dapat menjalankan perintah berikut:

### 1. Menjalankan Mode Development
```bash
npm run dev
```
Menjalankan server lokal pengembangan (biasanya di `http://localhost:5173`). Dilengkapi fitur **Hot Module Replacement (HMR)** yang otomatis meng-update browser setiap kali Anda menyimpan perubahan kode.

### 2. Membuat Bundle Produksi
```bash
npm run build
```
Memeriksa tipe data TypeScript (`tsc`) dan melakukan kompilasi serta optimasi seluruh kode program menjadi file statis siap rilis (HTML, CSS, JS) di dalam folder `/dist`.

### 3. Menjalankan Hasil Build Produksi secara Lokal
```bash
npm run preview
```
Menjalankan server lokal untuk melihat hasil kompilasi produksi (`/dist`) sebelum diunggah ke server hosting.

---

## Struktur Kode Frontend

* `public/`: Tempat penyimpanan aset statis publik.
* `src/components/`: Komponen UI reusable (seperti Card, Avatar, dan modal konfirmasi).
* `src/layouts/`: Layout utama dashboard seperti `Sidebar.tsx`, `Header.tsx`, dan `MainLayout.tsx`.
* `src/features/`: Modul-modul fitur halaman dashboard terpisah secara modular. Setiap modul input dilengkapi dengan visualisasi grafik Chart.js, tabel interaktif dengan pagination, serta pop-up konfirmasi peringatan sebelum penyimpanan data.
* `src/utils/`: Fungsi pembantu global (seperti helper navigasi dan sistem deteksi data kotor `navigation.ts`).
* `src/App.tsx`: Router utama aplikasi dan tempat penempelan modal dialog peringatan global.
* `src/main.tsx`: Entry point utama aplikasi React.
