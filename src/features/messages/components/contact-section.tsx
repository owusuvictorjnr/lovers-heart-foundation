import { ArrowUpRight, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Container } from "@/components/ui/section";
import { siteConfig } from "@/config/site";
import { ContactForm } from "./contact-form";

export function ContactSection() {
  const { contact } = siteConfig;
  const items = [
    {
      icon: MapPin,
      title: "Our Location",
      content: <span>{contact.address}</span>,
    },
    {
      icon: Phone,
      title: "Direct Phone Line",
      content: (
        <a href={contact.phoneHref} className="hover:text-forest transition-colors">
          {contact.phone}
        </a>
      ),
    },
    {
      icon: Mail,
      title: "Email Support",
      content: (
        <a href={`mailto:${contact.email}`} className="hover:text-forest transition-colors">
          {contact.email}
        </a>
      ),
    },
    {
      icon: MessageCircle,
      title: "WhatsApp Helpline",
      content: (
        <a
          href={`https://wa.me/${contact.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-1.5 font-bold text-forest hover:text-forest-light transition-colors"
        >
          <span>Chat directly on WhatsApp</span>
          <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </a>
      ),
    },
  ];

  return (
    <section id="contact" className="relative bg-sand/60 py-24 border-t border-line/60">
      <Container className="grid items-start gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <div>
          <p className="eyebrow">Get in Touch</p>
          <h2 className="text-[clamp(2.1rem,4vw,2.9rem)] font-bold tracking-tight text-ink">
            We&apos;d love to hear from you.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-muted leading-relaxed">
            Have questions about upcoming outreaches, item drop-offs, church partnerships, or corporate giving? Reach out to our coordination team anytime.
          </p>

          <div className="mt-8 space-y-4">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="flex items-center gap-4 rounded-2xl border border-line bg-cream-pure p-4.5 shadow-2xs transition hover:border-gold/60"
                >
                  <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-forest-soft text-forest">
                    <Icon className="size-5" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold tracking-wider text-muted uppercase">
                      {item.title}
                    </span>
                    <div className="mt-0.5 text-sm font-semibold text-ink">{item.content}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Contact Form Card */}
        <div className="rounded-3xl border border-line bg-cream-pure p-7 sm:p-9 shadow-sm">
          <h3 className="font-serif text-2xl font-bold text-ink mb-1">Send Us a Message</h3>
          <p className="text-sm text-muted mb-6">
            Fill out the form below and a team coordinator will respond promptly.
          </p>
          <ContactForm />
        </div>
      </Container>
    </section>
  );
}
