import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Donation } from "@/generated/prisma/client";
import { cn, formatCedis, formatDate } from "@/lib/utils";
import { DonationStatusBadge } from "./donation-status-badge";

export function DonationsTable({ donations }: { donations: Donation[] }) {
  if (!donations.length) {
    return (
      <div className="rounded-2xl border border-line bg-white py-14 text-center">
        <p className="font-medium text-ink">No donations found</p>
        <p className="mt-1 text-xs text-muted">Try adjusting your search or filters to see more results.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-white shadow-2xs">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="border-b border-line bg-sand/60 text-xs font-semibold tracking-wider text-muted uppercase">
          <tr>
            <th className="p-3.5">Date</th>
            <th className="p-3.5">Donor</th>
            <th className="p-3.5 text-right">Amount</th>
            <th className="p-3.5">Status</th>
            <th className="p-3.5">Channel</th>
            <th className="p-3.5">Reference</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line/70">
          {donations.map((d) => (
            <tr key={d.id} className="transition-colors hover:bg-sand/20">
              <td className="p-3.5 whitespace-nowrap text-muted font-medium">
                {formatDate(d.paidAt ?? d.createdAt, true)}
              </td>
              <td className="p-3.5">
                <span className="font-semibold text-ink">{d.donorName}</span>
                {d.anonymous && <span className="ml-1.5 text-xs text-muted/80">(anonymous)</span>}
                <span className="block text-xs text-muted">
                  {d.email}
                  {d.phone && ` · ${d.phone}`}
                </span>
              </td>
              <td className="p-3.5 text-right font-bold text-forest whitespace-nowrap">
                {formatCedis(d.amount)}
              </td>
              <td className="p-3.5">
                <DonationStatusBadge status={d.status} />
              </td>
              <td className="p-3.5 text-muted capitalize text-xs font-medium">
                {d.channel?.replace("_", " ") ?? "—"}
              </td>
              <td className="p-3.5 font-mono text-xs text-muted">{d.reference}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Pagination({
  page,
  pages,
  params,
}: {
  page: number;
  pages: number;
  params: Record<string, string | undefined>;
}) {
  if (pages <= 1) return null;

  const href = (p: number) =>
    `?${new URLSearchParams({ ...Object.fromEntries(Object.entries(params).filter(([, v]) => v)), page: String(p) } as Record<string, string>)}`;

  return (
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 px-1 text-sm">
      <p className="text-xs text-muted">
        Showing page <span className="font-semibold text-ink">{page}</span> of{" "}
        <span className="font-semibold text-ink">{pages}</span>
      </p>

      <div className="flex items-center gap-2">
        <Link
          href={href(page - 1)}
          aria-disabled={page <= 1}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-xl border border-line bg-cream-pure px-3.5 py-1.5 text-xs font-semibold text-ink shadow-2xs transition hover:border-gold hover:bg-white",
            page <= 1 && "pointer-events-none opacity-40 bg-sand/30",
          )}
        >
          <ChevronLeft className="size-3.5" />
          <span>Previous</span>
        </Link>

        <Link
          href={href(page + 1)}
          aria-disabled={page >= pages}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-xl border border-line bg-cream-pure px-3.5 py-1.5 text-xs font-semibold text-ink shadow-2xs transition hover:border-gold hover:bg-white",
            page >= pages && "pointer-events-none opacity-40 bg-sand/30",
          )}
        >
          <span>Next</span>
          <ChevronRight className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}
