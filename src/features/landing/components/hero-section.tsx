import { ArrowRight, Heart, ShieldCheck } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/section";
import { CountingNumber } from "@/components/ui/counting-number";
import { ImageCarousel } from "@/components/ui/image-carousel";
import { defaultHeroContent } from "@/features/content/queries";
import type { HeroContent } from "@/features/content/types";

export function HeroSection({
  years,
  content = defaultHeroContent,
}: {
  years: number;
  content?: HeroContent;
}) {
  return (
    <section className="relative overflow-hidden pt-8 pb-20 lg:pt-14 lg:pb-24">
      {/* Background subtle warm aura */}
      <div
        className="pointer-events-none absolute -top-40 right-0 -z-10 h-[500px] w-[500px] rounded-full bg-gold-soft/60 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute top-1/2 -left-40 -z-10 h-[450px] w-[450px] rounded-full bg-forest-soft/70 blur-3xl"
        aria-hidden
      />

      <Container className="grid items-center gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
        <div>
          {/* Eyebrow badge */}
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-forest/15 bg-forest-soft px-3.5 py-1.5 text-xs font-semibold text-forest shadow-2xs">
            <span className="size-2 rounded-full bg-forest animate-pulse" />
            <span>{content.badge}</span>
          </div>

          <h1 className="text-[clamp(2.4rem,4.8vw,3.85rem)] font-bold leading-[1.12] tracking-tight text-ink">
            {content.title}{" "}
            <span className="relative inline-block text-forest">
              {content.titleHighlight}
              <svg
                viewBox="0 0 200 12"
                className="absolute -bottom-1.5 left-0 w-full text-gold/70"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 9C50 3 150 3 198 9"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          <p className="mt-6 mb-8 max-w-xl text-lg text-muted leading-relaxed">
            {content.description}
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <ButtonLink
              href="#donate"
              size="lg"
              variant="primary"
              className="gap-2.5 shadow-[0_6px_20px_rgba(229,155,16,0.35)]"
            >
              <Heart className="size-5 fill-ink/10" />
              <span>Donate with MoMo or Card</span>
            </ButtonLink>
            <ButtonLink
              href="#outreach"
              size="lg"
              variant="outline"
              className="gap-2"
            >
              <span>Explore Our Outreach</span>
              <ArrowRight className="size-4 text-forest" />
            </ButtonLink>
          </div>

          {/* Direct Trust Indicators with clean Lucide icons */}
          <div className="mt-8 pt-6 border-t border-line/80 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-muted font-medium">
            <span className="flex items-center gap-1.5 text-forest font-semibold">
              <ShieldCheck className="size-4" />
              100% Direct to Care Homes
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-gold" />
              MTN MoMo &amp; Telecel Cash
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-clay" />
              Volunteer-Run Convoy
            </span>
          </div>
        </div>

        {/* Hero Imagery with Smooth Swipeable Photo Carousel */}
        <div className="relative">
          <div className="relative mx-auto max-w-md lg:max-w-none">
            {/* Organic framed photograph / Carousel */}
            <div className="relative aspect-[4/3.8] overflow-hidden rounded-3xl border-4 border-cream-pure shadow-[0_20px_45px_rgba(23,21,18,0.12)]">
              <ImageCarousel
                images={content.images}
                alt={content.title}
                priority
                className="size-full"
                sizes="(max-width: 768px) 100vw, 50vw"
                overlay={
                  <>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      {content.imageCaption && (
                        <p className="text-xs font-semibold tracking-wider uppercase text-gold">
                          {content.imageCaption}
                        </p>
                      )}
                      {content.imageSubcaption && (
                        <p className="text-sm font-medium text-white/95">
                          {content.imageSubcaption}
                        </p>
                      )}
                    </div>
                  </>
                }
              />
            </div>

            {/* Floating Badge: Years of Giving */}
            <div className="absolute -bottom-6 -left-4 sm:-left-6 flex items-center gap-3.5 rounded-2xl border border-line bg-cream-pure p-4 shadow-[0_12px_32px_rgba(23,21,18,0.12)] z-20">
              <div className="grid size-12 place-items-center rounded-xl bg-forest text-gold font-serif text-2xl font-bold">
                <CountingNumber value={years} plus duration={1200} />
              </div>
              <div className="leading-tight">
                <strong className="block text-sm font-bold text-ink">Years of Service</strong>
                <span className="text-xs text-muted">Consistent Annual Giving</span>
              </div>
            </div>

            {/* Floating Accent: Next Outreach Clean Badge */}
            <div className="absolute -top-4 -right-3 sm:-right-4 flex items-center gap-2 rounded-full border border-gold/50 bg-gold-soft px-4 py-1.5 shadow-xs z-20">
              <Heart className="size-3.5 text-[#7a4800] fill-[#7a4800]/20" />
              <p className="text-[11px] font-bold tracking-wider text-[#7a4800] uppercase">
                Ghana Outreach {new Date().getFullYear()}
              </p>
            </div>
          </div>
        </div>
      </Container>

      {/* Kente Ribbon */}
      <div className="kente absolute inset-x-0 bottom-0" aria-hidden />
    </section>
  );
}
