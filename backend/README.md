# API Server Backend - IT Dashboard

Folder ini berisi server API (Backend) untuk aplikasi **IT Dashboard** yang dibangun menggunakan Node.js, Express, TypeScript, dan Prisma ORM dengan database PostgreSQL.

---

##  Stack Teknologi

* **Runtime**: Node.js (v18+) & TypeScript
* **Web Framework**: Express.js
* **Database ORM**: Prisma ORM (Penyedia query aman dan sinkronisasi skema database)
* **Database**: PostgreSQL

---

##  Langkah Konfigurasi & Perintah

Di dalam folder `/backend`, lakukan langkah-langkah berikut untuk mengaktifkan server:

### 1. Instal Dependensi
```bash
npm install
```

### 2. Konfigurasi Environment (`.env`)
Salin file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Buka file `.env` dan sesuaikan koneksi database PostgreSQL Anda pada variabel `DATABASE_URL`:
```text
DATABASE_URL="postgresql://username:password@localhost:5432/it_dashboard_db?schema=public"
```

### 3. Migrasi Database (Prisma Schema Sync)
Jalankan migrasi untuk menyelaraskan skema database PostgreSQL lokal Anda dengan skema Prisma:
```bash
npx prisma migrate dev
```
Perintah ini akan membuat tabel-tabel pelaporan IT secara otomatis.

### 4. Mengisi Data Awal (Seeder)
Jika Anda ingin mengisi database dengan data transaksi awal/mock bulanan untuk keperluan visualisasi:
```bash
npx prisma db seed
```

### 5. Jalankan Server API
Jalankan server backend dalam mode pengembangan:
```bash
npm run dev
```
Server API backend akan aktif di port **`http://localhost:5000`**.

---

## Struktur Kode Backend

* `prisma/`: Berisi file `schema.prisma` (definisi tabel dan relasi database) serta folder `migrations/` dan file `seed.ts` (data seeder awal).
* `src/routes/`: Rute endpoint API (seperti `/api/licenses`, `/api/utilisasi/cpu`, dll).
* `src/controllers/`: Pengendali request API untuk memproses data masukan dan memanggil service.
* `src/services/`: Logika bisnis utama, manipulasi data, dan interaksi database menggunakan Prisma Client. Dilengkapi dengan sistem fallback cerdas untuk menduplikasi data periode terakhir sebagai draf ketika data periode baru belum tersedia.
* `src/index.ts`: Titik masuk utama (entry point) aplikasi Express Server.
