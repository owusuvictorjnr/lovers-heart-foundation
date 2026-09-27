import { Container, SectionHeading } from "@/components/ui/section";
import type { getImpactStats } from "../queries";

export function ImpactSection({ stats }: { stats: Awaited<ReturnType<typeof getImpactStats>> }) {
  const items = [
    { value: stats.homes, label: "Children's homes supported" },
    { value: stats.children, label: "Children reached", plus: true },
    { value: stats.regions, label: "Regions of Ghana" },
    { value: stats.volunteers, label: "Volunteers", plus: true },
  ];
  return (
    <section id="impact" className="bg-forest py-24 text-white">
      <Container>
        <SectionHeading dark center eyebrow="Our impact so far" title="Small gifts, added up over the years." />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((s) => (
            <div key={s.label} className="rounded-2xl border border-white/15 bg-white/5 px-4 py-8 text-center">
              <strong className="block font-serif text-[clamp(2.2rem,4vw,3.2rem)] leading-tight text-gold">
                {s.value.toLocaleString()}{s.plus && s.value > 0 ? "+" : ""}
              </strong>
              <span className="text-[15px] text-white/80">{s.label}</span>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
