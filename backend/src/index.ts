import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { productRoutes } from "./routes/products";
import { cartRoutes } from "./routes/cart";
import { checkoutRoutes } from "./routes/checkout";
import { authRoutes } from "./routes/auth";
import { adminRoutes } from "./routes/admin";
import { userRoutes } from "./routes/user";

const port = process.env.PORT || 4000;

const app = new Elysia()
  // CORS — allow frontend and admin panel to call backend
  .use(
    cors({
      origin: ["http://localhost:3000", "http://localhost:5000"],
      credentials: true,
    })
  )
  // Global error handler
  .onError(({ code, error, set }) => {
    if (error.message === "UNAUTHORIZED") {
      set.status = 401;
      return { error: "Authentication required" };
    }
    if (error.message === "FORBIDDEN") {
      set.status = 403;
      return { error: "Access denied" };
    }
    console.error(`[${code}]`, error);
    set.status = 500;
    return { error: "Internal server error" };
  })
  // Health check
  .get("/api/health", () => ({
    status: "ok",
    service: "electrobyte-backend",
    timestamp: new Date().toISOString(),
  }))
  // Register all route groups
  .use(productRoutes)
  .use(cartRoutes)
  .use(checkoutRoutes)
  .use(authRoutes)
  .use(userRoutes)
  .use(adminRoutes)
  .listen(port);

console.log(
  `🦊 Elysia backend is running at ${app.server?.hostname}:${app.server?.port}`
);
