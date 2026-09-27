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

// Rebuilt at most hourly; admin changes trigger an immediate refresh via revalidatePath("/")
export const revalidate = 3600;

export default async function HomePage() {
  const stats = await getImpactStats();
  return (
    <>
      <HeroSection years={stats.years} />
      <AboutSection />
      <ImpactSection stats={stats} />
      <HomesSection />
      <OutreachSection />
      <GallerySection />
      <DonateSection />
      <GetInvolvedSection />
      <ContactSection />
    </>
  );
}
