import { ButtonLink } from "@/components/ui/button";
import { PhotoPlaceholder } from "@/components/ui/photo-placeholder";
import { Container } from "@/components/ui/section";

export function HeroSection({ years }: { years: number }) {
  return (
    <section className="relative overflow-hidden pt-10 pb-20 lg:pt-18">
      <Container className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
        <div>
          <p className="eyebrow">Ghana-based NGO · Giving every year</p>
          <h1 className="text-[clamp(2.3rem,5vw,3.8rem)]">Every child deserves to know they are loved.</h1>
          <p className="mt-5 mb-8 max-w-xl text-lg text-muted">
            God Is Alive brings food, clothing, school supplies and hope to children&apos;s homes across Ghana. Once a year,
            we show up in person to give.
          </p>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="#donate">Donate with MoMo or card</ButtonLink>
            <ButtonLink href="#outreach" variant="ghost">See our outreach</ButtonLink>
          </div>
        </div>
        <div className="relative">
          {/* Replace with <Image> of a real donation-day photo */}
          <PhotoPlaceholder label="Photo: children at a home during donation day" className="aspect-[4/4.4] rounded-[28px_28px_28px_120px] shadow-[0_10px_30px_rgba(29,26,22,.08)]" />
          <div className="absolute bottom-8 left-3 flex items-center gap-3 rounded-2xl bg-white px-5 py-4 shadow-[0_10px_30px_rgba(29,26,22,.12)] lg:-left-6">
            <strong className="font-serif text-4xl leading-none text-forest">{years}</strong>
            <span className="text-sm leading-tight text-muted">years of<br />giving</span>
          </div>
        </div>
      </Container>
      <div className="kente absolute inset-x-0 bottom-0" aria-hidden />
    </section>
  );
}
