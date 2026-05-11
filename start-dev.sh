#!/bin/bash

echo "🚀 Memulai ElectroByte dalam Mode Development..."

# ─── MinIO (Object Storage) ────────────────────────────────────────────────
echo "🗄️  Starting MinIO (Object Storage)..."
if ! docker ps --format '{{.Names}}' | grep -q "^electrobyte-minio$"; then
  docker run -d \
    --name electrobyte-minio \
    -p 9000:9000 \
    -p 9001:9001 \
    -e MINIO_ROOT_USER=electrobyte \
    -e MINIO_ROOT_PASSWORD=electrobyte_secret \
    -v electrobyte_minio_data:/data \
    minio/minio server /data --console-address ":9001" \
    > /dev/null 2>&1
  echo "   MinIO started. Console: http://localhost:9001"
  sleep 2
else
  echo "   MinIO already running."
fi

# ─── Backend Environment ───────────────────────────────────────────────────
# Build env string from backend/.env (excluding comments & empty lines)
BACKEND_ENV=$(grep -v '^#' backend/.env | grep -v '^\s*$' | xargs)

echo "🟢 Starting Auth Service (4001)..."
(cd services/auth-service && env $BACKEND_ENV bun run dev) &
AUTH_PID=$!

echo "🟢 Starting Product Service (4002)..."
(cd services/product-service && env $BACKEND_ENV bun run dev) &
PRODUCT_PID=$!

echo "🟢 Starting Cart Service (4003)..."
(cd services/cart-service && env $BACKEND_ENV PRODUCT_SERVICE_URL=http://localhost:4002 bun run dev) &
CART_PID=$!

echo "🟢 Starting Order Service (4004)..."
(cd services/order-service && env $BACKEND_ENV PRODUCT_SERVICE_URL=http://localhost:4002 CART_SERVICE_URL=http://localhost:4003 bun run dev) &
ORDER_PID=$!

echo "🟢 Starting Admin Service (4005)..."
(cd services/admin-service && env $BACKEND_ENV bun run dev) &
ADMIN_PID=$!

echo "🔵 Starting Frontend (3000)..."
(cd frontend && \
  AUTH_SERVICE_URL=http://localhost:4001 \
  PRODUCT_SERVICE_URL=http://localhost:4002 \
  CART_SERVICE_URL=http://localhost:4003 \
  ORDER_SERVICE_URL=http://localhost:4004 \
  npm run dev) &
FRONTEND_PID=$!

echo ""
echo "✅ Semua service berhasil dijalankan secara paralel!"
echo "📍 Frontend:      http://localhost:3000"
echo "🗄️  MinIO Console: http://localhost:9001  (user: electrobyte / electrobyte_secret)"
echo "Tekan Ctrl+C untuk menghentikan semua service."
echo ""

# Trap SIGINT (Ctrl+C) to kill all spawned background processes
trap "echo '🛑 Menghentikan semua service...'; kill $AUTH_PID $PRODUCT_PID $CART_PID $ORDER_PID $ADMIN_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM

# Tunggu sampai semua background process selesai (atau sampai Ctrl+C ditekan)
wait
