import "server-only";
import { db } from "@/lib/db";

export function listGalleryImages() {
  return db.galleryImage.findMany({ orderBy: [{ year: "desc" }, { createdAt: "desc" }] });
}
