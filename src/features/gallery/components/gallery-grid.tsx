"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Maximize2,
  Play,
  X,
} from "lucide-react";
import { ScrollRail } from "@/components/ui/scroll-rail";
import { useSmoothScroll } from "@/components/layout/smooth-scroll-provider";
import { cn } from "@/lib/utils";

export type GalleryItem = {
  id: string;
  url: string;
  caption: string;
  year: number;
};

const INITIAL_LIMIT = 8;

function isVideoUrl(url: string) {
  return /\.(mp4|webm|mov|m4v|ogg)$/i.test(url) || url.includes("/video/upload/");
}

export function GalleryGrid({ images }: { images: GalleryItem[] }) {
  const years = useMemo(
    () => [...new Set(images.map((i) => i.year))].sort((a, b) => b - a),
    [images],
  );
  const [selectedYear, setSelectedYear] = useState<number | "all">("all");
  const [showAll, setShowAll] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const { scrollTo } = useSmoothScroll();

  const filtered = useMemo(() => {
    return selectedYear === "all"
      ? images
      : images.filter((i) => i.year === selectedYear);
  }, [images, selectedYear]);

  // Apply initial limit unless user clicks "Show More"
  const visible = useMemo(() => {
    if (showAll || filtered.length <= INITIAL_LIMIT) {
      return filtered;
    }
    return filtered.slice(0, INITIAL_LIMIT);
  }, [filtered, showAll]);

  const current = activeIndex !== null ? visible[activeIndex] : null;

  const navigate = useCallback(
    (step: number) => {
      setActiveIndex((prev) => {
        if (prev === null) return null;
        return (prev + step + visible.length) % visible.length;
      });
      setSwipeOffset(0);
    },
    [visible.length],
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (activeIndex !== null && !dialog?.open) {
      dialog?.showModal();
    }
    if (activeIndex === null && dialog?.open) {
      dialog.close();
    }
  }, [activeIndex]);

  useEffect(() => {
    if (activeIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") navigate(-1);
      if (e.key === "ArrowRight") navigate(1);
      if (e.key === "Escape") setActiveIndex(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeIndex, navigate]);

  const handleYearSelect = (
    e: React.MouseEvent<HTMLButtonElement>,
    year: number | "all",
  ) => {
    setSelectedYear(year);
    setShowAll(false);
    e.currentTarget.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  };

  const handleToggleShowAll = () => {
    setShowAll((prev) => {
      const next = !prev;
      if (!next && gridContainerRef.current) {
        scrollTo(gridContainerRef.current, { offset: -90, duration: 0.9 });
      }
      return next;
    });
  };

  return (
    <div ref={gridContainerRef} className="w-full">
      {/* Year Filter Tabs wrapped in smooth horizontal ScrollRail */}
      {years.length > 1 && (
        <div className="mb-8 max-w-2xl mx-auto">
          <ScrollRail
            showGradients
            className="justify-start sm:justify-center gap-2 py-1.5"
          >
            <button
              type="button"
              role="tab"
              aria-selected={selectedYear === "all"}
              onClick={(e) => handleYearSelect(e, "all")}
              className={cn(
                "shrink-0 rounded-full px-4.5 py-1.5 text-xs font-semibold transition-all duration-200 shadow-2xs cursor-pointer active:scale-95",
                selectedYear === "all"
                  ? "bg-forest text-white shadow-xs"
                  : "border border-line bg-cream-pure text-ink hover:border-gold hover:bg-white",
              )}
            >
              All Years ({images.length})
            </button>
            {years.map((y) => {
              const count = images.filter((i) => i.year === y).length;
              return (
                <button
                  key={y}
                  type="button"
                  role="tab"
                  aria-selected={selectedYear === y}
                  onClick={(e) => handleYearSelect(e, y)}
                  className={cn(
                    "shrink-0 rounded-full px-4.5 py-1.5 text-xs font-semibold transition-all duration-200 shadow-2xs cursor-pointer active:scale-95",
                    selectedYear === y
                      ? "bg-forest text-white shadow-xs"
                      : "border border-line bg-cream-pure text-ink hover:border-gold hover:bg-white",
                  )}
                >
                  {y} ({count})
                </button>
              );
            })}
          </ScrollRail>
        </div>
      )}

      {/* Adaptive Gallery Layout */}
      {visible.length === 1 ? (
        /* Single Item: Centered Hero Spotlight Showcase */
        <div className="mx-auto max-w-2xl transition-all duration-500">
          <GalleryCard
            item={visible[0]}
            onClick={() => setActiveIndex(0)}
            className="aspect-[16/10] sm:aspect-[16/9] shadow-md hover:shadow-xl"
            priority
          />
        </div>
      ) : visible.length === 2 ? (
        /* Two Items: Balanced 2-Column Grid */
        <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2 transition-all duration-500">
          {visible.map((img, i) => (
            <GalleryCard
              key={img.id}
              item={img}
              onClick={() => setActiveIndex(i)}
              className="aspect-[4/3] shadow-sm hover:shadow-md"
            />
          ))}
        </div>
      ) : visible.length === 3 ? (
        /* Three Items: Balanced 3-Column Grid */
        <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3 transition-all duration-500">
          {visible.map((img, i) => (
            <GalleryCard
              key={img.id}
              item={img}
              onClick={() => setActiveIndex(i)}
              className="aspect-[4/3] shadow-sm hover:shadow-md"
            />
          ))}
        </div>
      ) : (
        /* 4+ Items: Bento / Dynamic Masonry Grid */
        <div className="grid grid-cols-2 gap-4 auto-rows-[170px] sm:auto-rows-[200px] md:grid-cols-3 lg:grid-cols-4 lg:auto-rows-[220px] transition-all duration-500">
          {visible.map((img, i) => {
            const isFeatured = i % 7 === 0;
            const isWide = i % 7 === 3;
            return (
              <GalleryCard
                key={img.id}
                item={img}
                onClick={() => setActiveIndex(i)}
                className={cn(
                  isFeatured && "col-span-2 row-span-2",
                  isWide && "col-span-2",
                )}
              />
            );
          })}
        </div>
      )}

      {/* Show More / Show Less Pagination Control */}
      {filtered.length > INITIAL_LIMIT && (
        <div className="mt-10 flex flex-col items-center justify-center gap-2">
          <button
            type="button"
            onClick={handleToggleShowAll}
            className="group inline-flex items-center gap-2 rounded-full border border-line bg-cream-pure px-6 py-2.5 text-xs font-bold text-ink shadow-2xs transition-all duration-200 hover:border-gold hover:bg-white active:scale-95 cursor-pointer"
          >
            {showAll ? (
              <>
                <span>Show Less Highlights</span>
                <ChevronUp className="size-4 transition-transform group-hover:-translate-y-0.5 text-forest" />
              </>
            ) : (
              <>
                <span>
                  Show All Photos &amp; Videos ({filtered.length - INITIAL_LIMIT} more)
                </span>
                <ChevronDown className="size-4 transition-transform group-hover:translate-y-0.5 text-forest" />
              </>
            )}
          </button>
          <p className="text-[11px] text-muted">
            Viewing {visible.length} of {filtered.length} captured moments
          </p>
        </div>
      )}

      {/* Fullscreen Lightbox Modal with smooth swipe and Lenis isolation */}
      <dialog
        ref={dialogRef}
        data-lenis-prevent
        onClose={() => setActiveIndex(null)}
        onClick={(e) => e.target === dialogRef.current && setActiveIndex(null)}
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0].clientX;
          touchStartY.current = e.touches[0].clientY;
          setSwipeOffset(0);
        }}
        onTouchMove={(e) => {
          if (touchStartX.current === null || touchStartY.current === null) return;
          const dx = e.touches[0].clientX - touchStartX.current;
          const dy = e.touches[0].clientY - touchStartY.current;
          if (Math.abs(dx) > Math.abs(dy)) {
            setSwipeOffset(dx);
          }
        }}
        onTouchEnd={() => {
          if (touchStartX.current === null) return;
          if (swipeOffset < -45) {
            navigate(1);
          } else if (swipeOffset > 45) {
            navigate(-1);
          }
          touchStartX.current = null;
          touchStartY.current = null;
          setSwipeOffset(0);
        }}
        aria-label="Media viewer"
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-black/95 p-4 backdrop-blur-md backdrop:bg-transparent"
      >
        {current && (
          <div
            className="relative flex h-full flex-col items-center justify-between"
            onClick={(e) => e.target === e.currentTarget && setActiveIndex(null)}
          >
            {/* Top Toolbar */}
            <div className="flex w-full max-w-5xl items-center justify-between pt-2 pb-4 text-white">
              <div className="flex items-center gap-2 text-xs text-white/70">
                <Calendar className="size-3.5 text-gold" />
                <span>Outreach {current.year}</span>
                <span>&bull;</span>
                <span>
                  {activeIndex! + 1} of {visible.length}
                </span>
              </div>
              <button
                type="button"
                aria-label="Close viewer"
                onClick={() => setActiveIndex(null)}
                className="grid size-10 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-gold cursor-pointer active:scale-95"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Media Content with smooth swipe feedback */}
            <div
              className="relative flex flex-1 w-full max-w-5xl items-center justify-center p-2 transition-transform duration-150 ease-out"
              style={{
                transform: swipeOffset !== 0 ? `translateX(${swipeOffset * 0.4}px)` : undefined,
              }}
            >
              {isVideoUrl(current.url) ? (
                <video
                  src={current.url}
                  controls
                  autoPlay
                  playsInline
                  className="max-h-[75vh] max-w-full rounded-2xl object-contain shadow-2xl"
                />
              ) : (
                <div className="relative h-full max-h-[75vh] w-full">
                  <Image
                    src={current.url}
                    alt={current.caption}
                    fill
                    sizes="100vw"
                    className="rounded-2xl object-contain select-none"
                  />
                </div>
              )}

              {/* Prev / Next Buttons */}
              {visible.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Previous item"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(-1);
                    }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 grid size-12 place-items-center rounded-full bg-black/60 text-white backdrop-blur-xs transition hover:bg-black/80 hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <ChevronLeft className="size-6" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next item"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(1);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 grid size-12 place-items-center rounded-full bg-black/60 text-white backdrop-blur-xs transition hover:bg-black/80 hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <ChevronRight className="size-6" />
                  </button>
                </>
              )}
            </div>

            {/* Bottom Caption */}
            <div className="w-full max-w-3xl pb-3 pt-2 text-center">
              <p className="text-sm font-medium text-white/90 leading-relaxed">
                {current.caption}
              </p>
            </div>
          </div>
        )}
      </dialog>
    </div>
  );
}

