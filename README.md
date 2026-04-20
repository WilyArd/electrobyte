# ElectroByte — Next-Gen Electronics & IT Hardware

ElectroByte adalah platform e-commerce modern, cepat, dan responsif yang dirancang khusus untuk penjualan perangkat keras IT dan elektronik premium (seperti PC Gaming, komponen komputer, laptop, dan aksesori).

Proyek ini dibangun dengan arsitektur **Monorepo** yang memisahkan bagian *Storefront* (Frontend untuk pelanggan), *Admin Panel* (Dashboard untuk pengelola), dan *Backend API*.

---

## 👨‍💻 Identitas Pengembang

- **Nama:** Rahmanda Ahmad Wilyan Januardo
- **NIM:** 23083000113

---

## 🚀 Arsitektur & Teknologi

Proyek ini menggunakan stack modern untuk memastikan performa yang tinggi dan pengalaman pengguna yang luar biasa:

### 1. Frontend (Storefront)
Aplikasi utama untuk pelanggan, berfokus pada SEO, performa, dan desain UI yang memukau (Glassmorphism & Dark Mode).
- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS v4
- **State Management:** Zustand (Cart persistence)
- **Authentication:** NextAuth.js v5 (Email/Password & Google OAuth)

### 2. Admin Panel
Dashboard terpisah berupa Single Page Application (SPA) yang aman dan sangat cepat untuk mengelola toko.
- **Framework:** React + Vite
- **Styling:** Tailwind CSS v4 + Lucide React
- **Data Fetching:** Axios dengan sistem interceptor JWT

### 3. Backend API
Layanan API terpusat berkinerja tinggi yang menangani logika bisnis, autentikasi, dan database.
- **Framework:** Elysia.js (Berjalan di atas Bun runtime)
- **Database ORM:** Prisma
- **Database:** PostgreSQL (Di-hosting via Docker)
- **Keamanan:** JWT via Web Crypto API (HKDF standard) & bcryptjs

---

## ✨ Fitur Utama

### Untuk Pelanggan (Frontend):
- 🛍️ **Katalog Produk Dinamis:** Pencarian produk secara real-time dan penyaringan berdasarkan kategori.
- 🛒 **Shopping Cart Cerdas:** Keranjang belanja yang tersimpan persisten (Zustand) dan sinkronisasi yang cepat.
- 🔐 **Autentikasi Aman:** Sistem login yang mulus menggunakan standar NextAuth.js.
- 👤 **Profil & Riwayat:** Pengguna dapat melihat detail profil dan melacak riwayat pesanan (Order History) mereka secara langsung.
- 🎨 **Desain Premium:** Antarmuka responsif penuh dengan tema *Dark Mode*, *glassmorphism*, dan animasi yang halus.

### Untuk Administrator (Admin Panel):
- 📊 **Dashboard Analitik:** Ringkasan statistik performa toko (Total Revenue, Orders, Products, Users).
- 📦 **Manajemen Produk (CRUD):** Tambah, Edit, dan Hapus produk dengan antarmuka *modal* interaktif.
- 🔐 **Autentikasi Terpisah:** Area khusus Admin yang dilindungi ketat menggunakan token JWT terenkripsi.
- ⚡ **Real-time Search:** Filter produk secara instan berdasarkan nama, ID, atau kategori.

---

## 🛠️ Cara Menjalankan Secara Lokal

Pastikan Anda telah menginstal **Bun**, **Node.js**, dan **Docker**.

1. **Jalankan Database (PostgreSQL)**
   ```bash
   docker-compose up -d
   ```

2. **Jalankan Backend (Elysia.js - Port 4000)**
   ```bash
   cd backend
   bun install
   bunx prisma db push
   bun run dev
   ```

3. **Jalankan Frontend Storefront (Next.js - Port 3000)**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Jalankan Admin Panel (Vite - Port 5000)**
   ```bash
   cd admin
   bun install
   bun run dev
   ```
