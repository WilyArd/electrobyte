import { auth } from "@/lib/auth";

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || "http://localhost:4001";
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || "http://localhost:4002";
const CART_SERVICE_URL = process.env.CART_SERVICE_URL || "http://localhost:4003";
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || "http://localhost:4004";

export function getServiceUrl(path: string): string {
  if (path.startsWith("/api/auth") || path.startsWith("/api/user/profile") || path.startsWith("/api/user/avatar")) return AUTH_SERVICE_URL;
  if (path.startsWith("/api/products") || path.startsWith("/api/wishlist") || path.startsWith("/api/reviews")) return PRODUCT_SERVICE_URL;
  if (path.startsWith("/api/cart")) return CART_SERVICE_URL;
  if (path.startsWith("/api/orders") || path.startsWith("/api/user/orders")) return ORDER_SERVICE_URL;
  // Fallback
  return AUTH_SERVICE_URL;
}

/**
 * Fetch helper that automatically adds the JWT token from NextAuth session.
 * Used by server actions to call the Elysia backend.
 */
export async function apiFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const session = await auth();
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  // Attach JWT token if user is authenticated
  if (session?.accessToken) {
    headers.set("Authorization", `Bearer ${session.accessToken}`);
  }

  const baseUrl = getServiceUrl(path);
  const url = `${baseUrl}${path}`;
  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * Typed API fetch that parses JSON response.
 */
export async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await apiFetch(path, options);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `API error: ${res.status}`);
  }

  return data as T;
}
