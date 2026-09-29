import { DonateSection } from "@/features/donations/components/donate-section";
import { GallerySection } from "@/features/gallery/components/gallery-section";
import { HomesSection } from "@/features/homes/components/homes-section";
import { AboutSection } from "@/features/landing/components/about-section";
import { HeroSection } from "@/features/landing/components/hero-section";
import { ImpactSection } from "@/features/landing/components/impact-section";
import { getImpactStats } from "@/features/landing/queries";
import { ContactSection } from "@/features/messages/components/contact-section";
import { OutreachSection } from "@/features/outreach/components/outreach-section";
import { GetInvolvedSection } from "@/features/volunteers/components/get-involved-section";
import {
  getAboutContent,
  getHeroContent,
  getOutreachContent,
} from "@/features/content/queries";

// Always fetch fresh content from the database on page request
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const [stats, heroContent, aboutContent, outreachContent] = await Promise.all([
    getImpactStats(),
    getHeroContent(),
    getAboutContent(),
    getOutreachContent(),
  ]);

  return (
    <>
      <HeroSection years={stats.years} content={heroContent} />
      <AboutSection content={aboutContent} />
      <ImpactSection stats={stats} />
      <HomesSection />
      <OutreachSection content={outreachContent} />
      <GallerySection />
      <DonateSection />
      <GetInvolvedSection />
      <ContactSection />
    </>
  );
}
