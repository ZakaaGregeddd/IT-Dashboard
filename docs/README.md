# Panduan Konfigurasi & Pengembangan IT Dashboard

Dokumen ini ditujukan bagi programmer/developer yang ingin memelihara, memperbaiki, atau meningkatkan fungsionalitas sistem **IT Dashboard**. Dokumentasi ini mencakup arsitektur sistem, tata cara setup, penjelasan struktur folder, serta detail implementasi fitur-fitur penting yang telah ditambahkan.

---

## 1. Ringkasan Proyek & Teknologi

Sistem IT Dashboard dirancang dengan arsitektur **SPA (Single Page Application)** modern yang terintegrasi dengan database terpusat (Single Source of Truth) untuk menyajikan visualisasi KPI performa IT secara real-time.

### Stack Teknologi
* **Frontend**: React (v18), TypeScript, Vite (Build Tool), TailwindCSS / Vanilla CSS (Styling), Lucide React (Icons).
* **Visualisasi**: Chart.js dengan wrapper `react-chartjs-2`.
* **Backend**: Node.js, Express, TypeScript.
* **Database & ORM**: PostgreSQL dengan Prisma ORM.

---

## 2. Tata Cara Setup Lokal (Local Development)

### Persyaratan Sistem (Prerequisites)
* Node.js (versi 18 atau lebih baru)
* PostgreSQL Database Server

### Langkah 1: Setup Backend & Database
1.  Buka terminal di folder `/backend`.
2.  Instal dependensi:
    ```bash
    npm install
    ```
3.  Salin file konfigurasi lingkungan:
    ```bash
    cp .env.example .env
    ```
    *Sesuaikan nilai `DATABASE_URL` di dalam file `.env` dengan kredensial database PostgreSQL lokal Anda.* 4.  Lakukan sinkronisasi database dan jalankan migrasi Prisma:
    ```bash
    npx prisma migrate dev
    ```
5.  *(Opsional)* Jalankan seeder jika ingin mengisi data awal:
    ```bash
    npx prisma db seed
    ```
6.  Jalankan server backend dalam mode development:
    ```bash
    npm run dev
    ```
    *Backend akan berjalan di port `http://localhost:5000`.* ### Langkah 2: Setup Frontend
1.  Buka terminal di folder `/frontend`.
2.  Instal dependensi:
    ```bash
    npm install
    ```
3.  Jalankan server frontend lokal:
    ```bash
    npm run dev
    ```
    *Aplikasi web dapat diakses di browser melalui alamat yang tertera di terminal (biasanya `http://localhost:5173`).* 4.  Untuk memvalidasi kesiapan deploy produksi dan melakukan pengecekan tipe data TypeScript:
    ```bash
    npm run build
    ```

---

## 3. Struktur Folder & Tata Letak Kode

Struktur folder dirancang dengan pola **Feature-Based Modular** untuk memisahkan logika antar halaman secara rapi.

```text
IT-Dashboard/
├── docs/                      # Dokumentasi pengembang (folder ini)
│   └── README.md
├── backend/                   # Kode program API Server (Node/Express)
│   ├── prisma/                # Schema database & file migrasi database
│   └── src/
│       ├── controllers/       # Controller untuk memproses request API
│       ├── services/          # Logika bisnis & interaksi database via Prisma
│       └── routes/            # Definisi endpoint API
└── frontend/                  # Kode program antarmuka (React/Vite)
    ├── public/                # Aset statis publik
    └── src/
        ├── components/        # Komponen UI reusable (Card, Avatar, dll)
        ├── layouts/           # Layout utama (Sidebar, Header, MainLayout)
        ├── utils/             # Helper utilitas global (navigation, dll)
        ├── pages/             # Export registry utama untuk halaman
        └── features/          # Kode fitur terbagi secara modular
            └── dashboard/
                └── pages/     # Seluruh 22 Halaman Dashboard (.tsx)
```

---

## 4. Panduan Teknis Fitur Utama

Berikut adalah cara kerja dan alur kode untuk fitur-fitur premium yang telah diimplementasikan:

