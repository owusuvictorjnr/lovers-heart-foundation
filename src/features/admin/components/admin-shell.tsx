import Link from "next/link";
import { logout } from "@/features/auth/actions";
import type { SessionPayload } from "@/features/auth/lib/token";
import { countUnreadMessages } from "@/features/messages/queries";
import { countNewVolunteers } from "@/features/volunteers/queries";
import { AdminNav } from "./admin-nav";

export async function AdminShell({ session, children }: { session: SessionPayload; children: React.ReactNode }) {
  const [unread, newVolunteers] = await Promise.all([countUnreadMessages(), countNewVolunteers()]);
  const items = [
    { href: "/admin", label: "Overview", icon: "📊" },
    { href: "/admin/donations", label: "Donations", icon: "💰" },
    { href: "/admin/gallery", label: "Gallery", icon: "🖼️" },
    { href: "/admin/homes", label: "Homes", icon: "🏠" },
    { href: "/admin/outreach", label: "Outreach", icon: "📅" },
    { href: "/admin/messages", label: "Messages", icon: "✉️", count: unread },
    { href: "/admin/volunteers", label: "Volunteers", icon: "🤝", count: newVolunteers },
  ];

  return (
    <div className="min-h-dvh bg-sand/50 lg:grid lg:grid-cols-[250px_1fr]">
      <aside className="sticky top-0 z-40 flex flex-col gap-4 bg-forest p-4 text-white lg:h-dvh lg:p-5">
        <div className="flex items-center justify-between">
          <Link href="/admin" className="font-serif text-lg font-bold">Lovers Heart <span className="font-sans text-xs font-medium text-gold">Admin</span></Link>
          <Link href="/" target="_blank" className="text-xs text-white/70 hover:text-white lg:hidden">View site ↗</Link>
        </div>
        <AdminNav items={items} />
        <div className="mt-auto hidden border-t border-white/15 pt-4 text-sm lg:block">
          <p className="font-semibold">{session.name}</p>
          <p className="truncate text-white/60">{session.email}</p>
          <div className="mt-3 flex gap-3">
            <Link href="/" target="_blank" className="text-white/70 hover:text-white">View site ↗</Link>
            <form action={logout}><button className="text-white/70 hover:text-white">Sign out</button></form>
          </div>
        </div>
      </aside>
      <main className="p-4 sm:p-8">{children}</main>
    </div>
  );
}
