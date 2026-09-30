"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
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
      <div className="bg-forest px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs font-medium text-white">
        <Container className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 truncate">
            <span className="inline-block size-2 rounded-full bg-gold animate-pulse shrink-0" />
            <span className="truncate">
              <strong>Lovers Heart Foundation:</strong> Dedicated to children&apos;s homes across Ghana.
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-white/80 text-[11px] shrink-0">
            <span>MTN MoMo &amp; Telecel Cash</span>
            <span className="text-white/30">•</span>
            <span>100% Direct Giving</span>
          </div>
        </Container>
      </div>

      <header
        className={cn(
          "sticky top-0 z-50 transition-all duration-300",
          isScrolled
            ? "border-b border-line bg-cream/95 backdrop-blur-md shadow-xs py-2.5 sm:py-3.5"
            : "border-b border-transparent bg-cream/85 backdrop-blur-sm py-3 sm:py-4.5",
        )}
      >
        <Container className="flex items-center justify-between">
          <Logo />

          {/* Desktop Navigation */}
          <nav aria-label="Main" className="hidden lg:flex items-center gap-1.5">
            {links.map((l) => {
              const isActive = activeSection === l.id;
              return (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={(e) => handleNavClick(e, l.href)}
                  className={cn(
                    "relative rounded-full px-3.5 py-1.5 text-[14px] font-medium transition-all duration-200",
                    isActive
                      ? "text-forest font-bold bg-forest/8 shadow-2xs"
                      : "text-ink-light hover:text-forest hover:bg-sand/60",
                  )}
                >
                  {l.label}
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full bg-gold"
                    />
                  )}
                </a>
              );
            })}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <ButtonLink
              href="/#donate"
              size="sm"
              variant="primary"
              onClick={(e) => handleNavClick(e, "/#donate")}
              className="gap-2 shadow-[0_4px_12px_rgba(229,155,16,0.3)] transition-transform hover:scale-105 active:scale-95"
            >
              <Heart className="size-4 fill-ink/10" />
              <span>Donate Now</span>
            </ButtonLink>
          </div>

          {/* Mobile hamburger button */}
          <button
            className="grid size-9 sm:size-10 place-items-center rounded-xl border border-line bg-cream-pure text-ink lg:hidden cursor-pointer active:scale-95 transition-transform"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            <span className="grid gap-1.2">
              <span className={cn("block h-0.5 w-4.5 bg-ink transition-transform", open && "translate-y-1.7 rotate-45")} />
              <span className={cn("block h-0.5 w-4.5 bg-ink transition-opacity", open && "opacity-0")} />
              <span className={cn("block h-0.5 w-4.5 bg-ink transition-transform", open && "-translate-y-1.7 -rotate-45")} />
            </span>
          </button>
        </Container>

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
            "lg:hidden absolute inset-x-0 top-full border-b border-line bg-cream-pure/98 px-5 py-5 shadow-2xl backdrop-blur-md transition-all duration-300 z-50",
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
