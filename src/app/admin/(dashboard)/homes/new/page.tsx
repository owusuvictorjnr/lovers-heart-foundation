import { PageHeader } from "@/features/admin/components/page-header";
import { requireAdmin } from "@/features/auth/lib/session";
import { HomeForm } from "@/features/homes/components/admin/home-form";

export const metadata = { title: "Add home" };

export default async function NewHomePage() {
  await requireAdmin();
  return (
    <>
      <PageHeader title="Add a children's home" />
      <HomeForm />
    </>
  );
}
