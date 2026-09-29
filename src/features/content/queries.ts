import "server-only";
import { db } from "@/lib/db";
import type { AboutContent, HeroContent, OutreachContent } from "./types";

export const defaultHeroContent: HeroContent = {
  badge: "Grassroots Ghanaian NGO · In-Person Annual Outreach",
  title: "Every child in Ghana deserves to know they are",
  titleHighlight: "cherished & loved.",
  description:
    "Lovers Heart Foundation delivers wholesome food, school supplies, clothing, and warm companionship directly to children's homes across Ghana. We don't just send donations from afar—we show up, sit with the children, and share the day as family.",
  images: ["/images/hero-children.jpg"],
  imageCaption: "Joy & Dignity",
  imageSubcaption: "Touching lives with every visit across Ghanaian regions",
};

export const defaultAboutContent: AboutContent = {
  eyebrow: "Who We Are & Why We Serve",
  title: "Faith in action, uplifting one child's home at a time.",
  paragraph1:
    "Lovers Heart Foundation was founded on a simple, enduring conviction: every child living in an orphanage or shelter across Ghana deserves dignity, nutritious meals, good learning materials, and the warmth of a loving community.",
  paragraph2:
    "Throughout the year, we gather contributions from kind individuals, families, churches, and partner organisations. When outreach day arrives, our volunteer convoy delivers tailored provisions and spends hours laughing, playing games, and encouraging the children.",
  images: ["/images/about-team.jpg"],
  imageBadge: "Hands-on Service in Ghana",
  imageCaption:
    "Volunteers organizing textbooks, bags of rice, and hygiene essentials for our partner homes.",
  quote:
    "When you sit at the table and look a child in the eye, they don't just receive a meal—they receive the assurance that they are never forgotten.",
  quoteAuthor: "Lovers Heart Foundation Team",
  values: [
    {
      title: "Compassionate Presence",
      text: "We believe love is personal. We don't just mail supplies—our team spends the entire day singing, eating, and fellowshipping with the children.",
    },
    {
      title: "100% Direct Giving",
      text: "Every single cedi, bag of rice, and carton of books goes directly to the children's homes. We maintain zero corporate administrative overhead.",
    },
    {
      title: "Grassroots Community",
      text: "Powered by students, young professionals, churches, and local businesses in Ghana united by faith and a pure heart to uplift vulnerable kids.",
    },
  ],
};

export const defaultOutreachContent: OutreachContent = {
  eyebrow: "Our Journey of Giving",
  title: "A continuous legacy of showing up.",
  description:
    "Every year has its story. From mobilizing volunteers across universities and churches to driving loaded buses to remote communities, here is how love has traveled across Ghana.",
  images: ["/images/outreach-delivery.jpg"],
  imageTag: "Direct Handover:",
  imageCaption: "Every bag, book, and meal is placed directly in children's hands.",
  sponsorButtonText: "Sponsor Annual Outreach",
};

export async function getHeroContent(): Promise<HeroContent> {
  try {
    const row = await db.siteContent.findUnique({ where: { key: "hero" } });
    if (!row) return defaultHeroContent;
    const parsed = JSON.parse(row.value) as Partial<HeroContent>;
    return {
      ...defaultHeroContent,
      ...parsed,
      images: parsed.images && parsed.images.length > 0 ? parsed.images : defaultHeroContent.images,
    };
  } catch {
    return defaultHeroContent;
  }
}

export async function getAboutContent(): Promise<AboutContent> {
  try {
    const row = await db.siteContent.findUnique({ where: { key: "about" } });
    if (!row) return defaultAboutContent;
    const parsed = JSON.parse(row.value) as Partial<AboutContent>;
    return {
      ...defaultAboutContent,
      ...parsed,
      images: parsed.images && parsed.images.length > 0 ? parsed.images : defaultAboutContent.images,
      values: parsed.values && parsed.values.length > 0 ? parsed.values : defaultAboutContent.values,
    };
  } catch {
    return defaultAboutContent;
  }
}

export async function getOutreachContent(): Promise<OutreachContent> {
  try {
    const row = await db.siteContent.findUnique({ where: { key: "outreach" } });
    if (!row) return defaultOutreachContent;
    const parsed = JSON.parse(row.value) as Partial<OutreachContent>;
    return {
      ...defaultOutreachContent,
      ...parsed,
      images: parsed.images && parsed.images.length > 0 ? parsed.images : defaultOutreachContent.images,
    };
  } catch {
    return defaultOutreachContent;
  }
}
