import Image from "next/image";
import { cn } from "@/lib/utils";

const fallbackPhotos = [
  "/images/hero-children.jpg",
  "/images/about-team.jpg",
  "/images/outreach-delivery.jpg",
  "/images/community-meal.jpg",
];

/** Shown where a custom photo hasn't been uploaded yet. */
export function PhotoPlaceholder({
  label,
  tone = 0,
  className,
}: {
  label?: string;
  tone?: number;
  className?: string;
}) {
  const photo = fallbackPhotos[Math.abs(tone) % fallbackPhotos.length];

  return (
    <div className={cn("relative overflow-hidden bg-sand", className)}>
      <Image
        src={photo}
        alt={label || "Lovers Heart Foundation outreach"}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover"
      />
      {label && (
        <span className="absolute bottom-3 left-3 rounded-md bg-black/60 px-2.5 py-1 text-xs text-white backdrop-blur-xs">
          {label}
        </span>
      )}
    </div>
  );
}
