# Dashboard Performa IT Perusahaan

Sebuah platform dashboard analitik terpusat (**Single Source of Truth**) untuk memantau, mengelola, dan memvisualisasikan Key Performance Indicators (KPI) di seluruh divisi teknologi informasi perusahaan secara real-time.

Platform ini menggantikan sistem pelaporan lama berbasis static HTML iframes menjadi sebuah aplikasi web modern satu halaman (**Single Page Application**) berkinerja tinggi, responsif, dan terintegrasi penuh dengan database relasional PostgreSQL.

---

## Fitur Utama Platform

* **Visualisasi Data Real-Time**: Terintegrasi penuh dengan pustaka Chart.js (`react-chartjs-2`) untuk menyajikan grafik batang, tren garis, serta diagram lingkaran interaktif langsung dari database PostgreSQL.
* **Manajemen & Entri Data Terpusat**: Form input terpadu di setiap halaman untuk menambah, mengubah, dan menghapus entri data bulanan secara langsung dengan sistem sinkronisasi otomatis ke database.
* **Sistem Proteksi Data (Peringatan Data Belum Disimpan)**: Mencegah kehilangan data dengan mendeteksi perubahan inputan. Perpindahan halaman SPA akan diintersepsi oleh modal dialog peringatan kustom yang indah (glassmorphism blur) lengkap dengan efek suara chime buatan **Web Audio API** yang 100% bebas lisensi komersial.
* **Alur Hapus Baris Lembut (Soft-Delete) & Feedback Visual**: Tombol hapus tidak langsung menghilangkan baris dari tabel, melainkan menandainya dengan warna merah kontras (`bg-red-100`) dan mengunci kolom inputnya. Dilengkapi tombol "Batal Hapus" (Undo) berbasis ikon `RotateCcw` untuk pemulihan instan. Perhitungan total dan grafik live langsung menyesuaikan secara real-time (mengabaikan baris terhapus) sebelum perubahan disimpan secara permanen.
* **Pengurutan (Sorting) Dinamis**: Memungkinkan pengurutan data entri secara instan, seperti pengurutan berdasarkan total lisensi terdaftar ("Terkecil" & "Terbesar") untuk mempermudah analisis kuantitas produk lisensi.
* **Layout Responsif & Laci Sidebar Mobile**: Antarmuka adaptif yang dioptimalkan untuk smartphone dan tablet dengan sidebar menu bermodel drawer overlay yang menutup otomatis saat berpindah halaman.
* **Pagination Interaktif**: Kontrol tabel data entri yang mendukung pembatasan baris (rows per page) serta input angka halaman langsung untuk berpindah lembar secara instan.
* **Ekspor Grafik Berkinerja Tinggi**: Fitur download instan grafik visualisasi ke format gambar PNG secara langsung di sisi client (client-side canvas export) tanpa membebani server.
* **Filter Kronologis Multi-Tahun (YTD)**: Menyajikan analisis tren performa Year to Date (YTD) dengan rentang waktu historis 5 tahun secara dinamis.

---

##  Stack Teknologi

| Komponen | Teknologi yang Digunakan |
| :--- | :--- |
| **Antarmuka (Frontend)** | React (v18), TypeScript, Vite, TailwindCSS / Vanilla CSS, Lucide Icons |
| **Pustaka Grafik** | Chart.js, react-chartjs-2 |
| **Server API (Backend)** | Node.js, Express, TypeScript |
| **Database & ORM** | PostgreSQL, Prisma ORM |

---

## Cakupan 22 Modul Dashboard

Sistem ini mencakup 22 modul pelaporan IT terintegrasi yang terbagi ke dalam 3 kategori utama:

1.  **IT Planning & Security (Perencanaan & Keamanan TI)**:
    * Realisasi Program Kerja TI
    * Realisasi RKAP TI
    * SDM IT (Outsource & Pegawai)
    * Lisensi Software (Lengkap dengan notifikasi masa kadaluarsa Kategori Urgent, Peringatan, & Aman)
2.  **App Dev & Services / EIS (Pengembangan Aplikasi & Layanan)**:
    * Ketersediaan Report Aplikasi SCMC
    * Tingkat Ketersediaan Sistem
3.  **IT Operation (Operasional TI)**:
    * Utilisasi CPU Server, Memori Server, & Storage Server
    * Utilisasi CPU & Memori Aplikasi (Ellipse, Eproc/Cisea-Spend, Minemarket)
    * Utilisasi CPU, Memori, & Storage Database (Ellipse, Minemarket, Eproc/CISEA-SPEND)
    * Rata-rata Utilisasi Bandwidth Jaringan
    * Ketersediaan Sistem Backup (Ellipse, Email, DR, Jaringan WAN, & CISEA)
    * Tingkat Ketersediaan Sistem Keamanan TI
    * Penyelesaian Pekerjaan PC Support
    * Penyelesaian Permintaan Layanan Aplikasi TI & Layanan TI Operasional
    * Realisasi Restore Ellipse dan Email

---

## Panduan Memulai Cepat (Quick Start)

### 1. Konfigurasi Backend & Database PostgreSQL
```bash
cd backend
npm install
cp .env.example .env     # Atur kredensial DATABASE_URL PostgreSQL Anda
npx prisma migrate dev   # Sinkronisasi skema tabel database
npx prisma db seed       # Isi data awal (seeder)
npm run dev              # Jalankan server API (port 5000)
```

### 2. Konfigurasi Frontend React
```bash
cd ../frontend
npm install
npm run dev              # Jalankan aplikasi development (port 5173)
```

---

## Dokumentasi Pengembang

Untuk panduan teknis yang lebih mendalam mengenai detail arsitektur, implementasi event listener status kotor (dirty state), konfigurasi parameter lisensi, optimalisasi visualisasi, dan cara menambah halaman baru, silakan baca buku panduan pengembang di:
 **[Panduan Konfigurasi & Pengembangan IT Dashboard (docs/README.md)](./docs/README.md)** ---
