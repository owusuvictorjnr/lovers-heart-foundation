import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export function Logo({
  light,
  className,
  showText = true,
  size = "md",
}: {
  light?: boolean;
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const sizeMap = {
    sm: "size-9 sm:size-10",
    md: "size-10 sm:size-11",
    lg: "size-14 sm:size-16",
  };

  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex items-center gap-2.5 sm:gap-3 font-serif tracking-tight transition",
        light ? "text-white" : "text-forest",
        className,
      )}
    >
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-full border border-gold/40 bg-white shadow-xs transition-transform duration-300 group-hover:scale-105",
          sizeMap[size],
        )}
      >
        <Image
          src="/images/logo.jpg"
          alt={siteConfig.name}
          fill
          sizes="(max-width: 640px) 40px, 48px"
          priority
          className="object-contain p-0.5"
        />
      </div>

      {showText && (
        <span className="flex flex-col">
          <span className="leading-tight text-[1.05rem] sm:text-[1.2rem] font-bold">
            {siteConfig.name}
          </span>
          <span
            className={cn(
              "text-[10px] sm:text-[11px] font-sans font-semibold tracking-wider uppercase",
              light ? "text-gold/90" : "text-forest/80 font-bold",
            )}
          >
            Nyame Tumi So <span className="opacity-40">•</span> Ghana NGO
          </span>
        </span>
      )}
    </Link>
  );
}

