import { PageHeader } from "@/features/admin/components/page-header";
import { requireAdmin } from "@/features/auth/lib/session";
import { DonationFilters } from "@/features/donations/components/admin/donation-filters";
import { DonationsTable, Pagination } from "@/features/donations/components/admin/donations-table";
import { listDonations } from "@/features/donations/queries";
import { donationFilterSchema } from "@/features/donations/schemas";
import { formatCedis } from "@/lib/utils";

export const metadata = { title: "Donations" };

export default async function DonationsPage({ searchParams }: PageProps<"/admin/donations">) {
  await requireAdmin();
  const raw = await searchParams;
  const filters = donationFilterSchema.parse(raw);
  const { items, total, pages, successTotal } = await listDonations(filters);

  return (
    <>
      <PageHeader
        title="Donations"
        description={`${total.toLocaleString()} record${total === 1 ? "" : "s"} · ${formatCedis(successTotal)} received (successful only)`}
      />
      <DonationFilters filters={filters} />
      <DonationsTable donations={items} />
      <Pagination
        page={filters.page}
        pages={pages}
        params={{ status: filters.status, q: filters.q, from: raw.from as string | undefined, to: raw.to as string | undefined }}
      />
    </>
  );
}
