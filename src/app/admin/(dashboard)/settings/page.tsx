import { requireAdmin } from "@/features/auth/lib/session";
import { ChangePasswordForm } from "@/features/auth/components/change-password-form";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const session = await requireAdmin();

  return (
    <div className="grid gap-8">
      <div>
        <h1 className="font-serif text-3xl font-bold">Settings</h1>
        <p className="mt-1 text-muted">Manage your admin profile and security credentials.</p>
      </div>

      <div className="grid gap-6">
        <section className="rounded-2xl border border-clay/20 bg-white p-6 shadow-sm">
          <h2 className="font-serif text-xl font-semibold">Account Profile</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-sand/30 p-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">Admin Name</span>
              <p className="mt-1 font-medium text-ink">{session.name}</p>
            </div>
            <div className="rounded-xl bg-sand/30 p-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">Email Address</span>
              <p className="mt-1 font-medium text-ink">{session.email}</p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-clay/20 bg-white p-6 shadow-sm">
          <h2 className="font-serif text-xl font-semibold">Change Password</h2>
          <p className="mt-1 text-sm text-muted">Ensure your account uses a strong password with at least 10 characters.</p>
          <div className="mt-6">
            <ChangePasswordForm />
          </div>
        </section>
      </div>
    </div>
  );
}
