import { Elysia } from "elysia";
import * as jose from "jose";

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || "dev-secret-key-electrobyte-2026";

/**
 * Derive signing and encryption keys from a secret using HKDF.
 * This matches NextAuth.js/Auth.js v5 behavior.
 * Keys are cached after first derivation for performance.
 */
let _cachedEncryptionKey: Uint8Array | null = null;
let _cachedSigningKey: Uint8Array | null = null;

async function deriveKey(secret: string | Uint8Array, info: string): Promise<Uint8Array> {
  const encSecret = typeof secret === "string" ? new TextEncoder().encode(secret) : secret;
  const key = await crypto.subtle.importKey("raw", encSecret, "HKDF", false, ["deriveBits"]);
  const derived = await crypto.subtle.deriveBits(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: new Uint8Array(0),
      info: new TextEncoder().encode(info),
    },
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

/**
 * Auth middleware that validates the JWT token from NextAuth.
 * Extracts user info and attaches it to the context.
 */
export const authMiddleware = new Elysia({ name: "auth-middleware" })
  .derive({ as: "scoped" }, async ({ request }): Promise<{ user: AuthUser | null }> => {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { user: null };
    }

    const token = authHeader.slice(7);
    try {
      // NextAuth v5 uses JWE (encrypted) tokens by default
      // First try to decode as JWE, then fall back to JWS
      let payload: Record<string, unknown>;

      try {
        // Try JWE decryption (NextAuth v5 default)
        const encryptionKey = await getDerivedEncryptionKey(NEXTAUTH_SECRET);
        const { plaintext } = await jose.compactDecrypt(token, encryptionKey);
        payload = JSON.parse(new TextDecoder().decode(plaintext));
      } catch {
        // Fall back to JWS verification
        const signingKey = await getDerivedSigningKey(NEXTAUTH_SECRET);
        const { payload: jwsPayload } = await jose.jwtVerify(token, signingKey);
        payload = jwsPayload as Record<string, unknown>;
      }

      return {
        user: {
          id: payload.id as string || payload.sub as string || "",
          email: payload.email as string || "",
          name: payload.name as string || undefined,
          role: payload.role as string || "USER",
        },
      };
    } catch (error: any) {
      // Don't log full stack trace for invalid tokens, it's normal behavior
      console.log(`[Auth] JWT validation failed: ${error.message || 'Invalid token'}`);
      return { user: null };
    }
  });

/**
 * Guard that requires authentication. Throws 401 if not authenticated.
 */
export function requireAuth(user: AuthUser | null): asserts user is AuthUser {
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
}

/**
 * Guard that requires admin role. Throws 403 if not admin.
 */
export function requireAdmin(user: AuthUser | null): asserts user is AuthUser {
  requireAuth(user);
  if (user.role !== "ADMIN") {
    throw new Error("FORBIDDEN");
  }
}
