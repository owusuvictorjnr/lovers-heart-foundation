import { Building2, Calendar, Heart, Users } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/section";
import { ImageCarousel } from "@/components/ui/image-carousel";
import { formatDate } from "@/lib/utils";
import { defaultOutreachContent } from "@/features/content/queries";
import type { OutreachContent } from "@/features/content/types";
import { listOutreach } from "../queries";

export async function OutreachSection({
  content = defaultOutreachContent,
}: {
  content?: OutreachContent;
}) {
  const events = await listOutreach(6);
  if (!events.length) return null;

  return (
    <section id="outreach" className="relative bg-sand/60 py-24 border-y border-line/60">
      <Container className="grid items-start gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        {/* Left Side: Overview & Visual Story with Swipeable Image Carousel */}
        <div className="lg:sticky lg:top-28">
          <p className="eyebrow">{content.eyebrow}</p>
          <h2 className="text-[clamp(2.1rem,4vw,2.9rem)] font-bold tracking-tight text-ink">
            {content.title}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-muted leading-relaxed">
            {content.description}
          </p>

          <div className="mt-6 overflow-hidden rounded-2xl border-2 border-cream-pure shadow-md relative aspect-[16/10]">
            <ImageCarousel
              images={content.images}
              alt={content.title}
              className="size-full"
              sizes="(max-width: 768px) 100vw, 40vw"
              overlay={
                <>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4 text-white text-xs">
                    {content.imageTag && (
                      <span className="font-bold text-gold mr-1.5">
                        {content.imageTag}
                      </span>
                    )}
                    <span>{content.imageCaption}</span>
                  </div>
                </>
              }
            />
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <ButtonLink href="#donate" variant="primary" size="md" className="gap-2 shadow-sm">
              <Heart className="size-4" />
              <span>{content.sponsorButtonText || `Sponsor ${new Date().getFullYear()} Outreach`}</span>
            </ButtonLink>
            <ButtonLink href="#volunteer" variant="outline" size="md">
              <span>Join as Volunteer</span>
            </ButtonLink>
          </div>
        </div>

        {/* Right Side: Timeline Cards */}
        <div className="relative pl-6 sm:pl-8 before:absolute before:top-3 before:bottom-3 before:left-2 before:w-0.5 before:bg-line-dark/60">
          <div className="space-y-6">
            {events.map((e) => (
              <div
                key={e.id}
                className="group relative rounded-2xl border border-line bg-cream-pure p-6 shadow-xs transition duration-300 hover:border-gold/60 hover:shadow-md"
              >
                {/* Timeline dot */}
                <span
                  className={`absolute top-7 -left-[31px] sm:-left-[39px] size-4.5 rounded-full border-3 border-cream-pure shadow-xs ${
                    e.upcoming ? "bg-gold" : "bg-forest"
                  }`}
                  aria-hidden
                />

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-forest-light uppercase">
                    <Calendar className="size-3.5" />
                    Year {e.year}
                  </span>
                  {e.upcoming && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-soft border border-gold/30 px-3 py-0.5 text-xs font-bold text-gold-deep">
                      <span className="size-1.5 rounded-full bg-gold-deep" />
                      <span>Upcoming Outreach Mission</span>
                    </span>
                  )}
                </div>

                <h3 className="mt-2 text-xl font-bold text-ink group-hover:text-forest transition-colors">
                  {e.title}
                </h3>
                <p className="mt-2 text-sm text-muted leading-relaxed">{e.summary}</p>

                {(e.date || e.homesCount > 0 || e.childrenReached > 0) && (
                  <div className="mt-4 pt-3.5 border-t border-line/70 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-forest">
                    {e.date && (
                      <span className="inline-flex items-center gap-1.5 text-muted">
                        <Calendar className="size-3.5 text-muted" />
                        <span>{formatDate(e.date)}</span>
                      </span>
                    )}
                    {e.homesCount > 0 && (
                      <span className="inline-flex items-center gap-1.5">
                        <Building2 className="size-3.5" />
                        <span>{e.homesCount} Children&apos;s Homes</span>
                      </span>
                    )}
                    {e.childrenReached > 0 && (
                      <span className="inline-flex items-center gap-1.5">
                        <Users className="size-3.5" />
                        <span>{e.childrenReached.toLocaleString()} Children Supported</span>
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
