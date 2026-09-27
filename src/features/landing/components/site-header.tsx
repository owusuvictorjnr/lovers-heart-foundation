"use client";

import { useEffect, useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { Container } from "@/components/ui/section";
import { cn } from "@/lib/utils";

const links = [
  { href: "/#about", label: "About" },
  { href: "/#impact", label: "Impact" },
  { href: "/#homes", label: "Homes" },
  { href: "/#outreach", label: "Outreach" },
  { href: "/#gallery", label: "Gallery" },
  { href: "/#volunteer", label: "Volunteer" },
  { href: "/#contact", label: "Contact" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={cn("sticky top-0 z-50 border-b bg-cream/90 backdrop-blur-md transition", scrolled ? "border-line" : "border-transparent")}>
      <Container className="flex h-18 items-center justify-between">
        <Logo />
        <button
          className="grid size-10 place-items-center lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span className="grid gap-1.5">
            <span className={cn("block h-0.5 w-6 bg-ink transition", open && "translate-y-2 rotate-45")} />
            <span className={cn("block h-0.5 w-6 bg-ink transition", open && "opacity-0")} />
            <span className={cn("block h-0.5 w-6 bg-ink transition", open && "-translate-y-2 -rotate-45")} />
          </span>
        </button>
        <nav
          aria-label="Main"
          className={cn(
            "absolute inset-x-0 top-18 flex-col border-b border-line bg-cream px-4 pb-5 lg:static lg:flex lg:flex-row lg:items-center lg:gap-6 lg:border-0 lg:bg-transparent lg:p-0",
            open ? "flex" : "hidden",
          )}
        >
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="border-b border-line py-3 text-[15px] font-medium lg:border-0 lg:py-0 lg:hover:text-forest-light"
            >
              {l.label}
            </a>
          ))}
          <ButtonLink href="/#donate" size="sm" className="mt-4 lg:mt-0" onClick={() => setOpen(false)}>Donate</ButtonLink>
        </nav>
      </Container>
    </header>
  );
}
