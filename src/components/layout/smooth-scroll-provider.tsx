"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

interface SmoothScrollContextType {
  lenis: Lenis | null;
  scrollTo: (
    target: string | HTMLElement | number,
    options?: {
      offset?: number;
      duration?: number;
      immediate?: boolean;
      lock?: boolean;
      onComplete?: () => void;
    },
  ) => void;
  scrollProgress: number;
  scrollY: number;
  isScrolled: boolean;
}

const SmoothScrollContext = createContext<SmoothScrollContextType>({
  lenis: null,
  scrollTo: () => {},
  scrollProgress: 0,
  scrollY: 0,
  isScrolled: false,
});

export function useSmoothScroll() {
  return useContext(SmoothScrollContext);
}

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Respect user's reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      const handleNativeScroll = () => {
        const top = window.scrollY;
        const total =
          document.documentElement.scrollHeight - window.innerHeight;
        setScrollY(top);
        setIsScrolled(top > 20);
        setScrollProgress(total > 0 ? Math.min(1, Math.max(0, top / total)) : 0);
      };

      window.addEventListener("scroll", handleNativeScroll, { passive: true });
      return () => window.removeEventListener("scroll", handleNativeScroll);
    }

    const isTouchDevice =
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      window.innerWidth < 768;

    const lenis = new Lenis({
      duration: isTouchDevice ? 1.0 : 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
      infinite: false,
      autoRaf: false,
    });

    lenisRef.current = lenis;
    setLenisInstance(lenis);

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    lenis.on("scroll", ({ scroll, progress }: { scroll: number; progress: number }) => {
      setScrollY(scroll);
      setIsScrolled(scroll > 20);
      setScrollProgress(progress);
    });

    // Handle hash links smooth scrolling
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href) return;

      // Match internal hash links like "#donate" or "/#donate" on the current page
      let hash = "";
      if (href.startsWith("#") && href.length > 1) {
        hash = href;
      } else if (
        href.startsWith("/#") &&
        (window.location.pathname === "/" || window.location.pathname === "")
      ) {
        hash = href.replace(/^\//, "");
      }

      if (hash && hash !== "#") {
        const targetElement = document.querySelector(hash) as HTMLElement | null;
        if (targetElement) {
          e.preventDefault();
          // Update url hash without instant jump
          history.pushState(null, "", hash);
          lenis.scrollTo(targetElement, {
            offset: -85,
            duration: 1.2,
          });
        }
      }
    };

    document.addEventListener("click", handleAnchorClick, { capture: true });

    return () => {
      document.removeEventListener("click", handleAnchorClick, { capture: true });
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  const scrollTo = useCallback(
    (
      target: string | HTMLElement | number,
      options?: {
        offset?: number;
        duration?: number;
        immediate?: boolean;
        lock?: boolean;
        onComplete?: () => void;
      },
    ) => {
      if (lenisRef.current) {
        lenisRef.current.scrollTo(target, {
          offset: options?.offset ?? -85,
          duration: options?.duration ?? 1.2,
          immediate: options?.immediate,
          lock: options?.lock,
          onComplete: options?.onComplete,
        });
      } else {
        if (typeof target === "number") {
          window.scrollTo({
            top: target,
            behavior: options?.immediate ? "auto" : "smooth",
          });
        } else if (typeof target === "string") {
          const el = document.querySelector(target);
          if (el) {
            const top =
              el.getBoundingClientRect().top +
              window.scrollY +
              (options?.offset ?? -85);
            window.scrollTo({
              top,
              behavior: options?.immediate ? "auto" : "smooth",
            });
          }
        } else if (target instanceof HTMLElement) {
          const top =
            target.getBoundingClientRect().top +
            window.scrollY +
            (options?.offset ?? -85);
          window.scrollTo({
            top,
            behavior: options?.immediate ? "auto" : "smooth",
          });
        }
      }
    },
    [],
  );

  return (
    <SmoothScrollContext.Provider
      value={{
        lenis: lenisInstance,
        scrollTo,
        scrollProgress,
        scrollY,
        isScrolled,
      }}
    >
      {children}
    </SmoothScrollContext.Provider>
  );
}
