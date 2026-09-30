"use client";

import { useEffect, useState } from "react";
import { Heart, Menu, X } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { Container } from "@/components/ui/section";
import { useSmoothScroll } from "@/components/layout/smooth-scroll-provider";
import { cn } from "@/lib/utils";

const links = [
  { href: "/#about", id: "about", label: "About Us" },
  { href: "/#impact", id: "impact", label: "Our Impact" },
  { href: "/#homes", id: "homes", label: "Partner Homes" },
  { href: "/#outreach", id: "outreach", label: "Outreaches" },
  { href: "/#gallery", id: "gallery", label: "Gallery" },
  { href: "/#volunteer", id: "volunteer", label: "Volunteer" },
  { href: "/#contact", id: "contact", label: "Contact" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { isScrolled, scrollTo } = useSmoothScroll();
  const [activeSection, setActiveSection] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-25% 0px -65% 0px",
        threshold: 0,
      },
    );

    links.forEach((l) => {
      const el = document.getElementById(l.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    if (href.startsWith("/#") || href.startsWith("#")) {
      const id = href.replace(/^\/?#/, "");
      const el = document.getElementById(id);
      if (el) {
        e.preventDefault();
        setOpen(false);
        history.pushState(null, "", `#${id}`);
        scrollTo(el, { offset: -85, duration: 1.2 });
      }
    }
  };

  return (
    <>
      {/* Top mission & MoMo helper ribbon */}
      <div className="bg-forest px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs font-medium text-white border-b border-white/10">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 truncate">
            <span className="inline-block size-2 rounded-full bg-gold animate-pulse shrink-0" />
            <span className="truncate">
              <strong>Lovers Heart Foundation:</strong> Dedicated to children&apos;s homes across Ghana.
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-3.5 text-white/85 text-[11px] shrink-0 font-medium">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-gold" />
              MTN MoMo • Telecel • AT
            </span>
            <span className="text-white/30">•</span>
            <span className="text-gold font-semibold">100% Direct Giving</span>
          </div>
        </div>
      </div>

      <header
        className={cn(
          "sticky top-0 z-50 transition-all duration-300",
          isScrolled
            ? "border-b border-line bg-cream/95 backdrop-blur-md shadow-xs py-2.5 sm:py-3"
            : "border-b border-line/40 bg-cream/90 backdrop-blur-md py-3 sm:py-4",
        )}
      >
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <Logo />

          {/* Desktop Navigation Pill Dock */}
          <nav
            aria-label="Main navigation"
            className="hidden lg:flex items-center gap-0.5 xl:gap-1 rounded-full border border-forest/10 bg-forest/[0.04] p-1.5 backdrop-blur-md shadow-2xs"
          >
            {links.map((l) => {
              const isActive = activeSection === l.id;
              return (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={(e) => handleNavClick(e, l.href)}
                  className={cn(
                    "whitespace-nowrap rounded-full px-2.5 xl:px-3.5 py-1.5 text-[13px] xl:text-[14px] font-semibold transition-all duration-200 select-none",
                    isActive
                      ? "bg-forest text-gold shadow-xs"
                      : "text-ink/75 hover:text-forest hover:bg-forest/8",
                  )}
                >
                  {l.label}
                </a>
              );
            })}
          </nav>

          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <ButtonLink
              href="/#donate"
              size="sm"
              variant="primary"
              onClick={(e) => handleNavClick(e, "/#donate")}
              className="gap-2 px-5 py-2.5 shadow-[0_4px_14px_rgba(229,155,16,0.35)] transition-all hover:scale-105 active:scale-95 whitespace-nowrap font-bold"
            >
              <Heart className="size-4 fill-ink/15" />
              <span>Donate Now</span>
            </ButtonLink>
          </div>

          {/* Mobile menu toggle button */}
          <button
            type="button"
            className={cn(
              "relative grid size-10 place-items-center rounded-2xl border transition-all duration-300 cursor-pointer lg:hidden active:scale-90",
              open
                ? "border-forest bg-forest text-gold shadow-xs"
                : "border-line/90 bg-cream-pure text-forest shadow-2xs hover:border-gold hover:bg-gold-soft/30",
            )}
            aria-label={open ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <div className="relative size-5">
              <Menu
                className={cn(
                  "absolute inset-0 size-5 stroke-[2.2] transition-all duration-300 ease-out",
                  open ? "rotate-90 opacity-0 scale-50" : "rotate-0 opacity-100 scale-100",
                )}
              />
              <X
                className={cn(
                  "absolute inset-0 size-5 stroke-[2.4] transition-all duration-300 ease-out",
                  open ? "rotate-0 opacity-100 scale-100" : "-rotate-90 opacity-0 scale-50",
                )}
              />
            </div>
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {open && (
          <div
            className="fixed inset-0 top-[calc(100%+1px)] bg-ink/30 backdrop-blur-2xs z-40 lg:hidden"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
        )}
        <div
          data-lenis-prevent
          className={cn(
            "lg:hidden absolute inset-x-0 top-full border-b border-line bg-cream-pure/98 px-5 py-5 shadow-2xl backdrop-blur-md transition-all duration-300 z-50 rounded-b-3xl",
            open ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2 pointer-events-none",
          )}
        >
          <nav className="flex flex-col gap-1 max-h-[60vh] overflow-y-auto scrollbar-none">
            {links.map((l) => {
              const isActive = activeSection === l.id;
              return (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={(e) => handleNavClick(e, l.href)}
                  className={cn(
                    "flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all",
                    isActive
                      ? "bg-forest-soft text-forest font-bold border-l-3 border-gold pl-4"
                      : "text-ink hover:bg-sand/70 hover:text-forest",
                  )}
                >
                  <span>{l.label}</span>
                  {isActive && <span className="size-1.5 rounded-full bg-gold" />}
                </a>
              );
            })}
          </nav>
          <div className="mt-4 pt-3 border-t border-line flex flex-col gap-2.5">
            <ButtonLink
              href="/#donate"
              size="md"
              variant="primary"
              className="w-full justify-center gap-2 py-3 text-sm font-bold"
              onClick={(e) => handleNavClick(e, "/#donate")}
            >
              <Heart className="size-4" />
              <span>Donate (MoMo or Card)</span>
            </ButtonLink>
          </div>
        </div>
      </header>
    </>
  );
}
