import { Container, SectionHeading } from "@/components/ui/section";
import { listPublishedHomes } from "../queries";
import { HomesGrid } from "./homes-grid";

export async function HomesSection() {
  const homes = await listPublishedHomes();
  if (!homes.length) return null;

  return (
    <section id="homes" className="py-24 bg-cream">
      <Container>
        <SectionHeading
          center
          eyebrow="Homes We Support"
          title="Partner Children&apos;s Homes in Ghana"
          description="We partner with registered care homes and orphanages to understand their most urgent needs before every visit."
        />

        <HomesGrid homes={homes} />
      </Container>
    </section>
  );
}
