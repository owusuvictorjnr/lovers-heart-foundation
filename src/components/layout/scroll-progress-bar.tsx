"use client";

import { useSmoothScroll } from "./smooth-scroll-provider";

export function ScrollProgressBar() {
  const { scrollProgress } = useSmoothScroll();

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[60] h-[3px] pointer-events-none bg-transparent"
    >
      <div
        className="h-full bg-gradient-to-r from-forest via-gold to-gold-warm shadow-[0_0_8px_rgba(229,155,16,0.6)] transition-transform duration-75 ease-out origin-left will-change-transform"
        style={{
          transform: `scaleX(${scrollProgress})`,
        }}
      />
    </div>
  );
}
