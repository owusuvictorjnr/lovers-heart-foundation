import { requireAdmin } from "@/features/auth/lib/session";
import {
  getAboutContent,
  getHeroContent,
  getOutreachContent,
} from "@/features/content/queries";
import {
  AboutContentForm,
  ContentTabs,
  HeroContentForm,
  OutreachContentForm,
} from "@/features/content/components";

export const metadata = { title: "Homepage CMS & Photos" };

export default async function AdminContentPage() {
  await requireAdmin();

  const [hero, about, outreach] = await Promise.all([
    getHeroContent(),
    getAboutContent(),
    getOutreachContent(),
  ]);

  return (
    <div className="grid gap-8">
      <div>
        <h1 className="font-serif text-3xl font-bold text-ink">
          Homepage Content &amp; Media CMS
        </h1>
        <p className="mt-1 text-muted">
          Update the headlines, narrative paragraphs, photo carousels, and quotes displayed on the public landing page.
        </p>
      </div>

      <ContentTabs
        heroForm={<HeroContentForm initialData={hero} />}
        aboutForm={<AboutContentForm initialData={about} />}
        outreachForm={<OutreachContentForm initialData={outreach} />}
      />
    </div>
  );
}
