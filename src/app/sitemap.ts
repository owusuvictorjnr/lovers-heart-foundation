import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://loversheartfoundation.org";
  const now = new Date();

  return [
    { url: baseUrl, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${baseUrl}/#about`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/#homes`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/#gallery`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/#outreach`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/#donate`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/#volunteer`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/#contact`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
  ];
}

