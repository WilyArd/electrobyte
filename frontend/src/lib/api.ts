import { auth } from "@/lib/auth";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

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

  const url = `${BACKEND_URL}${path}`;
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
