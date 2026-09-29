"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/features/auth/lib/session";
import { logAuditEvent } from "@/lib/audit";
import { checkRateLimit } from "@/lib/rate-limit";
import type { ActionResult } from "@/lib/action-result";
import {
  aboutContentSchema as aboutSchema,
  heroContentSchema as heroSchema,
  outreachContentSchema as outreachSchema,
} from "./schemas";
import type { AboutContent, HeroContent, OutreachContent } from "./types";

export async function updateHeroContent(
  _prev: ActionResult<void>,
  formData: FormData,
): Promise<ActionResult<void>> {
  const session = await requireAdmin();

  const rateLimit = await checkRateLimit(`content_update:${session.userId}`, 30, 60 * 1000);
  if (!rateLimit.allowed) {
    return { ok: false, message: "Too many updates. Please wait a moment before saving again." };
  }

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

  const content: HeroContent = {
    badge: parsed.data.badge,
    title: parsed.data.title,
    titleHighlight: parsed.data.titleHighlight,
    description: parsed.data.description,
    images: parsed.data.imagesJson,
    imageCaption: parsed.data.imageCaption,
    imageSubcaption: parsed.data.imageSubcaption,
  };

  await db.siteContent.upsert({
    where: { key: "hero" },
    update: { value: JSON.stringify(content) },
    create: { key: "hero", value: JSON.stringify(content) },
  });

  logAuditEvent({
    action: "CONTENT_UPDATE",
    actor: { userId: session.userId, email: session.email },
    details: { section: "hero", imageCount: parsed.data.imagesJson.length },
  });

  revalidatePath("/");
  revalidatePath("/admin/content");

  return { ok: true, message: "Hero section content updated successfully!" };
}

export async function updateAboutContent(
  _prev: ActionResult<void>,
  formData: FormData,
): Promise<ActionResult<void>> {
  const session = await requireAdmin();

  const rateLimit = await checkRateLimit(`content_update:${session.userId}`, 30, 60 * 1000);
  if (!rateLimit.allowed) {
    return { ok: false, message: "Too many updates. Please wait a moment before saving again." };
  }

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

  const content: AboutContent = {
    eyebrow: parsed.data.eyebrow,
    title: parsed.data.title,
    paragraph1: parsed.data.paragraph1,
    paragraph2: parsed.data.paragraph2,
    images: parsed.data.imagesJson,
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

  logAuditEvent({
    action: "CONTENT_UPDATE",
    actor: { userId: session.userId, email: session.email },
    details: { section: "about", imageCount: parsed.data.imagesJson.length },
  });

  revalidatePath("/");
  revalidatePath("/admin/content");

  return { ok: true, message: "About Us content updated successfully!" };
}

export async function updateOutreachContent(
  _prev: ActionResult<void>,
  formData: FormData,
): Promise<ActionResult<void>> {
  const session = await requireAdmin();

  const rateLimit = await checkRateLimit(`content_update:${session.userId}`, 30, 60 * 1000);
  if (!rateLimit.allowed) {
    return { ok: false, message: "Too many updates. Please wait a moment before saving again." };
  }

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

  const content: OutreachContent = {
    eyebrow: parsed.data.eyebrow,
    title: parsed.data.title,
    description: parsed.data.description,
    images: parsed.data.imagesJson,
    imageTag: parsed.data.imageTag,
    imageCaption: parsed.data.imageCaption,
    sponsorButtonText: parsed.data.sponsorButtonText,
  };

  await db.siteContent.upsert({
    where: { key: "outreach" },
    update: { value: JSON.stringify(content) },
    create: { key: "outreach", value: JSON.stringify(content) },
  });

  logAuditEvent({
    action: "CONTENT_UPDATE",
    actor: { userId: session.userId, email: session.email },
    details: { section: "outreach", imageCount: parsed.data.imagesJson.length },
  });

  revalidatePath("/");
  revalidatePath("/admin/content");

  return { ok: true, message: "Outreach Journey content updated successfully!" };
}
