# ⚡ ElectroByte

> Next-Gen Electronics & IT Hardware E-Commerce Platform

A comprehensive, scalable e-commerce web application built with **Next.js 15**, **Tailwind CSS v3**, **PostgreSQL**, **Prisma ORM**, **Docker**, and **Nginx**.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwindcss)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)

## 🚀 Features

- **User Authentication** — Email/Password + Google OAuth via NextAuth.js v5
- **Shopping Cart** — Add/remove items, adjust quantities, persistent cart
- **Search & Filtering** — Full-text search, category filters, multi-sort options
- **Checkout System** — Simulated checkout with order creation and stock management
- **Admin Dashboard** — Protected CRUD operations for products, order overview
- **Light/Dark Mode** — Theme toggle with dark mode as default
- **Responsive Design** — Flawless layout across mobile, tablet, and desktop
- **Load Balanced** — 3x Next.js instances behind Nginx reverse proxy

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend & Backend | Next.js 15 (App Router) |
| Styling | Tailwind CSS v3 |
| Database | PostgreSQL 16 |
| ORM | Prisma |
| Authentication | NextAuth.js v5 (Auth.js) |
| Infrastructure | Docker, Docker Compose, Nginx |

## ⚡ Quick Start (Development)

### Prerequisites
- Node.js 20+
- PostgreSQL (or Docker)

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment
```bash
cp .env.example .env
# Edit .env with your database URL and secrets
```

### 3. Set Up Database
```bash
# Start PostgreSQL (via Docker or local)
docker run -d --name electrobyte-db -p 5432:5432 \
  -e POSTGRES_USER=electrobyte \
  -e POSTGRES_PASSWORD=electrobyte_pass \
  -e POSTGRES_DB=electrobyte \
  postgres:16-alpine

# Run migrations
npx prisma migrate dev --name init

# Seed data
npx prisma db seed
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Default Credentials
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@electrobyte.com | admin123 |
| User | user@electrobyte.com | user123 |

## 🐳 Docker Production Deployment

### Build & Run (Load Balanced)
```bash
# Build all images
docker compose build

# Start the full stack (PostgreSQL + 3x Next.js + Nginx)
docker compose up -d

# Run database migrations
docker compose exec app1 npx prisma migrate deploy

# Seed the database
docker compose exec app1 npx prisma db seed

# Check health
curl http://localhost/api/health
```

### Architecture
```
                    ┌─────────┐
    Port 80  ───▶  │  Nginx  │
                    │   LB    │
                    └────┬────┘
                         │
              ┌──────────┼──────────┐
              │          │          │
         ┌────▼──┐  ┌───▼───┐  ┌──▼────┐
         │ App 1 │  │ App 2 │  │ App 3 │
         │ :3000 │  │ :3000 │  │ :3000 │
         └───┬───┘  └───┬───┘  └───┬───┘
             │          │          │
             └──────────┼──────────┘
                   ┌────▼────┐
                   │ Postgres │
                   │  :5432   │
                   └──────────┘
```

### Useful Commands
```bash
# Scale instances
docker compose up -d --scale app1=1 --scale app2=1 --scale app3=1

# View logs
docker compose logs -f nginx
docker compose logs -f app1

# Stop everything
docker compose down

# Stop and remove volumes
docker compose down -v
```

## 📁 Project Structure

```
electrobyte/
├── prisma/                    # Database schema & seed
├── src/
│   ├── app/                   # Next.js App Router pages
│   │   ├── admin/             # Admin dashboard (protected)
│   │   ├── auth/              # Login & Register pages
│   │   ├── cart/              # Shopping cart
│   │   ├── checkout/          # Checkout flow
│   │   ├── products/          # Product listing & detail
│   │   └── api/               # API routes
│   ├── actions/               # Server Actions
│   ├── components/            # React components
│   ├── lib/                   # Utilities & config
│   └── types/                 # TypeScript types
├── nginx/                     # Nginx configuration
├── Dockerfile                 # Multi-stage production build
├── docker-compose.yml         # Full stack orchestration
└── tailwind.config.ts         # Custom design system
```

## 📄 License

MIT
