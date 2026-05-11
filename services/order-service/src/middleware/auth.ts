import { Elysia } from "elysia";
import * as jose from "jose";

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || "dev-secret-key-electrobyte-2026";

let _cachedEncryptionKey: Uint8Array | null = null;
let _cachedSigningKey: Uint8Array | null = null;

async function deriveKey(secret: string | Uint8Array, info: string): Promise<Uint8Array> {
  const encSecret = typeof secret === "string" ? new TextEncoder().encode(secret) : secret;
  const key = await crypto.subtle.importKey("raw", encSecret, "HKDF", false, ["deriveBits"]);
  const derived = await crypto.subtle.deriveBits(
    { name: "HKDF", hash: "SHA-256", salt: new Uint8Array(0), info: new TextEncoder().encode(info) },
    key,
    256
  );
  return new Uint8Array(derived);
}

export async function getDerivedEncryptionKey(secret: string | Uint8Array): Promise<Uint8Array> {
  if (!_cachedEncryptionKey) {
    _cachedEncryptionKey = await deriveKey(secret, "NextAuth.js Generated Encryption Key");
  }
  return _cachedEncryptionKey;
}

export async function getDerivedSigningKey(secret: string | Uint8Array): Promise<Uint8Array> {
  if (!_cachedSigningKey) {
    _cachedSigningKey = await deriveKey(secret, "NextAuth.js Generated Signing Key");
  }
  return _cachedSigningKey;
}

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role: string;
}

export const authMiddleware = new Elysia({ name: "auth-middleware" })
  .derive({ as: "scoped" }, async ({ request }): Promise<{ user: AuthUser | null }> => {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { user: null };
    }

    const token = authHeader.slice(7);
    try {
      let payload: Record<string, unknown>;

      try {
        const encryptionKey = await getDerivedEncryptionKey(NEXTAUTH_SECRET);
        const { plaintext } = await jose.compactDecrypt(token, encryptionKey);
        payload = JSON.parse(new TextDecoder().decode(plaintext));
      } catch {
        const signingKey = await getDerivedSigningKey(NEXTAUTH_SECRET);
        const { payload: jwsPayload } = await jose.jwtVerify(token, signingKey);
        payload = jwsPayload as Record<string, unknown>;
      }

      return {
        user: {
          id: (payload.id as string) || (payload.sub as string) || "",
          email: (payload.email as string) || "",
          name: (payload.name as string) || undefined,
          role: (payload.role as string) || "USER",
        },
      };
    } catch (error: any) {
      console.log(`[Auth] JWT validation failed: ${error.message || "Invalid token"}`);
      return { user: null };
    }
  });

export function requireAuth(user: AuthUser | null): asserts user is AuthUser {
  if (!user) throw new Error("UNAUTHORIZED");
}

export function requireAdmin(user: AuthUser | null): asserts user is AuthUser {
  requireAuth(user);
  if (user.role !== "ADMIN") throw new Error("FORBIDDEN");
}
