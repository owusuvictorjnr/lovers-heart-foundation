import Link from "next/link";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export function Logo({ light, className }: { light?: boolean; className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "group flex items-center gap-3 font-serif text-xl font-bold tracking-tight transition",
        light ? "text-white" : "text-forest",
        className,
      )}
    >
      <span
        className={cn(
          "relative grid size-10 place-items-center rounded-xl transition duration-300 group-hover:scale-105",
          light
            ? "bg-white/10 text-gold border border-white/20 shadow-xs"
            : "bg-forest text-gold shadow-[0_4px_12px_rgba(12,59,46,0.2)]",
        )}
        aria-hidden
      >
        <svg viewBox="0 0 32 32" className="size-6">
          {/* Heart shape */}
          <path
            d="M16 28s-11-6.6-11-15a6 6 0 0 1 11-3.3A6 6 0 0 1 27 13c0 8.4-11 15-11 15z"
            fill="currentColor"
            opacity="0.95"
          />
          {/* Radiant Cross/Glow in center */}
          <path
            d="M16 8.5v13M10.5 13.5h11"
            stroke="#ffffff"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <span className="flex flex-col">
        <span className="leading-tight text-[1.15rem] font-bold">{siteConfig.name}</span>
        <span
          className={cn(
            "text-[10px] font-sans font-semibold tracking-widest uppercase",
            light ? "text-white/60" : "text-muted",
          )}
        >
          Ghana Non-Profit NGO
        </span>
      </span>
    </Link>
  );
}
