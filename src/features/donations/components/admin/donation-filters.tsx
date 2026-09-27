import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/field";
import type { DonationFilters as Filters } from "../../schemas";
import { donationStatuses } from "../../schemas";

/** Plain GET form: filters live in the URL so they're shareable and work without JS. */
export function DonationFilters({ filters }: { filters: Filters }) {
  const iso = (d?: Date) => d?.toISOString().slice(0, 10);
  const exportParams = new URLSearchParams(
    Object.entries({ status: filters.status, q: filters.q, from: iso(filters.from), to: iso(filters.to) }).filter(
      (e): e is [string, string] => !!e[1],
    ),
  );

  return (
    <form className="mb-5 flex flex-wrap items-end gap-3 rounded-2xl border border-line bg-white p-4">
      <label className="grid flex-1 basis-56 gap-1 text-xs font-semibold text-muted">
        Search
        <Input name="q" defaultValue={filters.q} placeholder="Name, email or reference" className="py-2" />
      </label>
      <label className="grid gap-1 text-xs font-semibold text-muted">
        Status
        <Select name="status" defaultValue={filters.status ?? ""} className="py-2">
          <option value="">All</option>
          {donationStatuses.map((s) => <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>)}
        </Select>
      </label>
      <label className="grid gap-1 text-xs font-semibold text-muted">
        From <Input type="date" name="from" defaultValue={iso(filters.from)} className="py-2" />
      </label>
      <label className="grid gap-1 text-xs font-semibold text-muted">
        To <Input type="date" name="to" defaultValue={iso(filters.to)} className="py-2" />
      </label>
      <button className={buttonClasses({ variant: "forest", size: "sm", className: "py-2.5" })}>Filter</button>
      <Link href="/admin/donations" className={buttonClasses({ variant: "subtle", size: "sm", className: "py-2.5" })}>Reset</Link>
      <a href={`/api/admin/donations/export?${exportParams}`} className={buttonClasses({ variant: "outline", size: "sm", className: "ml-auto py-2.5" })}>
        ⬇ Export CSV
      </a>
    </form>
  );
}
