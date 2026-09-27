import { PageHeader } from "@/features/admin/components/page-header";
import { requireAdmin } from "@/features/auth/lib/session";
import { VolunteerTable } from "@/features/volunteers/components/admin/volunteer-table";
import { listVolunteers } from "@/features/volunteers/queries";

export const metadata = { title: "Volunteers" };

export default async function VolunteersPage() {
  await requireAdmin();
  const volunteers = await listVolunteers();
  return (
    <>
      <PageHeader title="Volunteers" description={`${volunteers.length} sign-up${volunteers.length === 1 ? "" : "s"}`} />
      <VolunteerTable volunteers={volunteers} />
    </>
  );
}
