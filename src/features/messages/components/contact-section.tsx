import { Container } from "@/components/ui/section";
import { siteConfig } from "@/config/site";
import { ContactForm } from "./contact-form";

export function ContactSection() {
  const { contact } = siteConfig;
  const items = [
    { icon: "📍", content: contact.address },
    { icon: "📞", content: <a href={contact.phoneHref}>{contact.phone}</a> },
    { icon: "✉️", content: <a href={`mailto:${contact.email}`}>{contact.email}</a> },
    { icon: "💬", content: <a href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noopener noreferrer">Chat on WhatsApp</a> },
  ];

  return (
    <section id="contact" className="bg-sand py-24">
      <Container className="grid items-start gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <div>
          <p className="eyebrow">Contact</p>
          <h2 className="text-[clamp(1.8rem,3.5vw,2.6rem)]">Let&apos;s talk.</h2>
          <p className="mt-3 text-muted">Questions, partnerships or item donations: reach out any time.</p>
          <ul className="mt-8 grid gap-4">
            {items.map((item) => (
              <li key={item.icon} className="flex items-center gap-3 [&_a]:font-medium [&_a]:text-forest">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-line bg-white">{item.icon}</span>
                {item.content}
              </li>
            ))}
          </ul>
        </div>
        <ContactForm />
      </Container>
    </section>
  );
}
