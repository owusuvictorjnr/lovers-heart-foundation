import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/section";
import { formatDate } from "@/lib/utils";
import { listOutreach } from "../queries";

export async function OutreachSection() {
  const events = await listOutreach(6);
  if (!events.length) return null;

  return (
    <section id="outreach" className="bg-sand py-24">
      <Container className="grid items-start gap-12 lg:grid-cols-[.9fr_1.1fr] lg:gap-16">
        <div>
          <p className="eyebrow">Annual outreach</p>
          <h2 className="text-[clamp(1.8rem,3.5vw,2.6rem)]">A year of giving, in brief.</h2>
          <p className="mt-3 text-muted">
            Each year we raise support, gather what the homes need, and spend a day with the children.
          </p>
          <ButtonLink href="#donate" className="mt-7">Support this year&apos;s outreach</ButtonLink>
        </div>

        <ol className="relative pl-8 before:absolute before:top-2 before:bottom-2 before:left-1.5 before:w-0.5 before:bg-line">
          {events.map((e) => (
            <li key={e.id} className="relative mb-4 rounded-2xl border border-line bg-white px-6 py-5">
              <span
                className={`absolute top-6 -left-8 size-3.5 rounded-full border-3 border-sand ${e.upcoming ? "bg-gold" : "bg-forest"}`}
                aria-hidden
              />
              <span className="text-xs font-semibold tracking-wider text-forest-light">{e.year}</span>
              <h3 className="mt-0.5 mb-1 flex flex-wrap items-center gap-2 text-lg">
                {e.title}
                {e.upcoming && <em className="rounded-full bg-gold px-2 py-0.5 font-sans text-[11px] font-semibold not-italic">Upcoming</em>}
              </h3>
              <p className="text-[15px] text-muted">{e.summary}</p>
              {(e.date || e.homesCount > 0 || e.childrenReached > 0) && (
                <p className="mt-2 text-sm text-muted">
                  {[
                    e.date && formatDate(e.date),
                    e.homesCount > 0 && `${e.homesCount} homes`,
                    e.childrenReached > 0 && `${e.childrenReached.toLocaleString()} children`,
                  ].filter(Boolean).join(" · ")}
                </p>
              )}
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
