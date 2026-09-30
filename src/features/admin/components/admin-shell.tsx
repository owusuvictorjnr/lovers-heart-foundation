"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Building2,
  CalendarHeart,
  ChevronRight,
  ExternalLink,
  HeartHandshake,
  Images,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { logout } from "@/features/auth/actions";
import type { SessionPayload } from "@/features/auth/lib/token";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
};

export function AdminShell({
  session,
  unreadMessages,
  newVolunteers,
  children,
}: {
  session: SessionPayload;
  unreadMessages: number;
  newVolunteers: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Restore collapsed preference
  useEffect(() => {
    try {
      const saved = localStorage.getItem("lhf_admin_sidebar_collapsed");
      if (saved !== null) {
        setCollapsed(saved === "true");
      }
    } catch {
      // Ignore localStorage errors in private mode
    }
  }, []);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("lhf_admin_sidebar_collapsed", String(next));
      } catch {
        // Ignore
      }
      return next;
    });
  }

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const navItems: NavItem[] = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/content", label: "Homepage CMS", icon: Sparkles },
    { href: "/admin/donations", label: "Donations", icon: HeartHandshake },
    { href: "/admin/gallery", label: "Gallery", icon: Images },
    { href: "/admin/homes", label: "Partner Homes", icon: Building2 },
    { href: "/admin/outreach", label: "Outreaches", icon: CalendarHeart },
    { href: "/admin/messages", label: "Messages", icon: Inbox, count: unreadMessages },
    { href: "/admin/volunteers", label: "Volunteers", icon: Users, count: newVolunteers },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ];

  const currentItem =
    navItems.find((i) => (i.href === "/admin" ? pathname === "/admin" : pathname.startsWith(i.href))) ??
    navItems[0];

  const initials = session.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "AD";

  return (
    <div className="min-h-dvh bg-cream">
      {/* Mobile Top App Bar */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-cream-pure px-4 lg:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle Navigation Menu"
            className="grid size-10 place-items-center rounded-xl border border-line bg-sand/60 text-ink cursor-pointer hover:bg-sand"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
          <Link href="/admin" className="flex items-center gap-2 font-serif text-lg font-bold text-forest">
            <span>Lovers Heart</span>
            <span className="rounded-md bg-gold-soft px-1.5 py-0.5 text-[10px] font-sans font-bold text-gold-deep uppercase">
              Admin
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1 text-xs font-semibold text-muted hover:text-ink"
          >
            <span>Live Site</span>
            <ExternalLink className="size-3" />
          </Link>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-forest-dark p-5 text-white transition-transform duration-300 ease-in-out lg:hidden",
          mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <Link href="/admin" className="font-serif text-lg font-bold text-white">
            Lovers Heart <span className="text-xs font-sans font-semibold text-gold">Admin</span>
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
            className="grid size-9 place-items-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="mt-4 flex flex-1 flex-col gap-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition",
                  active
                    ? "bg-white/15 text-white shadow-xs font-semibold"
                    : "text-white/70 hover:bg-white/10 hover:text-white",
                )}
              >
                <Icon className={cn("size-5", active ? "text-gold" : "text-white/70")} />
                <span>{item.label}</span>
                {!!item.count && (
                  <span className="ml-auto rounded-full bg-gold px-2 py-0.5 text-xs font-bold text-ink">
                    {item.count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-white/10 pt-4">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-xl bg-forest-light text-gold text-xs font-bold">
              {initials}
            </div>
            <div className="min-w-0 flex-1 text-xs">
              <p className="font-bold text-white truncate">{session.name}</p>
              <p className="text-white/60 truncate">{session.email}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-white/70 pt-2">
            <Link href="/" target="_blank" className="hover:text-gold flex items-center gap-1">
              <span>View Site</span>
              <ExternalLink className="size-3" />
            </Link>
            <form action={logout}>
              <button type="submit" className="hover:text-clay cursor-pointer flex items-center gap-1">
                <LogOut className="size-3" />
                <span>Sign Out</span>
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main Desktop Grid */}
      <div
        className={cn(
          "hidden lg:grid min-h-dvh transition-all duration-300 ease-in-out",
          collapsed ? "grid-cols-[80px_1fr]" : "grid-cols-[260px_1fr]",
        )}
      >
        {/* Desktop Collapsible Sidebar */}
        <aside
          className={cn(
            "sticky top-0 z-40 flex h-dvh flex-col border-r border-white/10 bg-forest-dark text-white transition-all duration-300 ease-in-out",
            collapsed ? "w-20 p-3" : "w-[260px] p-5",
          )}
        >
          {/* Header & Collapse Toggle */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            {!collapsed ? (
              <Link href="/admin" className="group flex items-center gap-2 font-serif text-lg font-bold text-white">
                <span className="grid size-8 place-items-center rounded-lg bg-forest text-gold text-xs font-bold shadow-xs">
                  LH
                </span>
                <div className="flex flex-col">
                  <span className="leading-none text-base">Lovers Heart</span>
                  <span className="text-[10px] font-sans font-semibold tracking-wider text-gold uppercase mt-0.5">
                    Admin Portal
                  </span>
                </div>
              </Link>
            ) : (
              <Link href="/admin" className="mx-auto grid size-9 place-items-center rounded-xl bg-forest text-gold font-bold shadow-xs" title="Lovers Heart Admin">
                LH
              </Link>
            )}

            <button
              type="button"
              onClick={toggleCollapsed}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className={cn(
                "cursor-pointer rounded-lg p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white",
                collapsed && "mt-2 mx-auto",
              )}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <PanelLeftOpen className="size-4.5" /> : <PanelLeftClose className="size-4.5" />}
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="mt-4 flex flex-1 flex-col gap-1.5 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-xl transition duration-150",
                    collapsed ? "justify-center p-2.5" : "px-3.5 py-2.5 text-sm",
                    active
                      ? "bg-white/15 text-white font-semibold shadow-xs"
                      : "text-white/70 hover:bg-white/10 hover:text-white",
                  )}
                >
                  <Icon className={cn("size-5 shrink-0 transition-colors", active ? "text-gold" : "text-white/70 group-hover:text-white")} />
                  {!collapsed && (
                    <>
                      <span className="truncate">{item.label}</span>
                      {!!item.count && (
                        <span className="ml-auto rounded-full bg-gold px-2 py-0.5 text-xs font-bold text-ink shadow-xs">
                          {item.count}
                        </span>
                      )}
                    </>
                  )}
                  {collapsed && !!item.count && (
                    <span className="absolute top-1 right-1 size-2.5 rounded-full bg-gold ring-2 ring-forest-dark" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Profile Card */}
          <div className="mt-auto border-t border-white/10 pt-4">
            {!collapsed ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <div className="flex items-center gap-3">
                  <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-forest-light text-gold text-xs font-bold">
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1 text-xs">
                    <p className="font-bold text-white truncate">{session.name}</p>
                    <p className="text-white/60 truncate text-[11px]">{session.email}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2.5 text-xs">
                  <Link
                    href="/"
                    target="_blank"
                    className="inline-flex items-center gap-1 text-white/70 hover:text-gold transition-colors"
                  >
                    <span>View site</span>
                    <ExternalLink className="size-3" />
                  </Link>
                  <form action={logout}>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1 text-white/70 hover:text-clay transition-colors cursor-pointer"
                    >
                      <LogOut className="size-3" />
                      <span>Sign out</span>
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="grid size-9 place-items-center rounded-xl bg-forest-light text-gold text-xs font-bold" title={`${session.name} (${session.email})`}>
                  {initials}
                </div>
                <Link
                  href="/"
                  target="_blank"
                  className="grid size-8 place-items-center rounded-lg text-white/60 hover:bg-white/10 hover:text-gold"
                  title="View Live Site"
                >
                  <ExternalLink className="size-4" />
                </Link>
                <form action={logout}>
                  <button
                    type="submit"
                    className="grid size-8 place-items-center rounded-lg text-white/60 hover:bg-white/10 hover:text-clay cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut className="size-4" />
                  </button>
                </form>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex flex-col min-w-0">
          {/* Top Desktop Breadcrumb Ribbon */}
          <div className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-line bg-cream/90 px-8 backdrop-blur-md">
            <div className="flex items-center gap-2 text-sm text-muted">
              <Link href="/admin" className="font-semibold text-forest hover:underline">
                Admin
              </Link>
              <ChevronRight className="size-3.5 text-muted-light" />
              <span className="font-bold text-ink">{currentItem.label}</span>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/"
                target="_blank"
                className="inline-flex items-center gap-1.5 rounded-full border border-line bg-cream-pure px-3.5 py-1.5 text-xs font-semibold text-ink shadow-2xs hover:border-gold hover:text-forest transition"
              >
                <span>View Live Site</span>
                <ExternalLink className="size-3.5 text-forest" />
              </Link>
            </div>
          </div>

          <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">{children}</main>
        </div>
      </div>

      {/* Mobile Main Content */}
      <main className="p-4 sm:p-6 lg:hidden">{children}</main>
    </div>
  );
}
