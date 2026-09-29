import { z } from "zod";
import { ghanaRegions } from "@/config/site";

export const homeSchema = z.object({
  name: z.string().trim().min(2, "Enter the home's name").max(120),
  region: z.enum(ghanaRegions, { error: "Choose a region" }),
  description: z.string().trim().min(5, "Describe what was donated").max(400),
  imageUrl: z
    .string()
    .refine((u) => {
      if (!u || !u.trim()) return true;
      const trimmed = u.trim();
      if (trimmed.startsWith("/") && !trimmed.startsWith("//") && !trimmed.includes(":") && !trimmed.includes("\\")) {
        return /^\/[a-zA-Z0-9_.-]+(?:\/[a-zA-Z0-9_.-]+)*$/.test(trimmed);
      }
      try {
        const parsed = new URL(trimmed);
        return (
          parsed.protocol === "https:" &&
          (parsed.hostname === "res.cloudinary.com" || parsed.hostname.endsWith(".cloudinary.com"))
        );
      } catch {
        return false;
      }
    }, "Only approved Cloudinary image URLs or local site images are allowed")
    .optional()
    .or(z.literal(""))
    .transform((v) => v || null),
  sortOrder: z.coerce.number().int().default(0),
  published: z.preprocess((v) => v === "on" || v === true, z.boolean()),
});
