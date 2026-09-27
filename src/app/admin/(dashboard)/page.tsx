import Link from "next/link";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/features/admin/components/page-header";
import { StatCard } from "@/features/admin/components/stat-card";
import { requireAdmin } from "@/features/auth/lib/session";
import { getDonationStats } from "@/features/donations/queries";
import { getImpactStats } from "@/features/landing/queries";
import { formatCedis, formatDate } from "@/lib/utils";

export default async function AdminOverviewPage() {
  const session = await requireAdmin();
  const [donations, impact] = await Promise.all([getDonationStats(), getImpactStats()]);

  return (
    <>
      <PageHeader title={`Welcome, ${session.name.split(" ")[0]}`} description="Here's how things are going." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Raised this month" value={formatCedis(donations.thisMonth.amount, { decimals: false })} sub={`${donations.thisMonth.count} donations`} />
        <StatCard label={`Raised in ${new Date().getFullYear()}`} value={formatCedis(donations.thisYear.amount, { decimals: false })} sub={`${donations.thisYear.count} donations`} />
        <StatCard label="Raised all time" value={formatCedis(donations.allTime.amount, { decimals: false })} sub={`${donations.allTime.count} donations`} />
        <StatCard label="Homes supported" value={String(impact.homes)} sub={`${impact.children.toLocaleString()} children reached`} />
      </div>

      <Card className="mt-6 p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl">Latest donations</h2>
          <Link href="/admin/donations" className="text-sm font-semibold text-forest">View all →</Link>
        </div>
        {donations.recent.length ? (
          <ul className="divide-y divide-line">
            {donations.recent.map((d) => (
              <li key={d.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div>
                  <p className="font-semibold">{d.donorName}{d.anonymous && <span className="ml-1 text-xs font-normal text-muted">(anonymous)</span>}</p>
                  <p className="text-sm text-muted">{d.paidAt && formatDate(d.paidAt, true)}</p>
                </div>
                <p className="font-semibold text-forest">{formatCedis(d.amount)}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-6 text-center text-muted">No successful donations yet.</p>
        )}
      </Card>
    </>
  );
}