### A. Fitur Peringatan Perubahan Belum Disimpan (Global Warning Blocker)
Fitur ini mencegah hilangnya data inputan user secara tidak sengaja ketika berpindah halaman.
1.  **Deteksi Perubahan Otomatis (`/utils/navigation.ts`)**:
    * Menggunakan listener `'input'` global untuk mendeteksi pengetikan pada elemen `input`, `textarea`, dan `select` di halaman mana pun. Ketika terdeteksi, status `isGlobalDirty` diubah menjadi `true`.
    * Menggunakan listener `'click'` global untuk mendeteksi klik pada tombol dengan kata kunci simpan/batal (seperti "Simpan", "Save", "Batal", "Cancel", "Confirm", "Konfirmasi"). Ketika diklik, status `isGlobalDirty` direset menjadi `false`.
    * Halaman yang memiliki logika validasi kompleks (seperti Lisensi) dapat mendaftarkan fungsi override spesifik menggunakan `setIsDirtyCheck()`.
2.  **Intersepsi Navigasi Client-Side (`App.tsx`)**:
    * Fungsi `navigateTo` memicu event kustom `'show-unsaved-warning'` jika status halaman terdeteksi kotor (dirty).
    * `App.tsx` menangkap event tersebut, membatalkan navigasi, menyimpan URL tujuan sementara, dan menampilkan **modal dialog kustom yang indah** (glassmorphism dengan blur latar belakang).
    * Pemberitahuan suara dibuat secara dinamis menggunakan **Web Audio API** (dual-sine waves 360Hz & 450Hz dengan peluruhan eksponensial) yang **100% bebas royalti/lisensi komersial**.
    * Jika pengguna memilih "Tinggalkan Halaman", status dirty direset dan navigasi dilanjutkan.
3.  **Intersepsi Reload & Close Tab**:
    * Event `'beforeunload'` didaftarkan secara global di `App.tsx` untuk menahan refresh halaman atau penutupan tab browser ketika ada data yang belum disimpan.

### B. Desain Responsif & Mobile Drawer Sidebar
Layout dashboard secara otomatis menyesuaikan tampilan saat diakses melalui smartphone:
1.  **State Kolaps Otomatis (`MainLayout.tsx`)**:
    * State `isSidebarCollapsed` mendeteksi lebar layar secara real-time. Jika lebar layar `< 1024px` (ukuran tablet/mobile), sidebar akan langsung **terkolaps secara default**.
2.  **Posisi Overlay & Backdrop Blur**:
    * Di bawah `1024px`, sidebar diposisikan sebagai **drawer overlay absolut** (`fixed z-50 h-screen`) dengan animasi transisi yang halus.
    * Ketika sidebar terbuka di mobile, sebuah **backdrop overlay gelap dengan efek blur** (`backdrop-blur-sm`) dirender di atas konten utama. Mengetuk area luar (backdrop) ini akan menutup sidebar secara otomatis.
3.  **Auto-Close on Navigate (`Sidebar.tsx`)**:
    * Sidebar mendengarkan event `'navigate'`. Ketika user memilih menu baru di smartphone, sidebar akan **menutup otomatis** segera setelah rute berubah, sehingga konten halaman langsung terlihat penuh.
4.  **Resizer Nonaktif di Mobile**:
    * Fitur geser ukuran lebar sidebar dinonaktifkan di mobile (`lg:flex hidden` pada elemen resizer) agar tidak mengganggu gestur geser layar sentuh.

### C. Fitur Pagination Interaktif dengan Input Angka Halaman
Diterapkan pada tabel input di halaman **Utilisasi CPU Server, Utilisasi Memory Server, Utilisasi Storage Server, dan Lisensi**:
1.  **Navigasi Angka Langsung**:
    * Format kontrol pagination diubah menjadi: `(tombol prev) | Halaman [input angka] dari [total halaman] | (tombol next)`.
    * User dapat mengetik langsung angka halaman pada kotak input untuk langsung melompat ke halaman tersebut.
2.  **Sinkronisasi State & Validasi**:
    * State `pageInput` mensinkronisasikan pengetikan user dengan halaman aktif (`currentPage`).
    * Input dibatasi secara aman (`min={1} max={totalPages}`).
    * Menggunakan event `onBlur`. Jika user mengosongkan input atau mengetik angka di luar batas halaman, nilai kotak input otomatis kembali ke nomor halaman aktif saat ini.

