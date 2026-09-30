"use server";

import { z } from "zod";
import { requireAdmin } from "@/features/auth/lib/session";
import { logAuditEvent } from "@/lib/audit";
import { checkRateLimit } from "@/lib/rate-limit";
import { createUploadSignature, MEDIA_FOLDERS, type MediaFolder } from "./lib/cloudinary";

const mediaFolderSchema = z.enum(["gallery", "homes", "outreach"] as const);

export async function getUploadSignature(folder: MediaFolder) {
  const session = await requireAdmin();

  const rateLimit = await checkRateLimit(`upload_sig:${session.userId}`, 60, 10 * 60 * 1000);
  if (!rateLimit.allowed) {
    throw new Error("Upload rate limit exceeded. Please wait before uploading more files.");
  }

  const parsed = mediaFolderSchema.safeParse(folder);
  if (!parsed.success) {
    throw new Error("Invalid or unapproved upload folder");
  }

  logAuditEvent({
    action: "UPLOAD_SIGNATURE_GENERATED",
    actor: { userId: session.userId, email: session.email },
    details: { folder: parsed.data },
  });

  return createUploadSignature(parsed.data);
}
