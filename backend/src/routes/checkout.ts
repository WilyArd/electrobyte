import { Elysia, t } from "elysia";
import { prisma } from "../db";
import { authMiddleware, requireAuth } from "../middleware/auth";

export const checkoutRoutes = new Elysia({ prefix: "/api/checkout" })
  .use(authMiddleware)

  // POST /api/checkout — Process checkout
  .post("/", async ({ user, body, set }) => {
    try {
      requireAuth(user);
    } catch {
      set.status = 401;
      return { error: "Please sign in to checkout" };
    }

    const { shippingName, shippingEmail, shippingAddress, shippingCity, shippingZip } = body;

    // Get cart items
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: user.id },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      set.status = 400;
      return { error: "Your cart is empty" };
    }

    // Verify stock and calculate total
    let total = 0;
    for (const item of cartItems) {
      if (item.quantity > item.product.stock) {
        set.status = 400;
        return {
          error: `"${item.product.name}" only has ${item.product.stock} in stock`,
        };
      }
      total += item.product.price * item.quantity;
    }

    // Create order in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          userId: user.id,
          total,
          status: "PENDING",
          shippingName,
          shippingEmail,
          shippingAddress,
          shippingCity,
          shippingZip,
          items: {
            create: cartItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price,
            })),
          },
        },
      });

      // Decrement stock
      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // Clear cart
      await tx.cartItem.deleteMany({
        where: { userId: user.id },
      });

      return newOrder;
    });

    return { success: true, orderId: order.id };
  }, {
    body: t.Object({
      shippingName: t.String({ minLength: 2 }),
      shippingEmail: t.String({ format: "email" }),
      shippingAddress: t.String({ minLength: 5 }),
      shippingCity: t.String({ minLength: 2 }),
      shippingZip: t.String({ minLength: 3 }),
    }),
  });
