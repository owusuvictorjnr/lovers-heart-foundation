import { notFound } from "next/navigation";
import { PageHeader } from "@/features/admin/components/page-header";
import { requireAdmin } from "@/features/auth/lib/session";
import { HomeForm } from "@/features/homes/components/admin/home-form";
import { getHome } from "@/features/homes/queries";

export const metadata = { title: "Edit home" };

export default async function EditHomePage({ params }: PageProps<"/admin/homes/[id]/edit">) {
  await requireAdmin();
  const home = await getHome((await params).id);
  if (!home) notFound();
  return (
    <>
      <PageHeader title={`Edit: ${home.name}`} />
      <HomeForm home={home} />
    </>
  );
}
