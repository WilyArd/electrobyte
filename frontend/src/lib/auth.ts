import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import * as jose from "jose";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || "dev-secret-key-electrobyte-2026";

// Derive signing key using HKDF — matches backend auth middleware exactly
async function getSigningKey(): Promise<Uint8Array> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(NEXTAUTH_SECRET), "HKDF", false, ["deriveBits"]);
  const derived = await crypto.subtle.deriveBits(
    { name: "HKDF", hash: "SHA-256", salt: new Uint8Array(0), info: enc.encode("NextAuth.js Generated Signing Key") },
    key,
    256
  );
  return new Uint8Array(derived);
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Call backend to verify credentials
        const res = await fetch(`${BACKEND_URL}/api/auth/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
        });

        if (!res.ok) {
          return null;
        }

        const user = await res.json();
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // For OAuth providers, create/update user in database via backend
      if (account?.provider === "google") {
        await fetch(`${BACKEND_URL}/api/auth/oauth-user`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: user.email,
            name: user.name,
            image: user.image,
          }),
        });
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        // Fetch full user info from backend
        const res = await fetch(
          `${BACKEND_URL}/api/auth/user/${encodeURIComponent(user.email!)}`,
        );
        if (res.ok) {
          const dbUser = await res.json();
          token.id = dbUser.id;
          token.role = dbUser.role;
        }
        // Generate a backend-compatible JWT at login time (runs once)
        try {
          const signingKey = await getSigningKey();
          token.backendToken = await new jose.SignJWT({
            id: token.id,
            email: token.email,
            name: token.name,
            role: token.role,
            sub: token.sub,
          })
            .setProtectedHeader({ alg: "HS256" })
            .setIssuedAt()
            .setExpirationTime("24h")
            .sign(signingKey);
        } catch (e) {
          console.error("Failed to create backend token:", e);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        // Pass through the pre-generated backend token
        session.accessToken = token.backendToken as string | undefined;
      }
      return session;
    },
  },
});

