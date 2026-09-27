import { z } from "zod";

const currentYear = new Date().getFullYear();

export const galleryMetaSchema = z.object({
  caption: z.string().trim().min(2, "Add a short caption").max(160),
  year: z.coerce.number().int().min(2000).max(currentYear + 1),
});

export const newGalleryImageSchema = galleryMetaSchema.extend({
  url: z.url().refine((u) => u.startsWith("https://res.cloudinary.com/"), "Invalid image URL"),
  publicId: z.string().min(1),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});
export type NewGalleryImage = z.infer<typeof newGalleryImageSchema>;