### D. Aturan Filter Grafik Multi-Tahun (YTD)
Seluruh 20 halaman detail visualisasi menerapkan aturan penapisan jangka panjang:
1.  **Rentang Default 5 Tahun**:
    * Saat halaman pertama kali dimuat, filter tahun awal (`startYear`) dan tahun akhir (`endYear`) diatur secara dinamis untuk menampilkan rentang **5 tahun terakhir** (tahun saat ini dikurangi 4 hingga tahun saat ini).
2.  **Skala Y-Axis Integer**:
    * Pada grafik YTD dengan nilai bulat (seperti jumlah SDM), sumbu Y dikonfigurasi menggunakan callback Chart.js `Number.isInteger` agar hanya menampilkan angka bulat (menghilangkan pecahan desimal seperti `1.5` atau `2.3`).
3.  **Batas Skala Tetap (Fixed Bound)**:
    * Pada grafik persentase (seperti RKAP, Program Kerja, WAN, Keamanan), sumbu Y dikunci dengan batas tetap `0%` hingga `100%` agar visualisasi tren grafik tidak melebihi area visual standar.

### E. Sistem Auto-Prefill Data Terakhir (Draf Pintar)
Fitur ini mempermudah pengguna saat menginput data baru untuk periode yang belum memiliki catatan di database, dengan menduplikasi data dari periode terakhir yang berhasil disimpan.
1. **Deteksi Data Kosong (Backend Service)**:
   * Setiap service pada backend (misal: `PcSupportService`, `UtilisasiBandwidthService`, dll.) melakukan pemeriksaan awal. Jika data untuk periode yang diminta (`tahun` atau `bulan, tahun`) belum tersedia di database (`!master` atau `!currentMaster`), backend tidak akan langsung mengembalikan nilai nol kosong.
2. **Pengambilan & Duplikasi Periode Terakhir**:
   * Sistem akan mencari record master terbaru untuk kategori tersebut dengan pengurutan kronologis terbalik (`tahun desc` dan `bulan desc`).
   * Jika ditemukan, detail baris dari periode terakhir tersebut disalin secara utuh ke objek respons untuk periode baru.
3. **Pemberian Status Draf Aman**:
   * Detail baris yang disalin sengaja **dihilangkan atribut `id` database-nya**. 
   * Dengan tidak adanya ID pada detail draf tersebut, frontend akan merender data tersebut seperti biasa. Ketika pengguna menekan tombol **Simpan**, frontend mengirim data tanpa ID ke backend, yang kemudian akan memprosesnya sebagai operasi **INSERT** baru (bukan UPDATE) untuk periode baru tersebut. Ini menjamin data periode sebelumnya tidak akan rusak atau tertimpa secara tidak sengaja.

---

## 5. Panduan Menambah Halaman Baru

Jika Anda ingin menambahkan halaman dashboard baru di masa mendatang, ikuti langkah-langkah berikut:

1.  **Buat File Page**: Buat file komponen baru di `/frontend/src/features/dashboard/pages/NamaHalamanPage.tsx`.
2.  **Daftarkan Export**: Tambahkan baris export halaman baru tersebut di file `/frontend/src/pages/index.ts`.
3.  **Daftarkan Rute**: Buka `/frontend/src/App.tsx`, import komponen halaman baru Anda, lalu daftarkan alamat path URL-nya di dalam fungsi `renderPage()`.
4.  **Tambahkan ke Sidebar**: Buka `/frontend/src/layouts/Sidebar.tsx` dan tambahkan menu navigasi baru Anda di dalam struktur `<nav>`. Gunakan komponen `<SidebarSubItem>` dengan atribut `to="/alamat-path-url"`.
5.  **Daftarkan Breadcrumb**: Buka `/frontend/src/layouts/Header.tsx` dan daftarkan penamaan judul breadcrumb yang sesuai untuk path URL baru Anda di dalam objek `breadcrumbMapping`.

---

*Selamat mengembangkan! Dokumen ini dibuat untuk memastikan IT Dashboard tetap andal, mudah dipelihara, dan terus berkembang dengan standar kode yang tinggi.* 