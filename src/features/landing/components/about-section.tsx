import { Heart, ShieldCheck, Users } from "lucide-react";
import { Container } from "@/components/ui/section";
import { ImageCarousel } from "@/components/ui/image-carousel";
import { defaultAboutContent } from "@/features/content/queries";
import type { AboutContent } from "@/features/content/types";

const valueIcons = [Heart, ShieldCheck, Users];

export function AboutSection({
  content = defaultAboutContent,
}: {
  content?: AboutContent;
}) {
  return (
    <section id="about" className="relative py-24 overflow-hidden bg-cream">
      <Container className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        {/* Left column: Authentic photograph / Carousel & Quote Card */}
        <div className="relative">
          <div className="relative aspect-[4/4.6] overflow-hidden rounded-3xl border-4 border-cream-pure shadow-[0_16px_40px_rgba(23,21,18,0.1)]">
            <ImageCarousel
              images={content.images}
              alt={content.title}
              className="size-full"
              sizes="(max-width: 768px) 100vw, 45vw"
              overlay={
                <>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                  <div className="absolute bottom-5 left-5 right-5 text-white">
                    {content.imageBadge && (
                      <span className="inline-block rounded-full bg-gold/95 px-3.5 py-1 text-[11px] font-bold text-ink uppercase tracking-wider mb-2 shadow-xs">
                        {content.imageBadge}
                      </span>
                    )}
                    {content.imageCaption && (
                      <p className="text-sm font-medium text-white/90">
                        {content.imageCaption}
                      </p>
                    )}
                  </div>
                </>
              }
            />
          </div>

          {/* Editorial quote stamp */}
          <div className="mt-6 rounded-2xl border border-line bg-sand/60 p-5.5">
            <blockquote className="font-serif italic text-base text-ink-light leading-relaxed">
              &ldquo;{content.quote}&rdquo;
            </blockquote>
            <p className="mt-2.5 text-xs font-bold tracking-wider text-forest-light uppercase">
              — {content.quoteAuthor}
            </p>
          </div>
        </div>

        {/* Right column: Narrative and Core Pillars with Clean Lucide Icons */}
        <div>
          <p className="eyebrow">{content.eyebrow}</p>
          <h2 className="text-[clamp(2.1rem,4vw,2.9rem)] font-bold tracking-tight text-ink">
            {content.title}
          </h2>
          <p className="mt-5 text-base sm:text-lg text-muted leading-relaxed">
            {content.paragraph1}
          </p>
          <p className="mt-3.5 text-base text-muted leading-relaxed">
            {content.paragraph2}
          </p>

          {/* Value cards with clean Lucide icons */}
          <div className="mt-8 grid gap-4">
            {content.values.map((v, idx) => {
              const Icon = valueIcons[idx % valueIcons.length];
              return (
                <div
                  key={v.title + idx}
                  className="flex gap-4 rounded-2xl border border-line/80 bg-cream-pure p-5 transition duration-200 hover:border-gold/60 hover:bg-gold-soft/20 shadow-xs"
                >
                  <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-forest-soft text-forest">
                    <Icon className="size-5" />
                  </div>
                  <div>
                    <strong className="block text-base font-bold text-ink">{v.title}</strong>
                    <p className="mt-1 text-sm text-muted leading-relaxed">{v.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
