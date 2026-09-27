import Link from "next/link";
import type { Donation } from "@/generated/prisma/client";
import { cn, formatCedis, formatDate } from "@/lib/utils";
import { DonationStatusBadge } from "./donation-status-badge";

export function DonationsTable({ donations }: { donations: Donation[] }) {
  if (!donations.length) return <p className="rounded-2xl border border-line bg-white py-12 text-center text-muted">No donations match.</p>;
  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-white">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="border-b border-line bg-sand/60 text-xs tracking-wider text-muted uppercase">
          <tr>
            <th className="p-3">Date</th><th className="p-3">Donor</th><th className="p-3 text-right">Amount</th>
            <th className="p-3">Status</th><th className="p-3">Channel</th><th className="p-3">Reference</th>
          </tr>
        </thead>
        <tbody>
          {donations.map((d) => (
            <tr key={d.id} className="border-b border-line last:border-0">
              <td className="p-3 whitespace-nowrap text-muted">{formatDate(d.paidAt ?? d.createdAt, true)}</td>
              <td className="p-3">
                <span className="font-semibold">{d.donorName}</span>
                {d.anonymous && <span className="ml-1.5 text-xs text-muted">(anonymous)</span>}
                <span className="block text-muted">{d.email}{d.phone && ` · ${d.phone}`}</span>
              </td>
              <td className="p-3 text-right font-semibold whitespace-nowrap">{formatCedis(d.amount)}</td>
              <td className="p-3"><DonationStatusBadge status={d.status} /></td>
              <td className="p-3 text-muted capitalize">{d.channel?.replace("_", " ") ?? "—"}</td>
              <td className="p-3 font-mono text-xs text-muted">{d.reference}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Pagination({ page, pages, params }: { page: number; pages: number; params: Record<string, string | undefined> }) {
  if (pages <= 1) return null;
  const href = (p: number) => `?${new URLSearchParams({ ...Object.fromEntries(Object.entries(params).filter(([, v]) => v)), page: String(p) } as Record<string, string>)}`;
  return (
    <div className="mt-4 flex items-center justify-center gap-2 text-sm">
      <Link href={href(page - 1)} aria-disabled={page <= 1} className={cn("rounded-full border border-line bg-white px-3 py-1.5", page <= 1 && "pointer-events-none opacity-40")}>← Prev</Link>
      <span className="text-muted">Page {page} of {pages}</span>
      <Link href={href(page + 1)} aria-disabled={page >= pages} className={cn("rounded-full border border-line bg-white px-3 py-1.5", page >= pages && "pointer-events-none opacity-40")}>Next →</Link>
    </div>
  );
}
