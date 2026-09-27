import Link from "next/link";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export function Logo({ light, className }: { light?: boolean; className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2.5 font-serif text-xl font-bold", light ? "text-white" : "text-forest", className)}>
      <span className={cn("grid size-9.5 place-items-center rounded-xl text-clay", light ? "bg-white" : "bg-forest")} aria-hidden>
        <svg viewBox="0 0 32 32" className="size-6.5">
          <path d="M16 28s-11-6.6-11-15a6 6 0 0 1 11-3.3A6 6 0 0 1 27 13c0 8.4-11 15-11 15z" fill="currentColor" />
          <path d="M16 9v12M11.5 13.5h9" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      </span>
      {siteConfig.name}
    </Link>
  );
}
