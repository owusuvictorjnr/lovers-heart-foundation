import { z } from "zod";

function isAllowedImageUrl(url: unknown): boolean {
  if (typeof url !== "string") return false;
  const trimmed = url.trim();
  if (!trimmed) return false;

  // Safe local public static assets (e.g. /images/hero-children.jpg)
  if (trimmed.startsWith("/") && !trimmed.startsWith("//") && !trimmed.includes(":") && !trimmed.includes("\\")) {
    return /^\/[a-zA-Z0-9_.-]+(?:\/[a-zA-Z0-9_.-]+)*$/.test(trimmed);
  }

  // Approved Cloudinary HTTPS URLs
  try {
    const parsed = new URL(trimmed);
    return (
      parsed.protocol === "https:" &&
      (parsed.hostname === "res.cloudinary.com" || parsed.hostname.endsWith(".cloudinary.com"))
    );
  } catch {
    return false;
  }
}

export const imagesJsonSchema = z
  .string()
  .transform((value, ctx) => {
    try {
      return JSON.parse(value);
    } catch {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid image list",
      });
      return z.NEVER;
    }
  })
  .pipe(
    z
      .array(z.string())
      .max(8, "A maximum of 8 images is allowed")
      .refine(
        (urls) => urls.every(isAllowedImageUrl),
        "Only approved Cloudinary image URLs or local site images are allowed",
      ),
  );

export const heroContentSchema = z.object({
  badge: z.string().min(1, "Badge text is required").max(120),
  title: z.string().min(1, "Title is required").max(200),
  titleHighlight: z.string().min(1, "Title highlight is required").max(100),
  description: z.string().min(1, "Description is required").max(1000),
  imagesJson: imagesJsonSchema,
  imageCaption: z.string().max(100).default(""),
  imageSubcaption: z.string().max(200).default(""),
});

export const aboutContentSchema = z.object({
  eyebrow: z.string().min(1, "Eyebrow is required").max(100),
  title: z.string().min(1, "Title is required").max(200),
  paragraph1: z.string().min(1, "Paragraph 1 is required").max(1000),
  paragraph2: z.string().min(1, "Paragraph 2 is required").max(1000),
  imagesJson: imagesJsonSchema,
  imageBadge: z.string().max(100).default(""),
  imageCaption: z.string().max(250).default(""),
  quote: z.string().min(1, "Quote is required").max(500),
  quoteAuthor: z.string().min(1, "Quote author is required").max(100),
  value1Title: z.string().min(1).max(100),
  value1Text: z.string().min(1).max(300),
  value2Title: z.string().min(1).max(100),
  value2Text: z.string().min(1).max(300),
  value3Title: z.string().min(1).max(100),
  value3Text: z.string().min(1).max(300),
});

export const outreachContentSchema = z.object({
  eyebrow: z.string().min(1, "Eyebrow is required").max(100),
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().min(1, "Description is required").max(1000),
  imagesJson: imagesJsonSchema,
  imageTag: z.string().max(100).default("Direct Handover:"),
  imageCaption: z.string().max(250).default(""),
  sponsorButtonText: z.string().max(100).default("Sponsor Outreach"),
});
