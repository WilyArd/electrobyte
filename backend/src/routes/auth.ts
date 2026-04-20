import { Elysia, t } from "elysia";
import { prisma } from "../db";
import { hash, compare } from "bcryptjs";

export const authRoutes = new Elysia({ prefix: "/api/auth" })

  // POST /api/auth/register — Register new user
  .post("/register", async ({ body, set }) => {
    const { name, email, password } = body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      set.status = 409;
      return { error: "An account with this email already exists" };
    }

    // Hash password and create user
    const hashedPassword = await hash(password, 12);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "USER",
      },
    });

    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }, {
    body: t.Object({
      name: t.String({ minLength: 2 }),
      email: t.String({ format: "email" }),
      password: t.String({ minLength: 6 }),
    }),
  })

  // POST /api/auth/verify — Verify credentials (used by NextAuth)
  .post("/verify", async ({ body, set }) => {
    const { email, password } = body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      set.status = 401;
      return { error: "Invalid credentials" };
    }

    const isPasswordValid = await compare(password, user.password);

    if (!isPasswordValid) {
      set.status = 401;
      return { error: "Invalid credentials" };
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      role: user.role,
    };
  }, {
    body: t.Object({
      email: t.String({ format: "email" }),
      password: t.String({ minLength: 1 }),
    }),
  })

  // POST /api/auth/oauth-user — Create/get user for OAuth providers (used by NextAuth callback)
  .post("/oauth-user", async ({ body }) => {
    const { email, name, image } = body;

    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          image,
          role: "USER",
        },
      });
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      role: user.role,
    };
  }, {
    body: t.Object({
      email: t.String({ format: "email" }),
      name: t.Optional(t.Nullable(t.String())),
      image: t.Optional(t.Nullable(t.String())),
    }),
  })

  // GET /api/auth/user/:email — Get user by email (used by NextAuth JWT callback)
  .get("/user/:email", async ({ params, set }) => {
    const user = await prisma.user.findUnique({
      where: { email: params.email },
    });

    if (!user) {
      set.status = 404;
      return { error: "User not found" };
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      role: user.role,
    };
  });
