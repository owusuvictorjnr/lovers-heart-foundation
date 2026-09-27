import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { Container, SectionHeading } from "@/components/ui/section";
import { siteConfig } from "@/config/site";
import { DirectGiving } from "./direct-giving";
import { DonateForm } from "./donate-form";

export function DonateSection() {
  return (
    <section id="donate" className="bg-forest py-24 text-white">
      <Container>
        <SectionHeading
          dark
          center
          eyebrow="Donate"
          title="Give today. Every cedi reaches a child."
          description="Pay securely online with Mobile Money or card, or send directly using the details below."
        />
        <DonateForm />

        <p className="my-12 flex items-center gap-4 text-sm tracking-[.12em] text-white/60 uppercase before:h-px before:flex-1 before:bg-white/20 after:h-px after:flex-1 after:bg-white/20">
          or give directly
        </p>
        <DirectGiving />

        <div className="mt-8 flex flex-wrap items-center justify-between gap-6 rounded-2xl border border-white/15 bg-white/5 p-7">
          <div>
            <h3 className="text-xl">Prefer to give items?</h3>
            <p className="mt-1 text-white/75">
              We welcome food, clothing, toiletries, books and school supplies. Get in touch to arrange a drop-off.
            </p>
          </div>
          <Link href="#contact" className={buttonClasses({ variant: "light" })}>Arrange a drop-off</Link>
        </div>
        <p className="mt-6 text-center text-sm text-white/55">
          For direct transfers please use <strong>&ldquo;{siteConfig.directGiving.reference}&rdquo;</strong> as the reference.
        </p>
      </Container>
    </section>
  );
}
