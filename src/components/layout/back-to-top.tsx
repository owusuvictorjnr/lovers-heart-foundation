"use client";

import { ArrowUp } from "lucide-react";
import { useSmoothScroll } from "./smooth-scroll-provider";
import { cn } from "@/lib/utils";

export function BackToTop() {
  const { scrollTo, scrollProgress, scrollY } = useSmoothScroll();
  const isVisible = scrollY > 280;

  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - scrollProgress * circumference;

  const handleScrollToTop = () => {
    scrollTo(0, { duration: 1.2 });
  };

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-40 transition-all duration-400 ease-out",
        isVisible
          ? "translate-y-0 opacity-100 pointer-events-auto scale-100"
          : "translate-y-4 opacity-0 pointer-events-none scale-90",
      )}
    >
      <button
        type="button"
        onClick={handleScrollToTop}
        aria-label="Scroll back to top of page"
        className="group relative flex size-12 items-center justify-center rounded-full border border-line/90 bg-cream-pure/90 text-ink shadow-[0_8px_24px_rgba(23,21,18,0.12)] backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-gold hover:bg-white hover:text-forest hover:shadow-[0_12px_28px_rgba(229,155,16,0.22)] active:scale-95 focus-visible:outline-2 focus-visible:outline-gold"
      >
        {/* Circular Progress Ring */}
        <svg
          className="absolute inset-0 size-full -rotate-90 pointer-events-none p-1"
          viewBox="0 0 44 44"
          aria-hidden="true"
        >
          {/* Background circle */}
          <circle
            cx="22"
            cy="22"
            r={radius}
            className="stroke-sand-dark/60 fill-none"
            strokeWidth="2.5"
          />
          {/* Active progress circle */}
          <circle
            cx="22"
            cy="22"
            r={radius}
            className="stroke-gold fill-none transition-all duration-100"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>

        {/* Arrow Icon */}
        <ArrowUp className="size-4.5 transition-transform duration-300 group-hover:-translate-y-0.5 text-ink group-hover:text-forest" />

        {/* Desktop Tooltip */}
        <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-forest px-2.5 py-1 text-[11px] font-semibold text-white opacity-0 shadow-md transition-opacity duration-200 group-hover:opacity-100 hidden sm:block">
          Top
        </span>
      </button>
    </div>
  );
}
