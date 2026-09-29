"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScrollRailProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  showArrows?: boolean;
  showGradients?: boolean;
  className?: string;
  containerClassName?: string;
}

export function ScrollRail({
  children,
  showArrows = false,
  showGradients = true,
  className,
  containerClassName,
  ...props
}: ScrollRailProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const hasDragged = useRef(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft: left, scrollWidth: width, clientWidth: client } = el;
    setCanScrollLeft(left > 4);
    setCanScrollRight(left + client < width - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    checkScroll();
    const ro = new ResizeObserver(() => checkScroll());
    ro.observe(el);

    return () => ro.disconnect();
  }, [checkScroll]);

  const scrollBy = (amount: number) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: amount,
      behavior: "smooth",
    });
  };

  // Mouse drag-to-scroll support for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    const el = scrollRef.current;
    if (!el) return;
    setIsDragging(true);
    hasDragged.current = false;
    startX.current = e.pageX - el.offsetLeft;
    scrollLeft.current = el.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    if (Math.abs(walk) > 5) {
      hasDragged.current = true;
    }
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
    checkScroll();
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className={cn("relative w-full group/rail", containerClassName)} {...props}>
      {/* Left Edge Fade Gradient */}
      {showGradients && (
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-8 bg-gradient-to-r from-cream to-transparent transition-opacity duration-300",
            canScrollLeft ? "opacity-100" : "opacity-0",
          )}
        />
      )}

      {/* Right Edge Fade Gradient */}
      {showGradients && (
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-8 bg-gradient-to-l from-cream to-transparent transition-opacity duration-300",
            canScrollRight ? "opacity-100" : "opacity-0",
          )}
        />
      )}

      {/* Desktop Left Scroll Arrow */}
      {showArrows && canScrollLeft && (
        <button
          type="button"
          onClick={() => scrollBy(-200)}
          aria-label="Scroll left"
          className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 hidden md:grid size-8 place-items-center rounded-full border border-line bg-cream-pure text-ink shadow-sm transition hover:bg-white hover:border-gold hover:text-forest active:scale-95"
        >
          <ChevronLeft className="size-4" />
        </button>
      )}

      {/* Desktop Right Scroll Arrow */}
      {showArrows && canScrollRight && (
        <button
          type="button"
          onClick={() => scrollBy(200)}
          aria-label="Scroll right"
          className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 hidden md:grid size-8 place-items-center rounded-full border border-line bg-cream-pure text-ink shadow-sm transition hover:bg-white hover:border-gold hover:text-forest active:scale-95"
        >
          <ChevronRight className="size-4" />
        </button>
      )}

      {/* Scrollable Container */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        data-lenis-prevent
        className={cn(
          "flex items-center overflow-x-auto overflow-y-hidden scrollbar-none scroll-smooth py-1 px-1 touch-pan-x",
          isDragging ? "cursor-grabbing select-none" : "cursor-grab md:cursor-auto",
          className,
        )}
        style={{
          WebkitOverflowScrolling: "touch",
        }}
      >
        {children}
      </div>
    </div>
  );
}
