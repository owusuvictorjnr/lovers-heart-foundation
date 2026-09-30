"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/features/auth/lib/session";
import { db } from "@/lib/db";
import type { ActionResult } from "@/lib/action-result";
import { destroyImage } from "@/features/media/lib/cloudinary";
import { galleryMetaSchema, newGalleryImageSchema, type NewGalleryImage } from "./schemas";

function refresh() {
  revalidatePath("/", "layout");
  revalidatePath("/", "page");
  revalidatePath("/admin/gallery");
}

export async function saveGalleryImage(input: NewGalleryImage): Promise<ActionResult> {
  await requireAdmin();
  const parsed = newGalleryImageSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid image" };
  await db.galleryImage.create({ data: parsed.data });
  refresh();
  return { ok: true, message: "Photo added" };
}

export async function updateGalleryImage(id: string, input: { caption: string; year: number }): Promise<ActionResult> {
  await requireAdmin();
  const parsed = galleryMetaSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid details" };
  await db.galleryImage.update({ where: { id }, data: parsed.data });
  refresh();
  return { ok: true, message: "Photo updated" };
}

export async function deleteGalleryImage(id: string): Promise<ActionResult> {
  await requireAdmin();
  const image = await db.galleryImage.delete({ where: { id } });
  try {
    await destroyImage(image.publicId);
  } catch (error) {
    console.error("Cloudinary delete failed (record removed anyway)", error);
  }
  refresh();
  return { ok: true, message: "Photo deleted" };
}
