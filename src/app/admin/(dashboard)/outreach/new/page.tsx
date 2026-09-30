import { PageHeader } from "@/features/admin/components/page-header";
import { requireAdmin } from "@/features/auth/lib/session";
import { OutreachForm } from "@/features/outreach/components/admin/outreach-form";

export const metadata = { title: "Add outreach" };

export default async function NewOutreachPage() {
  await requireAdmin();
  return (
    <>
      <PageHeader title="Add outreach" />
      <OutreachForm />
    </>
  );
}
