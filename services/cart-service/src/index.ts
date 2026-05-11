import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";
import { prisma } from "./db";
import { authMiddleware, requireAuth } from "./middleware/auth";

const port = process.env.PORT || 4003;
// URL of product-service for stock validation
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || "http://product-service:4002";

const app = new Elysia()
  .use(cors({ origin: true, credentials: true }))
  .onError(({ code, error, set }) => {
    if (error.message === "UNAUTHORIZED") { set.status = 401; return { error: "Authentication required" }; }
    console.error(`[${code}]`, error);
    set.status = 500;
    return { error: "Internal server error" };
  })
  .get("/api/health", () => ({ status: "ok", service: "cart-service", timestamp: new Date().toISOString() }))
  .use(authMiddleware)

  // GET /api/cart
  .get("/api/cart", async ({ user, set }) => {
    if (!user) { set.status = 401; return { error: "Not authenticated" }; }
    return prisma.cartItem.findMany({
      where: { userId: user.id },
      include: {
        product: {
          select: { id: true, name: true, price: true, image: true, stock: true, category: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  })

  // GET /api/cart/count
  .get("/api/cart/count", async ({ user }) => {
    if (!user) return { count: 0 };
    const result = await prisma.cartItem.aggregate({
      where: { userId: user.id },
      _sum: { quantity: true },
    });
    return { count: result._sum.quantity || 0 };
  })

  // GET /api/cart/items — Internal: used by order-service
  .get("/api/cart/items/:userId", async ({ params }) => {
    return prisma.cartItem.findMany({
      where: { userId: params.userId },
      include: {
        product: { select: { id: true, name: true, price: true, stock: true } },
      },
    });
  })

  // POST /api/cart — Add to cart
  .post("/api/cart", async ({ user, body, set }) => {
    if (!user) { set.status = 401; return { error: "Please sign in to add items to cart" }; }
    const { productId, quantity = 1 } = body;

    // Validate stock via product-service REST call
    const res = await fetch(`${PRODUCT_SERVICE_URL}/api/products/${productId}`);
    if (!res.ok) { set.status = 404; return { error: "Product not found" }; }
    const product = await res.json() as { stock: number; name: string };

    if (product.stock < quantity) {
      set.status = 400;
      return { error: "Insufficient stock" };
    }

    const existingItem = await prisma.cartItem.findUnique({
      where: { userId_productId: { userId: user.id, productId } },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > product.stock) {
        set.status = 400;
        return { error: "Cannot add more than available stock" };
      }
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      await prisma.cartItem.create({ data: { userId: user.id, productId, quantity } });
    }

    return { success: true };
  }, {
    body: t.Object({
      productId: t.String(),
      quantity: t.Optional(t.Number()),
    }),
  })

  // PATCH /api/cart/:id — Update quantity
  .patch("/api/cart/:id", async ({ user, params, body, set }) => {
    if (!user) { set.status = 401; return { error: "Not authenticated" }; }
    const { quantity } = body;

    if (quantity < 1) {
      await prisma.cartItem.delete({ where: { id: params.id, userId: user.id } });
      return { success: true };
    }

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: params.id, userId: user.id },
      include: { product: true },
    });
    if (!cartItem) { set.status = 404; return { error: "Cart item not found" }; }
    if (quantity > cartItem.product.stock) {
      set.status = 400;
      return { error: "Quantity exceeds available stock" };
    }

    await prisma.cartItem.update({ where: { id: params.id }, data: { quantity } });
    return { success: true };
  }, {
    body: t.Object({ quantity: t.Number() }),
  })

  // DELETE /api/cart/:id — Remove item
  .delete("/api/cart/:id", async ({ user, params, set }) => {
    if (!user) { set.status = 401; return { error: "Not authenticated" }; }
    await prisma.cartItem.delete({ where: { id: params.id, userId: user.id } });
    return { success: true };
  })

  // DELETE /api/cart — Clear cart
  .delete("/api/cart", async ({ user, set }) => {
    if (!user) { set.status = 401; return { error: "Not authenticated" }; }
    await prisma.cartItem.deleteMany({ where: { userId: user.id } });
    return { success: true };
  })

  // Internal: DELETE /api/cart/clear/:userId — Called by order-service after checkout
  .delete("/api/cart/clear/:userId", async ({ params }) => {
    await prisma.cartItem.deleteMany({ where: { userId: params.userId } });
    return { success: true };
  })

  .listen(port);

console.log(`🛒 Cart Service running at ${app.server?.hostname}:${app.server?.port}`);
