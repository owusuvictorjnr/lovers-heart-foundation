import { notFound } from "next/navigation";
import { PageHeader } from "@/features/admin/components/page-header";
import { requireAdmin } from "@/features/auth/lib/session";
import { OutreachForm } from "@/features/outreach/components/admin/outreach-form";
import { getOutreach } from "@/features/outreach/queries";

export const metadata = { title: "Edit outreach" };

export default async function EditOutreachPage({ params }: PageProps<"/admin/outreach/[id]/edit">) {
  await requireAdmin();
  const outreach = await getOutreach((await params).id);
  if (!outreach) notFound();
  return (
    <>
      <PageHeader title={`Edit: ${outreach.year} outreach`} />
      <OutreachForm outreach={outreach} />
    </>
  );
}
