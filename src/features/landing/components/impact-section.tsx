import { Check, ShieldCheck, Truck, Utensils } from "lucide-react";
import { Container, SectionHeading } from "@/components/ui/section";
import { CountingNumber } from "@/components/ui/counting-number";
import type { getImpactStats } from "../queries";

export function ImpactSection({ stats }: { stats: Awaited<ReturnType<typeof getImpactStats>> }) {
  const items = [
    {
      value: stats.homes,
      label: "Children's Homes Supported",
      detail: "Regular visits with customized provisions",
    },
    {
      value: stats.children,
      label: "Vulnerable Children Reached",
      plus: true,
      detail: "Provided with food, school bags & care",
    },
    {
      value: stats.regions,
      label: "Regions in Ghana",
      detail: "Greater Accra, Ashanti, Central & more",
    },
    {
      value: stats.volunteers,
      label: "Passionate Volunteers",
      plus: true,
      detail: "100% community and faith led",
    },
  ];

  return (
    <section id="impact" className="relative overflow-hidden bg-forest py-24 text-white">
      {/* Background subtle glow */}
      <div
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 -z-0 h-96 w-full max-w-4xl rounded-full bg-forest-light/30 blur-3xl"
        aria-hidden
      />

      <Container className="relative z-10">
        <SectionHeading
          dark
          center
          eyebrow="Proven Impact &amp; Transparency"
          title="Small acts of love, multiplying across Ghana."
          description="Every donation goes directly into food sacks, educational books, medical toiletries, and direct care for children."
        />

        {/* 4 Clean Editorial Stat Cards - numbers are the heroes with jackpot counting effect */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((s, idx) => (
            <div
              key={s.label}
              className="group relative flex flex-col rounded-3xl border border-white/15 bg-white/5 p-8 text-center backdrop-blur-xs transition duration-300 hover:border-gold/60 hover:bg-white/10"
            >
              <strong className="block font-serif text-[clamp(2.6rem,4.8vw,3.6rem)] font-bold leading-tight text-gold">
                <CountingNumber
                  value={s.value}
                  plus={s.plus}
                  duration={s.value > 100 ? 2400 : 1600}
                  delay={idx * 160}
                />
              </strong>
              <span className="mt-2 block text-base font-semibold text-white/95">{s.label}</span>
              <p className="mt-2 text-xs text-white/70 leading-relaxed">{s.detail}</p>
            </div>
          ))}
        </div>

        {/* Financial Transparency Banner with Clean Lucide Icons */}
        <div className="mt-12 rounded-3xl border border-white/15 bg-black/25 p-7 sm:p-9 backdrop-blur-sm shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-4 max-w-xl">
              <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gold/15 text-gold">
                <ShieldCheck className="size-6" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">Our 100% Stewardship Promise</h4>
                <p className="mt-1 text-sm text-white/75 leading-relaxed">
                  We are a zero-salary non-profit. All organizational time is gifted by volunteers so your cedis go straight into children&apos;s hands.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs font-medium">
              <span className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-gold border border-white/10">
                <Utensils className="size-3.5" />
                <span>85% Food &amp; School Supplies</span>
              </span>
              <span className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-white/90 border border-white/10">
                <Truck className="size-3.5" />
                <span>15% Convoy Logistics</span>
              </span>
              <span className="inline-flex items-center gap-2 rounded-xl bg-gold/20 px-4 py-2 text-gold border border-gold/30">
                <Check className="size-3.5" />
                <span>0% Admin Salaries</span>
              </span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
