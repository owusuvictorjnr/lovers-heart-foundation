import { Building2, HandHeart, Megaphone } from "lucide-react";
import { Container, SectionHeading } from "@/components/ui/section";
import { VolunteerForm } from "./volunteer-form";

const ways = [
  {
    icon: HandHeart,
    title: "Hands-On Volunteer",
    text: "Join our convoy on outreach day to pack boxes, distribute food supplies, play games, and mentor the children.",
    tag: "Individual",
  },
  {
    icon: Building2,
    title: "Church & Corporate Partner",
    text: "Partner with us as a congregation, fellowship, school, or corporate CSR team to sponsor a specific children's home.",
    tag: "Organization",
  },
  {
    icon: Megaphone,
    title: "Community Ambassador",
    text: "Amplify the mission in your community, coordinate local supply donation drives, and help us expand to new regions.",
    tag: "Community",
  },
];

export function GetInvolvedSection() {
  return (
    <section id="volunteer" className="py-24 bg-cream">
      <Container>
        <SectionHeading
          center
          eyebrow="Join the Movement"
          title="More Ways to Extend a Helping Hand"
          description="Whether you have time, resources, or an eager voice, every hand makes our outreach stronger."
        />

        {/* 3 Pathway Cards with Clean Lucide Icons */}
        <div className="grid gap-7 md:grid-cols-3">
          {ways.map((w) => {
            const Icon = w.icon;
            return (
              <div
                key={w.title}
                className="group relative flex flex-col rounded-3xl border border-line bg-cream-pure p-7 shadow-xs transition duration-300 hover:-translate-y-1 hover:border-gold/60 hover:shadow-md"
              >
                <div className="mb-5 flex items-center justify-between">
                  <div className="grid size-12 place-items-center rounded-2xl bg-forest-soft text-forest transition duration-300 group-hover:bg-forest group-hover:text-gold">
                    <Icon className="size-6" />
                  </div>
                  <span className="rounded-full bg-sand border border-line/80 px-3 py-1 text-xs font-bold text-muted">
                    {w.tag}
                  </span>
                </div>
                <h3 className="font-serif text-xl font-bold text-ink">{w.title}</h3>
                <p className="mt-2 text-sm text-muted leading-relaxed">{w.text}</p>
              </div>
            );
          })}
        </div>

        {/* Volunteer Signup Form Container */}
        <div className="mt-12 rounded-3xl border border-line bg-cream-pure p-7 sm:p-10 shadow-sm">
          <div className="max-w-2xl mb-6">
            <span className="eyebrow mb-1">Get On Our Roster</span>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-ink">
              Sign Up as an Outreach Volunteer
            </h3>
            <p className="mt-2 text-sm sm:text-base text-muted">
              Leave your details below. Our team will contact you with orientation details ahead of the upcoming outreach.
            </p>
          </div>
          <VolunteerForm />
        </div>
      </Container>
    </section>
  );
}
