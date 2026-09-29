import { ArrowUpRight, Heart, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Container } from "@/components/ui/section";
import { siteConfig } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="bg-forest-dark text-white/80">
      <div className="kente" aria-hidden />

      <Container className="pt-16 pb-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4 pb-12 border-b border-white/10">
          {/* Col 1: Brand & Mission */}
          <div className="lg:col-span-2 max-w-md">
            <Logo light />
            <p className="mt-4 text-sm text-white/75 leading-relaxed">
              {siteConfig.description}
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-semibold text-gold">
              <ShieldCheck className="size-4" />
              <span>100% Volunteer-Led &amp; Direct Giving NGO in Ghana</span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div>
            <h4 className="font-serif text-base font-bold text-white mb-4">Quick Navigation</h4>
            <ul className="space-y-2.5 text-sm text-white/70">
              <li>
                <a href="/#about" className="hover:text-gold transition-colors">About Our Mission</a>
              </li>
              <li>
                <a href="/#impact" className="hover:text-gold transition-colors">Impact &amp; Transparency</a>
              </li>
              <li>
                <a href="/#homes" className="hover:text-gold transition-colors">Partner Homes</a>
              </li>
              <li>
                <a href="/#outreach" className="hover:text-gold transition-colors">Annual Outreaches</a>
              </li>
              <li>
                <a href="/#gallery" className="hover:text-gold transition-colors">Outreach Photo Gallery</a>
              </li>
            </ul>
          </div>

          {/* Col 3: Ways to Help & Social */}
          <div>
            <h4 className="font-serif text-base font-bold text-white mb-4">Support &amp; Connect</h4>
            <ul className="space-y-2.5 text-sm text-white/70">
              <li>
                <a href="/#donate" className="inline-flex items-center gap-1.5 text-gold font-semibold hover:underline">
                  <Heart className="size-3.5 fill-gold/20" />
                  <span>Donate via MoMo</span>
                </a>
              </li>
              <li>
                <a href="/#volunteer" className="hover:text-gold transition-colors">Sign Up as Volunteer</a>
              </li>
              <li>
                <a href="/#contact" className="hover:text-gold transition-colors">In-Kind Donations Drop-off</a>
              </li>
              <li className="pt-2 flex gap-3 text-xs">
                {siteConfig.socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    className="rounded-lg bg-white/10 px-2.5 py-1 text-white/80 hover:bg-gold hover:text-ink transition"
                  >
                    {s.label}
                  </a>
                ))}
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-wrap items-center justify-between gap-4 text-xs text-white/50">
          <p>© {new Date().getFullYear()} {siteConfig.name}. All rights reserved. Accra, Ghana.</p>
          <div className="flex items-center gap-6">
            <a
              href="/admin/login"
              className="group inline-flex items-center gap-1.5 text-white/60 hover:text-gold transition-colors"
            >
              <span>Staff &amp; Admin Portal</span>
              <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
