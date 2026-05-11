import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";
import { prisma } from "./db";
import { authMiddleware, requireAuth, requireAdmin } from "./middleware/auth";

const port = process.env.PORT || 4004;
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || "http://product-service:4002";
const CART_SERVICE_URL = process.env.CART_SERVICE_URL || "http://cart-service:4003";

const app = new Elysia()
  .use(cors({ origin: true, credentials: true }))
  .onError(({ code, error, set }) => {
    if (error.message === "UNAUTHORIZED") { set.status = 401; return { error: "Authentication required" }; }
    if (error.message === "FORBIDDEN") { set.status = 403; return { error: "Access denied" }; }
    console.error(`[${code}]`, error);
    set.status = 500;
    return { error: "Internal server error" };
  })
  .get("/api/health", () => ({ status: "ok", service: "order-service", timestamp: new Date().toISOString() }))
  .use(authMiddleware)

  // ─── Coupon Validation ────────────────────────────────────────────────────────

  // POST /api/orders/coupons/validate — Validate a coupon code
  .post("/api/orders/coupons/validate", async ({ user, body, set }) => {
    if (!user) { set.status = 401; return { error: "Not authenticated" }; }
    const { code, subtotal } = body;

    const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
    if (!coupon || !coupon.isActive) {
      set.status = 404;
      return { error: "Invalid or expired coupon code" };
    }
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      set.status = 400;
      return { error: "This coupon has expired" };
    }
    if (coupon.usedCount >= coupon.maxUses) {
      set.status = 400;
      return { error: "This coupon has reached its usage limit" };
    }
    if (subtotal < coupon.minPurchase) {
      set.status = 400;
      return { error: `Minimum purchase of Rp${coupon.minPurchase.toLocaleString()} required` };
    }

    const discount = coupon.discountType === "PERCENTAGE"
      ? (subtotal * coupon.value) / 100
      : coupon.value;

    return {
      valid: true,
      couponId: coupon.id,
      code: coupon.code,
      discountType: coupon.discountType,
      value: coupon.value,
      discount: Math.min(discount, subtotal), // can't discount more than total
    };
  }, {
    body: t.Object({
      code: t.String(),
      subtotal: t.Number({ minimum: 0 }),
    }),
  })

  // ─── Checkout ─────────────────────────────────────────────────────────────────

  // POST /api/orders/checkout — Process checkout
  .post("/api/orders/checkout", async ({ user, body, set }) => {
    if (!user) { set.status = 401; return { error: "Please sign in to checkout" }; }

    const { shippingName, shippingEmail, shippingAddress, shippingCity, shippingZip, couponCode } = body;

    // 1. Fetch cart items from cart-service
    const cartRes = await fetch(`${CART_SERVICE_URL}/api/cart/items/${user.id}`);
    if (!cartRes.ok) { set.status = 500; return { error: "Failed to fetch cart" }; }
    const cartItems = await cartRes.json() as Array<{
      productId: string; quantity: number;
      product: { id: string; name: string; price: number; stock: number };
    }>;

    if (cartItems.length === 0) { set.status = 400; return { error: "Your cart is empty" }; }

    // 2. Verify stock and calculate subtotal
    let subtotal = 0;
    for (const item of cartItems) {
      if (item.quantity > item.product.stock) {
        set.status = 400;
        return { error: `"${item.product.name}" only has ${item.product.stock} in stock` };
      }
      subtotal += item.product.price * item.quantity;
    }

    // 3. Apply coupon if provided
    let discount = 0;
    let couponId: string | undefined;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode.toUpperCase() } });
      if (coupon && coupon.isActive && coupon.usedCount < coupon.maxUses) {
        discount = coupon.discountType === "PERCENTAGE"
          ? (subtotal * coupon.value) / 100
          : coupon.value;
        discount = Math.min(discount, subtotal);
        couponId = coupon.id;
      }
    }

    const total = subtotal - discount;

    // 4. Create order in transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId: user.id,
          total,
          discount,
          status: "PENDING",
          couponId,
          shippingName, shippingEmail, shippingAddress, shippingCity, shippingZip,
          items: {
            create: cartItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price,
            })),
          },
        },
      });

      // Increment coupon usage
      if (couponId) {
        await tx.coupon.update({ where: { id: couponId }, data: { usedCount: { increment: 1 } } });
      }

      return newOrder;
    });

    // 5. Decrement stock via product-service (fire-and-forget with error handling)
    for (const item of cartItems) {
      await fetch(`${PRODUCT_SERVICE_URL}/api/products/${item.productId}/stock`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decrement: item.quantity }),
      });
    }

    // 6. Clear cart via cart-service
    await fetch(`${CART_SERVICE_URL}/api/cart/clear/${user.id}`, { method: "DELETE" });

    return { success: true, orderId: order.id };
  }, {
    body: t.Object({
      shippingName: t.String({ minLength: 2 }),
      shippingEmail: t.String({ format: "email" }),
      shippingAddress: t.String({ minLength: 5 }),
      shippingCity: t.String({ minLength: 2 }),
      shippingZip: t.String({ minLength: 3 }),
      couponCode: t.Optional(t.String()),
    }),
  })

  // ─── Order History ────────────────────────────────────────────────────────────

  // GET /api/orders — Get user's order history
  .get("/api/orders", async ({ user, set }) => {
    if (!user) { set.status = 401; return { error: "Not authenticated" }; }
    return prisma.order.findMany({
      where: { userId: user.id },
      include: {
        items: {
          include: { product: { select: { id: true, name: true, image: true } } },
        },
        coupon: { select: { code: true, discountType: true, value: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  })

  // GET /api/user/orders — Alias for frontend profile page
  .get("/api/user/orders", async ({ user, set }) => {
    if (!user) { set.status = 401; return { error: "Not authenticated" }; }
    return prisma.order.findMany({
      where: { userId: user.id },
      include: {
        items: {
          include: { product: { select: { id: true, name: true, image: true } } },
        },
        coupon: { select: { code: true, discountType: true, value: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  })

  // GET /api/orders/:id — Get single order
  .get("/api/orders/:id", async ({ user, params, set }) => {
    if (!user) { set.status = 401; return { error: "Not authenticated" }; }
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        items: {
          include: { product: { select: { id: true, name: true, image: true, category: true } } },
        },
        coupon: { select: { code: true, discountType: true, value: true } },
      },
    });
    if (!order) { set.status = 404; return { error: "Order not found" }; }
    if (order.userId !== user.id && user.role !== "ADMIN") {
      set.status = 403; return { error: "Not authorized" };
    }
    return order;
  })

  // ─── Admin Orders & Coupons ───────────────────────────────────────────────────

  // GET /api/admin/orders
  .get("/api/admin/orders", async ({ user, set }) => {
    try { requireAdmin(user); } catch (e: any) {
      set.status = e.message === "FORBIDDEN" ? 403 : 401;
      return { error: "Admin access required" };
    }
    return prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        items: { include: { product: { select: { name: true } } } },
        coupon: { select: { code: true } },
      },
    });
  })

  // PATCH /api/admin/orders/:id/status
  .patch("/api/admin/orders/:id/status", async ({ user, params, body, set }) => {
    try { requireAdmin(user); } catch (e: any) {
      set.status = e.message === "FORBIDDEN" ? 403 : 401;
      return { error: "Admin access required" };
    }
    const order = await prisma.order.update({
      where: { id: params.id },
      data: { status: body.status },
    });
    return { success: true, order };
  }, {
    body: t.Object({
      status: t.Enum({ PENDING: "PENDING", PROCESSING: "PROCESSING", SHIPPED: "SHIPPED", DELIVERED: "DELIVERED", CANCELLED: "CANCELLED" }),
    }),
  })

  // GET /api/admin/coupons
  .get("/api/admin/coupons", async ({ user, set }) => {
    try { requireAdmin(user); } catch (e: any) {
      set.status = e.message === "FORBIDDEN" ? 403 : 401;
      return { error: "Admin access required" };
    }
    return prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  })

  // POST /api/admin/coupons — Create coupon
  .post("/api/admin/coupons", async ({ user, body, set }) => {
    try { requireAdmin(user); } catch (e: any) {
      set.status = e.message === "FORBIDDEN" ? 403 : 401;
      return { error: "Admin access required" };
    }
    const coupon = await prisma.coupon.create({
      data: {
        code: body.code.toUpperCase(),
        discountType: body.discountType,
        value: body.value,
        minPurchase: body.minPurchase || 0,
        maxUses: body.maxUses || 100,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
        isActive: true,
      },
    });
    return { success: true, coupon };
  }, {
    body: t.Object({
      code: t.String({ minLength: 3 }),
      discountType: t.Enum({ PERCENTAGE: "PERCENTAGE", FIXED: "FIXED" }),
      value: t.Number({ minimum: 0 }),
      minPurchase: t.Optional(t.Number({ minimum: 0 })),
      maxUses: t.Optional(t.Number({ minimum: 1 })),
      expiresAt: t.Optional(t.String()),
    }),
  })

  // PATCH /api/admin/coupons/:id — Toggle active / update coupon
  .patch("/api/admin/coupons/:id", async ({ user, params, body, set }) => {
    try { requireAdmin(user); } catch (e: any) {
      set.status = e.message === "FORBIDDEN" ? 403 : 401;
      return { error: "Admin access required" };
    }
    const coupon = await prisma.coupon.update({
      where: { id: params.id },
      data: { isActive: body.isActive },
    });
    return { success: true, coupon };
  }, {
    body: t.Object({ isActive: t.Boolean() }),
  })

  // DELETE /api/admin/coupons/:id
  .delete("/api/admin/coupons/:id", async ({ user, params, set }) => {
    try { requireAdmin(user); } catch (e: any) {
      set.status = e.message === "FORBIDDEN" ? 403 : 401;
      return { error: "Admin access required" };
    }
    await prisma.coupon.delete({ where: { id: params.id } });
    return { success: true };
  })

  .listen(port);

console.log(`📋 Order Service running at ${app.server?.hostname}:${app.server?.port}`);
