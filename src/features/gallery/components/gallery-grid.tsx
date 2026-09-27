"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type GalleryItem = { id: string; url: string; caption: string; year: number };

export function GalleryGrid({ images }: { images: GalleryItem[] }) {
  const years = useMemo(() => [...new Set(images.map((i) => i.year))].sort((a, b) => b - a), [images]);
  const [year, setYear] = useState<number | "all">("all");
  const [index, setIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const touchX = useRef<number | null>(null);

  const visible = year === "all" ? images : images.filter((i) => i.year === year);
  const current = index !== null ? visible[index] : null;

  const go = useCallback(
    (step: number) => setIndex((i) => (i === null ? i : (i + step + visible.length) % visible.length)),
    [visible.length],
  );

  useEffect(() => {
    const d = dialogRef.current;
    if (index !== null && !d?.open) d?.showModal();
    if (index === null && d?.open) d.close();
  }, [index]);

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, go]);

  return (
    <>
      {years.length > 1 && (
        <div role="tablist" aria-label="Filter by year" className="mb-8 flex flex-wrap justify-center gap-2">
          {(["all", ...years] as const).map((y) => (
            <button
              key={y}
              role="tab"
              aria-selected={year === y}
              onClick={() => setYear(y)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-semibold transition",
                year === y ? "border-forest bg-forest text-white" : "border-line bg-white hover:border-gold",
              )}
            >
              {y === "all" ? "All" : y}
            </button>
          ))}
        </div>
      )}

      <div className="grid auto-rows-[150px] grid-flow-dense grid-cols-2 gap-4 md:auto-rows-[210px] md:grid-cols-4">
        {visible.map((img, i) => (
          <button
            key={img.id}
            onClick={() => setIndex(i)}
            aria-label={`View photo: ${img.caption}`}
            className={cn(
              "group relative cursor-zoom-in overflow-hidden rounded-2xl bg-sand focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-gold",
              i % 6 === 0 && "col-span-2 row-span-2",
              i % 6 === 3 && "col-span-2",
            )}
          >
            <Image
              src={img.url}
              alt={img.caption}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover transition duration-500 group-hover:scale-105"
            />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent px-3.5 pt-8 pb-3 text-left text-sm text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
              {img.caption}
            </span>
          </button>
        ))}
      </div>

      <dialog
        ref={dialogRef}
        onClose={() => setIndex(null)}
        onClick={(e) => e.target === dialogRef.current && setIndex(null)}
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
          touchX.current = null;
        }}
        aria-label="Photo viewer"
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-[rgba(15,12,8,.94)] p-4 backdrop:bg-transparent"
      >
        {current && (
          <div className="grid h-full place-items-center" onClick={(e) => e.target === e.currentTarget && setIndex(null)}>
            <figure className="relative flex h-[80vh] w-full max-w-5xl flex-col items-center">
              <div className="relative w-full flex-1">
                <Image src={current.url} alt={current.caption} fill sizes="100vw" className="rounded-lg object-contain" />
              </div>
              <figcaption className="mt-4 flex flex-wrap justify-center gap-4 text-white">
                {current.caption}
                <span className="text-white/55">{index! + 1} / {visible.length} · {current.year}</span>
              </figcaption>
            </figure>
            <LbButton label="Close" className="top-4 right-4" onClick={() => setIndex(null)}>×</LbButton>
            {visible.length > 1 && (
              <>
                <LbButton label="Previous photo" className="bottom-4 left-4 md:top-1/2 md:bottom-auto md:-translate-y-1/2" onClick={() => go(-1)}>‹</LbButton>
                <LbButton label="Next photo" className="right-4 bottom-4 md:top-1/2 md:bottom-auto md:-translate-y-1/2" onClick={() => go(1)}>›</LbButton>
              </>
            )}
          </div>
        )}
      </dialog>
    </>
  );
}

function LbButton({ label, className, ...props }: { label: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      aria-label={label}
      className={cn("absolute grid size-12 place-items-center rounded-full bg-white/10 text-3xl leading-none text-white transition hover:bg-white/25", className)}
      {...props}
    />
  );
}
