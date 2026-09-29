import Link from "next/link";
import { Heart, Package, ShieldCheck } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { Container, SectionHeading } from "@/components/ui/section";
import { siteConfig } from "@/config/site";
import { DirectGiving } from "./direct-giving";
import { DonateForm } from "./donate-form";

export function DonateSection() {
  return (
    <section id="donate" className="relative overflow-hidden bg-forest py-24 text-white">
      {/* Warm ambient backdrops */}
      <div
        className="pointer-events-none absolute top-0 right-1/4 -z-0 h-96 w-96 rounded-full bg-gold/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 left-1/4 -z-0 h-96 w-96 rounded-full bg-forest-light/40 blur-3xl"
        aria-hidden
      />

      <Container className="relative z-10">
        <SectionHeading
          dark
          center
          eyebrow="Give with Confidence"
          title="Transform a Child&apos;s Life Today."
          description="Donate online securely via Mobile Money or Card, or send directly to our verified charity accounts."
        />

        {/* The Main Giving Card */}
        <DonateForm />

        {/* Direct Giving Section */}
        <div className="mt-16">
          <div className="relative mb-8 text-center">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-white/20" />
            </div>
            <div className="relative inline-flex items-center gap-2 bg-forest px-4 text-xs font-bold tracking-widest text-gold uppercase">
              <ShieldCheck className="size-4 text-gold" />
              <span>Or Transfer Directly to Our Accounts</span>
            </div>
          </div>

          <DirectGiving />
        </div>

        {/* In-Kind Gifts / Physical Drop-offs */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-6 rounded-3xl border border-white/15 bg-white/5 p-7 sm:p-8 backdrop-blur-xs transition hover:bg-white/10">
          <div className="flex items-start gap-4.5 max-w-2xl">
            <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gold/20 text-gold">
              <Package className="size-6" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-white">
                Would you prefer to donate physical goods?
              </h3>
              <p className="mt-1.5 text-sm text-white/80 leading-relaxed">
                We gratefully welcome non-perishable food (rice, oil, canned goods), school bags, exercise books, stationery, clean clothing, and toiletries.
              </p>
            </div>
          </div>
          <Link
            href="#contact"
            className={buttonClasses({
              variant: "light",
              size: "md",
              className: "shrink-0 gap-2 font-bold",
            })}
          >
            <Heart className="size-4 text-forest" />
            <span>Arrange a Drop-Off</span>
          </Link>
        </div>

        <p className="mt-6 text-center text-xs text-white/50">
          For all manual bank and MoMo transfers, please include{" "}
          <strong className="text-gold">&ldquo;{siteConfig.directGiving.reference}&rdquo;</strong> as your transfer reference.
        </p>
      </Container>
    </section>
  );
}
