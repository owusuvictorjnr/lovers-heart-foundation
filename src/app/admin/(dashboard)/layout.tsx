import type { Metadata } from "next";
import { AdminShell } from "@/features/admin/components/admin-shell";
import { requireAdmin } from "@/features/auth/lib/session";

export const metadata: Metadata = { title: { default: "Admin", template: "%s | Admin" }, robots: { index: false } };

export default async function DashboardLayout({ children }: LayoutProps<"/admin">) {
  const session = await requireAdmin();
  return <AdminShell session={session}>{children}</AdminShell>;
}