function GalleryCard({
  item,
  onClick,
  className,
  priority = false,
}: {
  item: GalleryItem;
  onClick: () => void;
  className?: string;
  priority?: boolean;
}) {
  const isVideo = isVideoUrl(item.url);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`View media: ${item.caption}`}
      className={cn(
        "group relative block w-full cursor-zoom-in overflow-hidden rounded-3xl border border-line bg-sand transition duration-300 hover:border-gold/60 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-gold",
        className,
      )}
    >
      <Image
        src={item.url}
        alt={item.caption}
        fill
        priority={priority}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="object-cover transition duration-700 group-hover:scale-105"
      />

      {/* Video Indicator Overlay */}
      {isVideo && (
        <div className="absolute inset-0 grid place-items-center bg-black/25 transition group-hover:bg-black/35">
          <div className="grid size-12 place-items-center rounded-full bg-gold text-forest shadow-lg transition group-hover:scale-110">
            <Play className="size-5 fill-forest ml-0.5" />
          </div>
        </div>
      )}

      {/* Year Tag Badge */}
      <span className="absolute top-3 left-3 rounded-full bg-forest/80 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-xs shadow-xs">
        {item.year}
      </span>

      {/* Expand Icon Badge */}
      <span className="absolute top-3 right-3 grid size-7 place-items-center rounded-full bg-black/40 text-white opacity-0 backdrop-blur-xs transition group-hover:opacity-100">
        <Maximize2 className="size-3.5" />
      </span>

      {/* Caption Gradient Overlay */}
      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-4 pt-10 pb-3.5 text-left text-xs font-semibold text-white opacity-0 transition duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
        {item.caption}
      </span>
    </button>
  );
}
