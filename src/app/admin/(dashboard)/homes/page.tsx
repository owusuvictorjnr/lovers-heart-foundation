import Image from "next/image";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/card";
import { PageHeader } from "@/features/admin/components/page-header";
import { requireAdmin } from "@/features/auth/lib/session";
import { HomeRowActions } from "@/features/homes/components/admin/home-row-actions";
import { listAllHomes } from "@/features/homes/queries";

export const metadata = { title: "Homes" };

export default async function AdminHomesPage() {
  await requireAdmin();
  const homes = await listAllHomes();
  return (
    <>
      <PageHeader title="Children's homes" description="Homes shown in the “Homes we support” section." actions={<ButtonLink href="/admin/homes/new" variant="forest" size="sm">+ Add home</ButtonLink>} />
      {homes.length ? (
        <ul className="grid gap-3">
          {homes.map((h) => (
            <li key={h.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-white p-3">
              <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-sand">
                {h.imageUrl && <Image src={h.imageUrl} alt="" fill sizes="64px" className="object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{h.name} {!h.published && <Badge tone="gray">Hidden</Badge>}</p>
                <p className="truncate text-sm text-muted">{h.region} · {h.description}</p>
              </div>
              <HomeRowActions id={h.id} published={h.published} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="py-10 text-center text-muted">No homes yet.</p>
      )}
    </>
  );
}
