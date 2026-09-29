"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronRight, ChevronUp, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/card";
import { ScrollRail } from "@/components/ui/scroll-rail";
import { useSmoothScroll } from "@/components/layout/smooth-scroll-provider";
import type { Home } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";

const defaultHomeImages = [
  "/images/community-meal.jpg",
  "/images/outreach-delivery.jpg",
  "/images/hero-children.jpg",
  "/images/about-team.jpg",
];

const INITIAL_HOMES_LIMIT = 6;

export function HomesGrid({ homes }: { homes: Home[] }) {
  const regions = useMemo(
    () => [...new Set(homes.map((h) => h.region))].sort(),
    [homes],
  );
  const [selectedRegion, setSelectedRegion] = useState<string | "all">("all");
  const [showAll, setShowAll] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollTo } = useSmoothScroll();

  const filtered = useMemo(() => {
    return selectedRegion === "all"
      ? homes
      : homes.filter((h) => h.region === selectedRegion);
  }, [homes, selectedRegion]);

  const visible = useMemo(() => {
    if (showAll || filtered.length <= INITIAL_HOMES_LIMIT) {
      return filtered;
    }
    return filtered.slice(0, INITIAL_HOMES_LIMIT);
  }, [filtered, showAll]);

  if (!homes.length) return null;

  const handleRegionSelect = (
    e: React.MouseEvent<HTMLButtonElement>,
    region: string | "all",
  ) => {
    setSelectedRegion(region);
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
      if (!next && containerRef.current) {
        scrollTo(containerRef.current, { offset: -90, duration: 0.9 });
      }
      return next;
    });
  };

  return (
    <div ref={containerRef} className="w-full">
      {/* Region Filter Tabs with smooth horizontal ScrollRail */}
      {regions.length > 1 && (
        <div className="mb-10 max-w-2xl mx-auto">
          <ScrollRail
            showGradients
            className="justify-start sm:justify-center gap-2 py-1.5"
          >
            <button
              type="button"
              role="tab"
              aria-selected={selectedRegion === "all"}
              onClick={(e) => handleRegionSelect(e, "all")}
              className={cn(
                "shrink-0 rounded-full px-4.5 py-1.5 text-xs font-semibold transition-all duration-200 shadow-2xs cursor-pointer active:scale-95",
                selectedRegion === "all"
                  ? "bg-forest text-white shadow-xs"
                  : "border border-line bg-cream-pure text-ink hover:border-gold hover:bg-white",
              )}
            >
              All Regions ({homes.length})
            </button>
            {regions.map((r) => {
              const count = homes.filter((h) => h.region === r).length;
              return (
                <button
                  key={r}
                  type="button"
                  role="tab"
                  aria-selected={selectedRegion === r}
                  onClick={(e) => handleRegionSelect(e, r)}
                  className={cn(
                    "shrink-0 rounded-full px-4.5 py-1.5 text-xs font-semibold transition-all duration-200 shadow-2xs cursor-pointer active:scale-95",
                    selectedRegion === r
                      ? "bg-forest text-white shadow-xs"
                      : "border border-line bg-cream-pure text-ink hover:border-gold hover:bg-white",
                  )}
                >
                  {r} ({count})
                </button>
              );
            })}
          </ScrollRail>
        </div>
      )}

      {/* Adaptive Grid Layout */}
      {visible.length === 1 ? (
        /* 1 Home: Centered Feature Spotlight Card */
        <div className="mx-auto max-w-xl transition-all duration-500">
          <HomeCard
            home={visible[0]}
            fallbackImg={defaultHomeImages[0]}
            priority
          />
        </div>
      ) : visible.length === 2 ? (
        /* 2 Homes: Balanced 2-Column Grid */
        <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2 transition-all duration-500">
          {visible.map((home, i) => (
            <HomeCard
              key={home.id}
              home={home}
              fallbackImg={defaultHomeImages[i % defaultHomeImages.length]}
            />
          ))}
        </div>
      ) : (
        /* 3+ Homes: Standard 3-Column Grid */
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 transition-all duration-500">
          {visible.map((home, i) => (
            <HomeCard
              key={home.id}
              home={home}
              fallbackImg={defaultHomeImages[i % defaultHomeImages.length]}
            />
          ))}
        </div>
      )}

      {/* Show More / Show Less Pagination Control */}
      {filtered.length > INITIAL_HOMES_LIMIT && (
        <div className="mt-12 flex flex-col items-center justify-center gap-2">
          <button
            type="button"
            onClick={handleToggleShowAll}
            className="group inline-flex items-center gap-2 rounded-full border border-line bg-cream-pure px-6 py-2.5 text-xs font-bold text-ink shadow-2xs transition-all duration-200 hover:border-gold hover:bg-white active:scale-95 cursor-pointer"
          >
            {showAll ? (
              <>
                <span>Show Fewer Homes</span>
                <ChevronUp className="size-4 transition-transform group-hover:-translate-y-0.5 text-forest" />
              </>
            ) : (
              <>
                <span>
                  Show All Partner Homes ({filtered.length - INITIAL_HOMES_LIMIT} more)
                </span>
                <ChevronDown className="size-4 transition-transform group-hover:translate-y-0.5 text-forest" />
              </>
            )}
          </button>
          <p className="text-[11px] text-muted">
            Viewing {visible.length} of {filtered.length} verified partner homes in Ghana
          </p>
        </div>
      )}
    </div>
  );
}

function HomeCard({
  home,
  fallbackImg,
  priority = false,
}: {
  home: Home;
  fallbackImg: string;
  priority?: boolean;
}) {
  const displayImg = home.imageUrl || fallbackImg;

  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-line bg-cream-pure transition-all duration-300 hover:-translate-y-1.5 hover:border-gold/60 hover:shadow-[0_16px_36px_rgba(23,21,18,0.08)]">
      <div className="relative aspect-[16/10] overflow-hidden bg-sand">
        <Image
          src={displayImg}
          alt={home.name}
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute top-4 left-4">
          <Badge
            tone="green"
            className="bg-cream-pure/95 backdrop-blur-xs font-bold text-forest shadow-xs"
          >
            <MapPin className="size-3.5 text-forest" />
            {home.region} Region
          </Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <h3 className="font-serif text-xl font-bold text-ink group-hover:text-forest transition-colors">
          {home.name}
        </h3>
        <p className="mt-2.5 flex-1 text-sm text-muted leading-relaxed">
          {home.description}
        </p>

        <div className="mt-5 pt-4 border-t border-line/80 flex items-center justify-between text-xs text-forest font-semibold">
          <span>Direct partner home</span>
          <a
            href="#donate"
            className="group inline-flex items-center gap-1 font-bold text-gold-deep hover:text-gold hover:underline transition-colors"
          >
            <span>Support this home</span>
            <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>
      </div>
    </article>
  );
}
