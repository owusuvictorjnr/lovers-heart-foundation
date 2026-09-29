"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface CountingNumberProps {
  value: number;
  duration?: number;
  delay?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  plus?: boolean;
}

export function CountingNumber({
  value,
  duration = 2000,
  delay = 0,
  prefix = "",
  suffix = "",
  className,
  plus = false,
}: CountingNumberProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Accessibility: instantly display final value if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      setDisplayValue(value);
      setIsCompleted(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setHasStarted(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.2,
        rootMargin: "0px 0px -30px 0px",
      },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  useEffect(() => {
    if (!hasStarted) return;

    let startTime: number | null = null;
    let animationFrameId: number;

    const timeoutId = setTimeout(() => {
      const step = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);

        // Authentic jackpot / coin slot exponential ease-out curve
        // Rapid flurry at start, settling into distinct click-stops at the finish
        const easedProgress =
          progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

        const current = Math.floor(easedProgress * value);
        setDisplayValue(current);

        if (progress < 1) {
          animationFrameId = requestAnimationFrame(step);
        } else {
          setDisplayValue(value);
          setIsCompleted(true);
        }
      };

      animationFrameId = requestAnimationFrame(step);
    }, delay);

    return () => {
      clearTimeout(timeoutId);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [hasStarted, value, duration, delay]);

  return (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-baseline justify-center font-serif tabular-nums transition-all duration-300",
        hasStarted && !isCompleted && "text-gold-warm drop-shadow-[0_0_18px_rgba(243,177,44,0.55)] scale-[1.03]",
        isCompleted && "scale-100",
        className,
      )}
    >
      {prefix && <span>{prefix}</span>}
      <span className="tracking-tight">{displayValue.toLocaleString()}</span>
      {(plus || suffix) && (
        <span
          className={cn(
            "transition-all duration-300 ease-out font-sans font-bold",
            isCompleted
              ? "opacity-100 translate-x-0 scale-100"
              : "opacity-40 -translate-x-0.5 scale-90",
          )}
        >
          {plus && value > 0 ? "+" : ""}
          {suffix}
        </span>
      )}
    </span>
  );
}
