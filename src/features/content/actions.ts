"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/features/auth/lib/session";
import type { ActionResult } from "@/lib/action-result";
import type { AboutContent, HeroContent, OutreachContent } from "./types";

const heroSchema = z.object({
  badge: z.string().min(1, "Badge text is required").max(120),
  title: z.string().min(1, "Title is required").max(200),
  titleHighlight: z.string().min(1, "Title highlight is required").max(100),
  description: z.string().min(1, "Description is required").max(1000),
  imagesJson: z.string(),
  imageCaption: z.string().max(100).default(""),
  imageSubcaption: z.string().max(200).default(""),
});

const aboutSchema = z.object({
  eyebrow: z.string().min(1, "Eyebrow is required").max(100),
  title: z.string().min(1, "Title is required").max(200),
  paragraph1: z.string().min(1, "Paragraph 1 is required").max(1000),
  paragraph2: z.string().min(1, "Paragraph 2 is required").max(1000),
  imagesJson: z.string(),
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

const outreachSchema = z.object({
  eyebrow: z.string().min(1, "Eyebrow is required").max(100),
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().min(1, "Description is required").max(1000),
  imagesJson: z.string(),
  imageTag: z.string().max(100).default("Direct Handover:"),
  imageCaption: z.string().max(250).default(""),
  sponsorButtonText: z.string().max(100).default("Sponsor Outreach"),
});

export async function updateHeroContent(
  _prev: ActionResult<void>,
  formData: FormData,
): Promise<ActionResult<void>> {
  await requireAdmin();

  const parsed = heroSchema.safeParse({
    badge: formData.get("badge"),
    title: formData.get("title"),
    titleHighlight: formData.get("titleHighlight"),
    description: formData.get("description"),
    imagesJson: formData.get("imagesJson") || "[]",
    imageCaption: formData.get("imageCaption") || "",
    imageSubcaption: formData.get("imageSubcaption") || "",
  });

  if (!parsed.success) {
    const errorMsg = Object.values(parsed.error.flatten().fieldErrors)
      .flat()
      .join(". ");
    return { ok: false, message: errorMsg || "Invalid input." };
  }

  let images: string[] = [];
  try {
    images = JSON.parse(parsed.data.imagesJson);
  } catch {
    images = [];
  }

  const content: HeroContent = {
    badge: parsed.data.badge,
    title: parsed.data.title,
    titleHighlight: parsed.data.titleHighlight,
    description: parsed.data.description,
    images,
    imageCaption: parsed.data.imageCaption,
    imageSubcaption: parsed.data.imageSubcaption,
  };

  await db.siteContent.upsert({
    where: { key: "hero" },
    update: { value: JSON.stringify(content) },
    create: { key: "hero", value: JSON.stringify(content) },
  });

  revalidatePath("/");
  revalidatePath("/admin/content");

  return { ok: true, message: "Hero section content updated successfully!" };
}

export async function updateAboutContent(
  _prev: ActionResult<void>,
  formData: FormData,
): Promise<ActionResult<void>> {
  await requireAdmin();

  const parsed = aboutSchema.safeParse({
    eyebrow: formData.get("eyebrow"),
    title: formData.get("title"),
    paragraph1: formData.get("paragraph1"),
    paragraph2: formData.get("paragraph2"),
    imagesJson: formData.get("imagesJson") || "[]",
    imageBadge: formData.get("imageBadge") || "",
    imageCaption: formData.get("imageCaption") || "",
    quote: formData.get("quote"),
    quoteAuthor: formData.get("quoteAuthor"),
    value1Title: formData.get("value1Title"),
    value1Text: formData.get("value1Text"),
    value2Title: formData.get("value2Title"),
    value2Text: formData.get("value2Text"),
    value3Title: formData.get("value3Title"),
    value3Text: formData.get("value3Text"),
  });

  if (!parsed.success) {
    const errorMsg = Object.values(parsed.error.flatten().fieldErrors)
      .flat()
      .join(". ");
    return { ok: false, message: errorMsg || "Invalid input." };
  }

  let images: string[] = [];
  try {
    images = JSON.parse(parsed.data.imagesJson);
  } catch {
    images = [];
  }

  const content: AboutContent = {
    eyebrow: parsed.data.eyebrow,
    title: parsed.data.title,
    paragraph1: parsed.data.paragraph1,
    paragraph2: parsed.data.paragraph2,
    images,
    imageBadge: parsed.data.imageBadge,
    imageCaption: parsed.data.imageCaption,
    quote: parsed.data.quote,
    quoteAuthor: parsed.data.quoteAuthor,
    values: [
      { title: parsed.data.value1Title, text: parsed.data.value1Text },
      { title: parsed.data.value2Title, text: parsed.data.value2Text },
      { title: parsed.data.value3Title, text: parsed.data.value3Text },
    ],
  };

  await db.siteContent.upsert({
    where: { key: "about" },
    update: { value: JSON.stringify(content) },
    create: { key: "about", value: JSON.stringify(content) },
  });

  revalidatePath("/");
  revalidatePath("/admin/content");

  return { ok: true, message: "About Us content updated successfully!" };
}

export async function updateOutreachContent(
  _prev: ActionResult<void>,
  formData: FormData,
): Promise<ActionResult<void>> {
  await requireAdmin();

  const parsed = outreachSchema.safeParse({
    eyebrow: formData.get("eyebrow"),
    title: formData.get("title"),
    description: formData.get("description"),
    imagesJson: formData.get("imagesJson") || "[]",
    imageTag: formData.get("imageTag") || "",
    imageCaption: formData.get("imageCaption") || "",
    sponsorButtonText: formData.get("sponsorButtonText") || "Sponsor Outreach",
  });

  if (!parsed.success) {
    const errorMsg = Object.values(parsed.error.flatten().fieldErrors)
      .flat()
      .join(". ");
    return { ok: false, message: errorMsg || "Invalid input." };
  }

  let images: string[] = [];
  try {
    images = JSON.parse(parsed.data.imagesJson);
  } catch {
    images = [];
  }

  const content: OutreachContent = {
    eyebrow: parsed.data.eyebrow,
    title: parsed.data.title,
    description: parsed.data.description,
    images,
    imageTag: parsed.data.imageTag,
    imageCaption: parsed.data.imageCaption,
    sponsorButtonText: parsed.data.sponsorButtonText,
  };

  await db.siteContent.upsert({
    where: { key: "outreach" },
    update: { value: JSON.stringify(content) },
    create: { key: "outreach", value: JSON.stringify(content) },
  });

  revalidatePath("/");
  revalidatePath("/admin/content");

  return { ok: true, message: "Outreach Journey content updated successfully!" };
}
