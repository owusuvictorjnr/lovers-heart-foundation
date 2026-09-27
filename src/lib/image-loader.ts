/**
 * Global next/image loader (see next.config.ts).
 * Cloudinary URLs get resized/compressed on Cloudinary's CDN (free tier friendly);
 * any other URL is served as-is.
 */
export default function imageLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  if (src.includes("res.cloudinary.com") && src.includes("/upload/")) {
    return src.replace("/upload/", `/upload/c_limit,w_${width},q_${quality ?? "auto"},f_auto/`);
  }
  return src;
}
