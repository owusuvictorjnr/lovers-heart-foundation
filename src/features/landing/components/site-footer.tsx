import { Logo } from "@/components/ui/logo";
import { Container } from "@/components/ui/section";
import { siteConfig } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="bg-ink text-white/75">
      <div className="kente" aria-hidden />
      <Container className="flex flex-wrap items-center justify-between gap-8 pt-12 pb-8">
        <div>
          <Logo light />
          <p className="mt-3">{siteConfig.tagline}</p>
        </div>
        <nav aria-label="Social" className="flex gap-6">
          {siteConfig.socials.map((s) => (
            <a key={s.label} href={s.href} className="hover:text-gold">{s.label}</a>
          ))}
        </nav>
      </Container>
      <Container className="border-t border-white/10 py-5 text-sm">
        © {new Date().getFullYear()} {siteConfig.name} · Ghana
      </Container>
    </footer>
  );
}
