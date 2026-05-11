import { Client } from "minio";

// ─── MinIO Client ──────────────────────────────────────────────────────────
const endpoint = process.env.MINIO_ENDPOINT || "localhost";
const port = parseInt(process.env.MINIO_PORT || "9000");
const useSSL = process.env.MINIO_USE_SSL === "true";
const accessKey = process.env.MINIO_ACCESS_KEY || "electrobyte";
const secretKey = process.env.MINIO_SECRET_KEY || "electrobyte_secret";

// Public base URL used for constructing file URLs returned to the client
export const MINIO_PUBLIC_URL =
  process.env.MINIO_PUBLIC_URL || `http://localhost:9000`;

export const minioClient = new Client({
  endPoint: endpoint,
  port,
  useSSL,
  accessKey,
  secretKey,
});

// ─── Bucket Names ──────────────────────────────────────────────────────────
export const BUCKETS = {
  products: "electrobyte-products",
  avatars: "electrobyte-avatars",
  reviews: "electrobyte-reviews",
} as const;

export type BucketName = (typeof BUCKETS)[keyof typeof BUCKETS];

// ─── Ensure bucket exists (public read) ───────────────────────────────────
async function ensureBucket(bucket: string) {
  const exists = await minioClient.bucketExists(bucket);
  if (!exists) {
    await minioClient.makeBucket(bucket, "us-east-1");
    // Set public read policy so uploaded files are accessible via URL
    const policy = JSON.stringify({
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Principal: { AWS: ["*"] },
          Action: ["s3:GetObject"],
          Resource: [`arn:aws:s3:::${bucket}/*`],
        },
      ],
    });
    await minioClient.setBucketPolicy(bucket, policy);
    console.log(`✅ MinIO bucket created: ${bucket}`);
  }
}

// Initialize all buckets on startup
export async function initMinioBuckets() {
  try {
    await Promise.all(Object.values(BUCKETS).map(ensureBucket));
    console.log("🗄️  MinIO buckets ready");
  } catch (err) {
    console.warn("⚠️  MinIO not available — file uploads will be disabled:", err);
  }
}

// ─── Upload File ───────────────────────────────────────────────────────────
export async function uploadFile(
  bucket: BucketName,
  objectName: string,
  data: Buffer | Uint8Array,
  contentType: string
): Promise<string> {
  await minioClient.putObject(bucket, objectName, Buffer.from(data), data.byteLength, {
    "Content-Type": contentType,
  });
  return `${MINIO_PUBLIC_URL}/${bucket}/${objectName}`;
}

// ─── Delete File ───────────────────────────────────────────────────────────
export async function deleteFile(bucket: BucketName, objectName: string): Promise<void> {
  try {
    await minioClient.removeObject(bucket, objectName);
  } catch {
    // Ignore errors when file doesn't exist
  }
}

// ─── Generate unique object name ───────────────────────────────────────────
export function generateObjectName(prefix: string, originalName: string): string {
  const ext = originalName.split(".").pop() || "bin";
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}/${timestamp}-${random}.${ext}`;
}
