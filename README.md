# ⚡ ElectroByte — Next-Gen Electronics & IT Hardware

ElectroByte adalah platform e-commerce modern, cepat, dan responsif yang dirancang khusus untuk penjualan perangkat keras IT dan elektronik premium seperti PC Gaming, komponen komputer, laptop, dan aksesori.

Proyek ini dibangun dengan arsitektur **Microservices** modern menggunakan Monorepo yang memisahkan *Storefront* (Frontend pelanggan), *Admin Panel* (Dashboard pengelola), dan serangkaian *Microservices* mandiri — semuanya dapat dijalankan sekaligus menggunakan **Docker Compose** atau script lokal.

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
| Prisma 7 | ORM terbaru dengan `@prisma/adapter-pg` |

### 2. 🔧 Admin Panel — Port 5000
Dashboard SPA terpisah untuk pengelola toko, dilindungi JWT.

| Teknologi | Keterangan |
|---|---|
| React + Vite | Framework SPA yang ringan dan cepat |
| Tailwind CSS v4 | Utility-first styling |
| Lucide React | Icon library |
| Axios | HTTP client dengan interceptor JWT otomatis |

### 3. ⚙️ Backend Microservices (Port 4001 - 4005)
Layanan API terpisah berkinerja tinggi menggunakan Bun runtime.

| Layanan | Port | Keterangan |
|---|---|---|
| Auth Service | 4001 | Menangani JWT, OAuth, dan profil pengguna |
| Product Service | 4002 | Manajemen katalog produk dan kategori |
| Cart Service | 4003 | Manajemen keranjang belanja pengguna |
| Order Service | 4004 | Checkout, transaksi, dan histori pesanan |
| Admin Service | 4005 | API khusus untuk Admin Panel |

**Teknologi Utama Microservices:**
- **Elysia.js**: Web framework di atas Bun runtime
- **Prisma 7**: Shared ORM dengan adapter `pg` via runtime pool
- **PostgreSQL (Neon Cloud)**: Database cloud serverless
- **MinIO**: S3-compatible object storage (Port 9000/9001)

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
- **Upload Gambar** — Sinkronisasi langsung ke MinIO Object Storage

---

## 🗂️ Struktur Proyek

```
electrobyte/
├── frontend/          # Next.js 15 Storefront (Port 3000)
├── admin/             # React + Vite Admin Panel (Port 5000)
├── services/          # Microservices Elysia.js + Bun
│   ├── auth-service/  # Port 4001
│   ├── product-service/# Port 4002
│   ├── cart-service/  # Port 4003
│   ├── order-service/ # Port 4004
│   ├── admin-service/ # Port 4005
│   └── shared/        # Shared code (MinIO, dll)
├── prisma/
│   ├── schema.prisma  # Database schema (Shared antar semua service)
│   ├── prisma.config.ts # Prisma 7 configuration file
│   └── seed.ts        # Database seeder
├── docker-compose.yml # Orkestrasi container Docker
└── start-dev.sh       # Script praktis untuk development lokal
```

---

## 🛠️ Cara Menjalankan

### Opsi A: Development Lokal (Rekomendasi untuk coding)

Pastikan sudah menginstall **Bun**, **Node.js**, dan Docker (hanya untuk MinIO).

```bash
# 1. Jalankan semua backend service & database dependencies
./start-dev.sh

# 2. Frontend (Terminal Baru)
cd frontend
npm install
npm run dev

# 3. Admin Panel (Terminal Baru)
cd admin
bun install
bun run dev
```
> *Catatan: `start-dev.sh` otomatis menyalakan Docker container MinIO dan me-run semua Microservices Bun.*

### Opsi B: Docker Compose (Untuk production / deployment)

Pastikan sudah menginstall **Docker**.

```bash
# Matikan service lokal (bila ada yang berjalan) agar port tidak bertabrakan

# Build semua service dan jalankan
docker-compose up -d --build

# Lihat log semua service
docker-compose logs -f

# Hentikan semua service
docker-compose down
```

Setelah berhasil, akses:
- 🌐 **Frontend:** http://localhost:3000
- 🔧 **Admin:** http://localhost:5000
- 🗄️ **MinIO Console:** http://localhost:9001 (User: `electrobyte`, Pass: `electrobyte_secret`)

---

## 🔑 Konfigurasi Environment Variables

Banyak service akan membutuhkan file `.env`. Untuk microservices gunakan `./backend/.env` (atau file `.env` root yang di-share), dan `./frontend/.env`.

### `.env` (Global/Backend)
```env
# Database (Neon Cloud PostgreSQL)
DATABASE_URL="postgresql://..."

# JWT Secret (harus sama dengan NEXTAUTH_SECRET di frontend)
JWT_SECRET="your-secret-key"

# MinIO Config
MINIO_ENDPOINT="localhost"
MINIO_PORT="9000"
MINIO_ACCESS_KEY="electrobyte"
MINIO_SECRET_KEY="electrobyte_secret"
```

### `frontend/.env`
```env
# Database (Neon Cloud PostgreSQL)
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

> ⚠️ Jangan pernah commit file `.env` ke repository.

---

## 🗄️ Database (Neon Cloud) & Prisma 7

Project ini menggunakan **Prisma 7** dengan `@prisma/adapter-pg`. URL koneksi dikelola saat *runtime*, bukan statis di `schema.prisma`.

```bash
# Push schema terbaru ke database
bunx prisma db push

# Generate client baru (bila ada perubahan schema)
bunx prisma generate

# Seed database dengan data awal
bun run prisma/seed.ts
```

---

## 📦 Docker Services

| Service | Image | Port | Keterangan |
|---|---|---|---|
| `frontend` | Node 24 Alpine | 3000 | Next.js standalone build |
| `admin` | Nginx Alpine | 5000 | Static SPA via Nginx |
| `auth-service` | Bun 1 Alpine | 4001 | Elysia.js |
| `product-service` | Bun 1 Alpine | 4002 | Elysia.js |
| `cart-service` | Bun 1 Alpine | 4003 | Elysia.js |
| `order-service` | Bun 1 Alpine | 4004 | Elysia.js |
| `admin-service` | Bun 1 Alpine | 4005 | Elysia.js |
| `minio` | MinIO | 9000/9001 | Object Storage |

Semua service terhubung melalui Docker network `electrobyte-net`. Frontend dapat mengakses backend via `http://<service-name>:<port>` di sisi server-side.
