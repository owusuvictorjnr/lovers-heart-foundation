import Image from "next/image";
import { Badge } from "@/components/ui/card";
import { PhotoPlaceholder } from "@/components/ui/photo-placeholder";
import { Container, SectionHeading } from "@/components/ui/section";
import { listPublishedHomes } from "../queries";

export async function HomesSection() {
  const homes = await listPublishedHomes();
  if (!homes.length) return null;

  return (
    <section id="homes" className="py-24">
      <Container>
        <SectionHeading eyebrow="Homes we support" title="Partner children's homes" />
        <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
          {homes.map((home, i) => (
            <article key={home.id} className="overflow-hidden rounded-2xl border border-line bg-white transition hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(29,26,22,.08)]">
              {home.imageUrl ? (
                <div className="relative aspect-[16/10]">
                  <Image src={home.imageUrl} alt={home.name} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
                </div>
              ) : (
                <PhotoPlaceholder label="Home photo" tone={i} className="aspect-[16/10]" />
              )}
              <div className="p-6">
                <Badge>{home.region}</Badge>
                <h3 className="mt-2.5 mb-1.5 text-xl">{home.name}</h3>
                <p className="text-[15px] text-muted">{home.description}</p>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
