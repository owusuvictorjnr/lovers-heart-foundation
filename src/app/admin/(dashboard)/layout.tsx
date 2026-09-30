import type { Metadata } from "next";
import { AdminShell } from "@/features/admin/components/admin-shell";
import { requireAdmin } from "@/features/auth/lib/session";
import { countUnreadMessages } from "@/features/messages/queries";
import { countNewVolunteers } from "@/features/volunteers/queries";

export const metadata: Metadata = { title: { default: "Admin", template: "%s | Admin" }, robots: { index: false } };

export default async function DashboardLayout({ children }: LayoutProps<"/admin">) {
  const session = await requireAdmin();
  const [unreadMessages, newVolunteers] = await Promise.all([
    countUnreadMessages(),
    countNewVolunteers(),
  ]);

  return (
    <AdminShell
      session={session}
      unreadMessages={unreadMessages}
      newVolunteers={newVolunteers}
    >
      {children}
    </AdminShell>
  );
}
