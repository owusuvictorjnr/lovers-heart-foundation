"use server";

import { requireAdmin } from "@/features/auth/lib/session";
import { createUploadSignature, MEDIA_FOLDERS, type MediaFolder } from "./lib/cloudinary";

export async function getUploadSignature(folder: MediaFolder) {
  await requireAdmin();
  if (!(folder in MEDIA_FOLDERS)) throw new Error("Unknown folder");
  return createUploadSignature(folder);
}
