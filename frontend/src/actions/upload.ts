"use server";

import { auth } from "@/lib/auth";

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || "http://localhost:4001";
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || "http://localhost:4002";

// ─── Helper: build multipart form fetch with auth ──────────────────────────
async function uploadToService(
  serviceUrl: string,
  endpoint: string,
  formData: FormData
): Promise<{ url?: string; error?: string }> {
  const session = await auth();
  if (!session?.user) return { error: "Not authenticated" };

  const token = (session as any).accessToken as string | undefined;
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${serviceUrl}${endpoint}`, {
    method: "POST",
    headers,
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) return { error: data.error || "Upload failed" };
  return { url: data.url };
}

// ─── Upload product image (Admin only) ────────────────────────────────────
export async function uploadProductImage(
  formData: FormData
): Promise<{ url?: string; error?: string }> {
  return uploadToService(PRODUCT_SERVICE_URL, "/api/products/upload-image", formData);
}

// ─── Upload user avatar ────────────────────────────────────────────────────
export async function uploadAvatar(
  formData: FormData
): Promise<{ url?: string; error?: string }> {
  return uploadToService(AUTH_SERVICE_URL, "/api/user/avatar", formData);
}

// ─── Upload review image ───────────────────────────────────────────────────
export async function uploadReviewImage(
  reviewId: string,
  formData: FormData
): Promise<{ url?: string; error?: string }> {
  return uploadToService(
    PRODUCT_SERVICE_URL,
    `/api/reviews/${reviewId}/images`,
    formData
  );
}
