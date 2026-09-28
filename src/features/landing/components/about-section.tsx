import { PhotoPlaceholder } from "@/components/ui/photo-placeholder";
import { Container } from "@/components/ui/section";

const values = [
  { title: "Compassion", text: "We treat every child as family." },
  { title: "Transparency", text: "Every cedi given goes to the homes." },
  { title: "Presence", text: "We don't just send gifts. We show up." },
];

export function AboutSection() {
  return (
    <section id="about" className="py-24">
      <Container className="grid items-center gap-12 lg:grid-cols-[.9fr_1.1fr] lg:gap-16">
        <PhotoPlaceholder label="Photo: founder / team" tone={1} className="aspect-[4/5] rounded-2xl" />
        <div>
          <p className="eyebrow">Who we are</p>
          <h2 className="text-[clamp(1.8rem,3.5vw,2.6rem)]">Faith in action, one home at a time.</h2>
          <p className="mt-4">
            Lovers Heart Foundation started with a simple belief: the children in Ghana&apos;s orphanages and children&apos;s homes are not
            forgotten. Founded out of deep compassion and love, we are dedicated to extending hope, nourishment, and educational support to vulnerable children across Ghanaian communities.
          </p>
          <p className="mt-4">
            Each year we raise support from individuals, churches and businesses. Then we visit the homes ourselves with
            everything they&apos;ve asked for, and we spend the day with the children.
          </p>
          <ul className="mt-8 grid gap-4">
            {values.map((v) => (
              <li key={v.title} className="flex gap-3.5">
                <span className="mt-2 size-3 shrink-0 rounded-full bg-gold shadow-[0_0_0_5px_var(--color-gold-soft)]" />
                <div className="text-muted"><strong className="block text-ink">{v.title}</strong>{v.text}</div>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
