import { Container, SectionHeading } from "@/components/ui/section";
import { VolunteerForm } from "./volunteer-form";

const ways = [
  { icon: "🤝", title: "Volunteer", text: "Join us on outreach day to pack, deliver and spend time with the children." },
  { icon: "⛪", title: "Partner with us", text: "Churches, schools and businesses can sponsor a home or run a collection drive." },
  { icon: "📣", title: "Spread the word", text: "Share our work with friends and family. Every share helps us reach more homes." },
];

export function GetInvolvedSection() {
  return (
    <section id="volunteer" className="py-24">
      <Container>
        <SectionHeading center eyebrow="Get involved" title="More ways to help" />
        <div className="grid gap-7 md:grid-cols-3">
          {ways.map((w) => (
            <div key={w.title} className="rounded-2xl border border-line bg-white p-8">
              <div className="mb-4 grid size-14 place-items-center rounded-2xl bg-gold-soft text-3xl">{w.icon}</div>
              <h3 className="text-xl">{w.title}</h3>
              <p className="mt-1.5 text-[15px] text-muted">{w.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 rounded-2xl border border-line bg-white p-6 sm:p-8">
          <h3 className="mb-1 text-2xl">Sign up to volunteer</h3>
          <p className="mb-5 text-muted">Leave your details and we&apos;ll reach out before our next outreach.</p>
          <VolunteerForm />
        </div>
      </Container>
    </section>
  );
}
