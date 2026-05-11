import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";
import { prisma } from "./db";
import { authMiddleware, requireAuth, requireAdmin } from "./middleware/auth";
import type { Category } from "@prisma/client";
import { initMinioBuckets, uploadFile, deleteFile, generateObjectName, BUCKETS } from "../../shared/minio";

const port = process.env.PORT || 4002;

// Initialize MinIO buckets on startup
initMinioBuckets();

const app = new Elysia()
  .use(cors({ origin: true, credentials: true }))
  .onError(({ code, error, set }) => {
    if (error.message === "UNAUTHORIZED") { set.status = 401; return { error: "Authentication required" }; }
    if (error.message === "FORBIDDEN") { set.status = 403; return { error: "Access denied" }; }
    console.error(`[${code}]`, error);
    set.status = 500;
    return { error: "Internal server error" };
  })
  .get("/api/health", () => ({ status: "ok", service: "product-service", timestamp: new Date().toISOString() }))
  .use(authMiddleware)

  // ─── Products ───────────────────────────────────────────────────────────────

  // GET /api/products
  .get("/api/products", async ({ query }) => {
    const { q, category, sort, page = "1", limit = "12" } = query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    const where: Record<string, unknown> = {};

    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ];
    }
    if (category && category !== "ALL") {
      where.category = category as Category;
    }

    let orderBy: Record<string, string> = { createdAt: "desc" };
    switch (sort) {
      case "price-asc": orderBy = { price: "asc" }; break;
      case "price-desc": orderBy = { price: "desc" }; break;
      case "name": orderBy = { name: "asc" }; break;
      case "rating": orderBy = { rating: "desc" }; break;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({ where, orderBy, skip, take: limitNum }),
      prisma.product.count({ where }),
    ]);

    return { products, total, pages: Math.ceil(total / limitNum), currentPage: pageNum };
  }, {
    query: t.Object({
      q: t.Optional(t.String()),
      category: t.Optional(t.String()),
      sort: t.Optional(t.String()),
      page: t.Optional(t.String()),
      limit: t.Optional(t.String()),
    }),
  })

  // GET /api/products/featured
  .get("/api/products/featured", async () => {
    return prisma.product.findMany({
      where: { featured: true },
      orderBy: { rating: "desc" },
      take: 8,
    });
  })

  // GET /api/products/:id
  .get("/api/products/:id", async ({ params, set }) => {
    const product = await prisma.product.findUnique({ where: { id: params.id } });
    if (!product) { set.status = 404; return { error: "Product not found" }; }
    return product;
  })

  // GET /api/products/:id/related
  .get("/api/products/:id/related", async ({ params, set }) => {
    const product = await prisma.product.findUnique({ where: { id: params.id } });
    if (!product) { set.status = 404; return { error: "Product not found" }; }
    return prisma.product.findMany({
      where: { category: product.category, id: { not: params.id } },
      take: 4,
    });
  })

  // ─── Wishlist ────────────────────────────────────────────────────────────────

  // GET /api/products/wishlist — Get user's wishlist
  .get("/api/products/wishlist", async ({ user, set }) => {
    if (!user) { set.status = 401; return { error: "Not authenticated" }; }
    return prisma.wishlist.findMany({
      where: { userId: user.id },
      include: {
        product: {
          select: { id: true, name: true, price: true, image: true, category: true, stock: true, rating: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  })

  // POST /api/products/wishlist — Add to wishlist
  .post("/api/products/wishlist", async ({ user, body, set }) => {
    if (!user) { set.status = 401; return { error: "Not authenticated" }; }
    const { productId } = body;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) { set.status = 404; return { error: "Product not found" }; }

    const existing = await prisma.wishlist.findUnique({
      where: { userId_productId: { userId: user.id, productId } },
    });
    if (existing) { set.status = 409; return { error: "Already in wishlist" }; }

    await prisma.wishlist.create({ data: { userId: user.id, productId } });
    return { success: true };
  }, {
    body: t.Object({ productId: t.String() }),
  })

  // DELETE /api/products/wishlist/:productId — Remove from wishlist
  .delete("/api/products/wishlist/:productId", async ({ user, params, set }) => {
    if (!user) { set.status = 401; return { error: "Not authenticated" }; }
    await prisma.wishlist.deleteMany({
      where: { userId: user.id, productId: params.productId },
    });
    return { success: true };
  })

  // ─── Reviews ─────────────────────────────────────────────────────────────────

  // GET /api/products/:id/reviews
  .get("/api/products/:id/reviews", async ({ params }) => {
    return prisma.review.findMany({
      where: { productId: params.id },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  })

  // POST /api/products/:id/reviews — Add review
  .post("/api/products/:id/reviews", async ({ user, params, body, set }) => {
    if (!user) { set.status = 401; return { error: "Not authenticated" }; }

    const product = await prisma.product.findUnique({ where: { id: params.id } });
    if (!product) { set.status = 404; return { error: "Product not found" }; }

    const existing = await prisma.review.findUnique({
      where: { userId_productId: { userId: user.id, productId: params.id } },
    });
    if (existing) { set.status = 409; return { error: "You have already reviewed this product" }; }

    const review = await prisma.review.create({
      data: { userId: user.id, productId: params.id, rating: body.rating, comment: body.comment },
      include: { user: { select: { id: true, name: true, image: true } } },
    });

    // Recalculate product rating
    const avg = await prisma.review.aggregate({
      where: { productId: params.id },
      _avg: { rating: true },
      _count: true,
    });
    await prisma.product.update({
      where: { id: params.id },
      data: {
        rating: Math.round((avg._avg.rating || 0) * 10) / 10,
        reviewCount: avg._count,
      },
    });

    return { success: true, review };
  }, {
    body: t.Object({
      rating: t.Number({ minimum: 1, maximum: 5 }),
      comment: t.String({ minLength: 5 }),
    }),
  })

  // PUT /api/products/:id/reviews/:reviewId — Update review
  .put("/api/products/:id/reviews/:reviewId", async ({ user, params, body, set }) => {
    if (!user) { set.status = 401; return { error: "Not authenticated" }; }

    const review = await prisma.review.findUnique({ where: { id: params.reviewId } });
    if (!review) { set.status = 404; return { error: "Review not found" }; }
    if (review.userId !== user.id) { set.status = 403; return { error: "Not authorized" }; }

    const updatedReview = await prisma.review.update({
      where: { id: params.reviewId },
      data: { rating: body.rating, comment: body.comment },
      include: { user: { select: { id: true, name: true, image: true } } },
    });

    // Recalculate product rating
    const avg = await prisma.review.aggregate({
      where: { productId: params.id },
      _avg: { rating: true },
      _count: true,
    });
    await prisma.product.update({
      where: { id: params.id },
      data: {
        rating: Math.round((avg._avg.rating || 0) * 10) / 10,
        reviewCount: avg._count,
      },
    });

    return { success: true, review: updatedReview };
  }, {
    body: t.Object({
      rating: t.Number({ minimum: 1, maximum: 5 }),
      comment: t.String({ minLength: 5 }),
    }),
  })

  // DELETE /api/products/:id/reviews/:reviewId — Delete own review
  .delete("/api/products/:id/reviews/:reviewId", async ({ user, params, set }) => {
    if (!user) { set.status = 401; return { error: "Not authenticated" }; }
    const review = await prisma.review.findUnique({ where: { id: params.reviewId } });
    if (!review) { set.status = 404; return { error: "Review not found" }; }
    if (review.userId !== user.id && user.role !== "ADMIN") {
      set.status = 403; return { error: "Not authorized" };
    }
    await prisma.review.delete({ where: { id: params.reviewId } });

    // Recalculate rating
    const avg = await prisma.review.aggregate({
      where: { productId: params.id },
      _avg: { rating: true },
      _count: true,
    });
    await prisma.product.update({
      where: { id: params.id },
      data: {
        rating: Math.round((avg._avg.rating || 0) * 10) / 10,
        reviewCount: avg._count,
      },
    });

    return { success: true };
  })

  // ─── Admin Product Management ─────────────────────────────────────────────────

  // GET /api/admin/products
  .get("/api/admin/products", async ({ user, set }) => {
    try { requireAdmin(user); } catch (e: any) {
      set.status = e.message === "FORBIDDEN" ? 403 : 401;
      return { error: "Admin access required" };
    }
    return prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { orderItems: true } } },
    });
  })

  // POST /api/admin/products
  .post("/api/admin/products", async ({ user, body, set }) => {
    try { requireAdmin(user); } catch (e: any) {
      set.status = e.message === "FORBIDDEN" ? 403 : 401;
      return { error: "Admin access required" };
    }
    const product = await prisma.product.create({
      data: {
        name: body.name, description: body.description, price: body.price,
        image: body.image, category: body.category as Category,
        stock: body.stock, featured: body.featured || false,
      },
    });
    return { success: true, product };
  }, {
    body: t.Object({
      name: t.String({ minLength: 2 }),
      description: t.String({ minLength: 10 }),
      price: t.Number({ minimum: 0 }),
      image: t.String(),
      category: t.String(),
      stock: t.Number({ minimum: 0 }),
      featured: t.Optional(t.Boolean()),
    }),
  })

  // PUT /api/admin/products/:id
  .put("/api/admin/products/:id", async ({ user, params, body, set }) => {
    try { requireAdmin(user); } catch (e: any) {
      set.status = e.message === "FORBIDDEN" ? 403 : 401;
      return { error: "Admin access required" };
    }
    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        name: body.name, description: body.description, price: body.price,
        image: body.image, category: body.category as Category,
        stock: body.stock, featured: body.featured || false,
      },
    });
    return { success: true, product };
  }, {
    body: t.Object({
      name: t.String({ minLength: 2 }),
      description: t.String({ minLength: 10 }),
      price: t.Number({ minimum: 0 }),
      image: t.String(),
      category: t.String(),
      stock: t.Number({ minimum: 0 }),
      featured: t.Optional(t.Boolean()),
    }),
  })

  // DELETE /api/admin/products/:id
  .delete("/api/admin/products/:id", async ({ user, params, set }) => {
    try { requireAdmin(user); } catch (e: any) {
      set.status = e.message === "FORBIDDEN" ? 403 : 401;
      return { error: "Admin access required" };
    }
    try {
      await prisma.$transaction(async (tx) => {
        await tx.cartItem.deleteMany({ where: { productId: params.id } });
        await tx.orderItem.deleteMany({ where: { productId: params.id } });
        await tx.product.delete({ where: { id: params.id } });
      });
    } catch (e: any) {
      set.status = 400;
      return { error: "Failed to delete product: " + (e.message || "Unknown error") };
    }
    return { success: true };
  })

  // Internal: PATCH /api/products/:id/stock — Called by order-service
  .patch("/api/products/:id/stock", async ({ params, body, set }) => {
    const { decrement } = body;
    const product = await prisma.product.findUnique({ where: { id: params.id } });
    if (!product) { set.status = 404; return { error: "Product not found" }; }
    if (product.stock < decrement) { set.status = 400; return { error: "Insufficient stock" }; }
    await prisma.product.update({
      where: { id: params.id },
      data: { stock: { decrement } },
    });
    return { success: true };
  }, {
    body: t.Object({ decrement: t.Number({ minimum: 1 }) }),
  })

  // ─── Upload Endpoints (MinIO) ─────────────────────────────────────────────

  // POST /api/products/upload-image — Upload product image (Admin only)
  .post("/api/products/upload-image", async ({ user, body, set }) => {
    if (!user || user.role !== "ADMIN") {
      set.status = 403;
      return { error: "Admin access required" };
    }
    const file = (body as any).image as File;
    if (!file) { set.status = 400; return { error: "No image file provided" }; }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      set.status = 400;
      return { error: "Invalid file type. Allowed: JPEG, PNG, WebP, GIF" };
    }
    if (file.size > 5 * 1024 * 1024) {
      set.status = 400;
      return { error: "File too large. Maximum size: 5MB" };
    }

    const objectName = generateObjectName("products", file.name);
    const buffer = await file.arrayBuffer();
    const url = await uploadFile(BUCKETS.products, objectName, new Uint8Array(buffer), file.type);

    return { url, objectName };
  })

  // POST /api/reviews/:id/images — Upload review photo
  .post("/api/reviews/:id/images", async ({ user, params, body, set }) => {
    if (!user) { set.status = 401; return { error: "Not authenticated" }; }

    const review = await prisma.review.findUnique({ where: { id: params.id } });
    if (!review) { set.status = 404; return { error: "Review not found" }; }
    if (review.userId !== user.id) { set.status = 403; return { error: "Not your review" }; }

    const file = (body as any).image as File;
    if (!file) { set.status = 400; return { error: "No image file provided" }; }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      set.status = 400;
      return { error: "Invalid file type. Allowed: JPEG, PNG, WebP" };
    }
    if (file.size > 5 * 1024 * 1024) {
      set.status = 400;
      return { error: "File too large. Maximum size: 5MB" };
    }

    const objectName = generateObjectName(`reviews/${params.id}`, file.name);
    const buffer = await file.arrayBuffer();
    const url = await uploadFile(BUCKETS.reviews, objectName, new Uint8Array(buffer), file.type);

    // Store image URL in review (append to existing)
    const currentImages = (review as any).images as string[] || [];
    await prisma.review.update({
      where: { id: params.id },
      data: { images: [...currentImages, url] } as any,
    });

    return { url, objectName };
  })

  .listen(port);

console.log(`📦 Product Service running at ${app.server?.hostname}:${app.server?.port}`);
