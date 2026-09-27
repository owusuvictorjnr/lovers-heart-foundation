import "server-only";
import crypto from "node:crypto";
import { requireEnv } from "@/lib/env";

export const MEDIA_FOLDERS = { gallery: "god-is-alive/gallery", homes: "god-is-alive/homes" } as const;
export type MediaFolder = keyof typeof MEDIA_FOLDERS;

/** Cloudinary signature: sha1 of sorted "k=v&k=v" params + api secret. */
function sign(params: Record<string, string | number>) {
  const toSign = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return crypto.createHash("sha1").update(toSign + requireEnv("CLOUDINARY_API_SECRET")).digest("hex");
}

/** Lets the admin's browser upload straight to Cloudinary (no big files through our server). */
export function createUploadSignature(folder: MediaFolder) {
  const timestamp = Math.round(Date.now() / 1000);
  const params = { folder: MEDIA_FOLDERS[folder], timestamp };
  return {
    ...params,
    signature: sign(params),
    apiKey: requireEnv("CLOUDINARY_API_KEY"),
    cloudName: requireEnv("CLOUDINARY_CLOUD_NAME"),
  };
}

export async function destroyImage(publicId: string) {
  const cloud = requireEnv("CLOUDINARY_CLOUD_NAME");
  const timestamp = Math.round(Date.now() / 1000);
  const body = new URLSearchParams({
    public_id: publicId,
    timestamp: String(timestamp),
    api_key: requireEnv("CLOUDINARY_API_KEY"),
    signature: sign({ public_id: publicId, timestamp }),
  });
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/destroy`, { method: "POST", body });
  if (!res.ok) throw new Error(`Cloudinary destroy failed: ${res.status}`);
}
