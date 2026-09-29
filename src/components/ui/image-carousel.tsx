"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageCarouselProps {
  images: string[];
  alt: string;
  className?: string;
  aspectRatio?: string;
  autoPlayInterval?: number;
  priority?: boolean;
  sizes?: string;
  overlay?: React.ReactNode;
}

export function ImageCarousel({
  images,
  alt,
  className,
  autoPlayInterval = 5000,
  priority = false,
  sizes = "(max-width: 768px) 100vw, 50vw",
  overlay,
}: ImageCarouselProps) {
  const validImages = images.filter((img) => Boolean(img && img.trim()));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const nextSlide = useCallback(() => {
    if (validImages.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % validImages.length);
  }, [validImages.length]);

  const prevSlide = useCallback(() => {
    if (validImages.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
  }, [validImages.length]);

  useEffect(() => {
    if (validImages.length <= 1 || isHovered) return;
    const interval = setInterval(nextSlide, autoPlayInterval);
    return () => clearInterval(interval);
  }, [validImages.length, isHovered, autoPlayInterval, nextSlide]);

  if (validImages.length === 0) return null;

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={alt}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchStartX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        if (Math.abs(dx) > 40) {
          if (dx < 0) nextSlide();
          else prevSlide();
        }
        touchStartX.current = null;
      }}
      className={cn("group/carousel relative overflow-hidden", className)}
    >
      {/* Slides with smooth crossfade */}
      {validImages.map((src, idx) => (
        <div
          key={src + idx}
          className={cn(
            "absolute inset-0 size-full transition-opacity duration-1000 ease-in-out",
            idx === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none",
          )}
        >
          <Image
            src={src}
            alt={`${alt} (Photo ${idx + 1} of ${validImages.length})`}
            fill
            priority={priority && idx === 0}
            sizes={sizes}
            className="object-cover transition-transform duration-1000 group-hover/carousel:scale-105"
          />
        </div>
      ))}

      {/* Optional Overlay Content (e.g. caption, gradient) */}
      {overlay && <div className="relative z-20 size-full pointer-events-none">{overlay}</div>}

      {/* Prev / Next Controls for Multi-image Carousels */}
      {validImages.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              prevSlide();
            }}
            aria-label="Previous photo"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-30 grid size-8.5 place-items-center rounded-full bg-black/40 text-white backdrop-blur-xs opacity-0 transition-all duration-300 hover:bg-black/70 group-hover/carousel:opacity-100 active:scale-95 cursor-pointer"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              nextSlide();
            }}
            aria-label="Next photo"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-30 grid size-8.5 place-items-center rounded-full bg-black/40 text-white backdrop-blur-xs opacity-0 transition-all duration-300 hover:bg-black/70 group-hover/carousel:opacity-100 active:scale-95 cursor-pointer"
          >
            <ChevronRight className="size-5" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-3 right-3 z-30 flex items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1 backdrop-blur-xs">
            {validImages.map((_, idx) => (
              <button
                key={idx}
                type="button"
                aria-label={`Go to slide ${idx + 1}`}
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentIndex(idx);
                }}
                className={cn(
                  "size-2 rounded-full transition-all duration-300 cursor-pointer",
                  idx === currentIndex ? "w-5 bg-gold" : "bg-white/50 hover:bg-white/80",
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
