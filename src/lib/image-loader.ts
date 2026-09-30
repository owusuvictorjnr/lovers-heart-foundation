/**
 * Global next/image loader (see next.config.ts).
 * Cloudinary URLs get resized/compressed on Cloudinary's CDN (free tier friendly);
 * local or external images pass width/quality cleanly to satisfy Next.js loader expectations.
 */
export default function imageLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  if (src.includes("res.cloudinary.com") && src.includes("/upload/")) {
    return src.replace("/upload/", `/upload/c_limit,w_${width},q_${quality ?? "auto"},f_auto/`);
  }
  if (src.startsWith("/")) {
    return `${src}?w=${width}&q=${quality ?? 75}`;
  }
  return src;
}