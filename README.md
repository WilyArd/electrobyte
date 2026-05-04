# ⚡ ElectroByte — Next-Gen Electronics & IT Hardware

ElectroByte adalah platform e-commerce modern, cepat, dan responsif yang dirancang khusus untuk penjualan perangkat keras IT dan elektronik premium seperti PC Gaming, komponen komputer, laptop, dan aksesori.

Proyek ini dibangun dengan arsitektur **Monorepo** yang memisahkan tiga layanan: *Storefront* (Frontend pelanggan), *Admin Panel* (Dashboard pengelola), dan *Backend API* — semuanya dapat dijalankan sekaligus menggunakan **Docker Compose**.

---

## 👨‍💻 Identitas Pengembang

| Field | Detail |
|---|---|
| **Nama** | Rahmanda Ahmad Wilyan Januardo |
| **NIM** | 23083000113 |

---

## 🚀 Arsitektur & Teknologi

### 1. 🖥️ Frontend (Storefront) — Port 3000
Aplikasi utama untuk pelanggan, berfokus pada SEO, performa, dan UI premium.

| Teknologi | Keterangan |
|---|---|
| Next.js 15 (App Router) | Framework utama dengan SSR & Server Actions |
| Vanilla CSS | Styling custom (Glassmorphism & Dark Mode) |
| Zustand | State management untuk cart persistence |
| NextAuth.js v5 | Autentikasi Email/Password & Google OAuth |
| Prisma | ORM untuk koneksi ke database |

### 2. 🔧 Admin Panel — Port 5000
Dashboard SPA terpisah untuk pengelola toko, dilindungi JWT.

| Teknologi | Keterangan |
|---|---|
| React + Vite | Framework SPA yang ringan dan cepat |
| Tailwind CSS v4 | Utility-first styling |
| Lucide React | Icon library |
| Axios | HTTP client dengan interceptor JWT otomatis |

### 3. ⚙️ Backend API — Port 4000
Layanan API terpusat berkinerja tinggi menggunakan Bun runtime.

| Teknologi | Keterangan |
|---|---|
| Elysia.js | Web framework di atas Bun runtime |
| Prisma | ORM dengan type-safe queries |
| PostgreSQL (Neon Cloud) | Database cloud serverless |
| JWT + HKDF | Keamanan token via Web Crypto API |
| bcryptjs | Hashing password |

---

## ✨ Fitur Utama

### 🛍️ Untuk Pelanggan (Frontend)
- **Katalog Produk Dinamis** — Pencarian real-time dan filter berdasarkan kategori
- **Shopping Cart Cerdas** — Keranjang persisten dengan Zustand, sinkronisasi cepat
- **Autentikasi Lengkap** — Login Email/Password & Google OAuth via NextAuth.js
- **Profil & Riwayat Pesanan** — Lihat detail profil dan lacak semua transaksi
- **Desain Premium** — Dark Mode, glassmorphism, animasi halus, fully responsive

### 📊 Untuk Administrator (Admin Panel)
- **Dashboard Analitik** — Statistik toko: Revenue, Orders, Products, Users
- **Manajemen Produk (CRUD)** — Tambah, edit, hapus produk via modal interaktif
- **Autentikasi Terpisah** — Area admin dilindungi ketat dengan JWT terenkripsi
- **Real-time Search** — Filter produk instan berdasarkan nama, ID, atau kategori

---

## 🗂️ Struktur Proyek

```
electrobyte/
├── frontend/          # Next.js 15 Storefront (Port 3000)
│   ├── src/
│   │   ├── app/       # App Router pages & layouts
│   │   ├── actions/   # Server Actions
│   │   ├── components/
│   │   └── lib/       # Auth, Prisma, utils
│   └── Dockerfile
├── admin/             # React + Vite Admin Panel (Port 5000)
│   ├── src/
│   └── Dockerfile
├── backend/           # Elysia.js API (Port 4000)
│   ├── src/
│   │   ├── routes/    # auth, products, orders, users
│   │   └── db.ts      # Prisma client
│   └── Dockerfile
├── prisma/
│   └── schema.prisma  # Database schema (shared)
└── docker-compose.yml
```

---

## 🛠️ Cara Menjalankan

### Opsi A: Development Lokal (Rekomendasi untuk coding)

Pastikan sudah menginstall **Bun** dan **Node.js**.

```bash
# 1. Backend (Elysia.js — Port 4000)
cd backend
bun install
bunx prisma db push   # Sinkronisasi schema ke Neon DB
bun run dev

# 2. Frontend (Next.js — Port 3000)
cd frontend
npm install
npm run dev

# 3. Admin Panel (Vite — Port 5000)
cd admin
bun install
bun run dev
```

### Opsi B: Docker Compose (Untuk production / deployment)

Pastikan sudah menginstall **Docker**.

```bash
# Build semua service dan jalankan
docker-compose up -d --build

# Hanya rebuild satu service (contoh: frontend)
docker-compose build --no-cache frontend && docker-compose up -d

# Lihat log semua service
docker-compose logs -f

# Lihat log service tertentu
docker-compose logs -f backend

# Hentikan semua service
docker-compose down
```

Setelah berhasil, akses:
- 🌐 **Frontend:** http://localhost:3000
- 🔧 **Admin:** http://localhost:5000
- ⚙️ **Backend API:** http://localhost:4000

---

## 🔑 Konfigurasi Environment Variables

### `frontend/.env`
```env
# Database (Neon Cloud PostgreSQL)
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (dari Google Cloud Console)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### `backend/.env`
```env
# Database (Neon Cloud PostgreSQL)
DATABASE_URL="postgresql://..."

# JWT Secret (harus sama dengan NEXTAUTH_SECRET di frontend)
JWT_SECRET="your-secret-key"
```

> ⚠️ Jangan pernah commit file `.env` ke repository. Sudah terdaftar di `.gitignore`.

---

## 🔐 Setup Google OAuth

1. Buka [Google Cloud Console](https://console.cloud.google.com)
2. Buat project baru atau pilih project yang ada
3. Navigasi ke **APIs & Services** → **Credentials**
4. Klik **Create Credentials** → **OAuth Client ID**
5. Application type: **Web application**
6. Tambahkan **Authorized redirect URIs**:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
7. Copy **Client ID** dan **Client Secret** ke `frontend/.env`

---

## 🗄️ Database (Neon Cloud)

Project ini menggunakan **Neon** sebagai PostgreSQL cloud provider (serverless, gratis untuk development).

```bash
# Push schema terbaru ke database
cd backend && bunx prisma db push

# Lihat/edit data via Prisma Studio
cd backend && bunx prisma studio
```

---

## 📦 Docker Services

| Service | Image | Port | Keterangan |
|---|---|---|---|
| `frontend` | Node 24 Alpine | 3000 | Next.js standalone build |
| `backend` | Bun 1 Alpine | 4000 | Elysia.js API server |
| `admin` | Nginx Alpine | 5000 | Static SPA via Nginx |

Semua service terhubung melalui Docker network `electrobyte-net` sehingga dapat berkomunikasi menggunakan nama service (contoh: `http://backend:4000`).
