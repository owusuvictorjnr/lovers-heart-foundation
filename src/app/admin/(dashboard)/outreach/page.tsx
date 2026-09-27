import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/card";
import { PageHeader } from "@/features/admin/components/page-header";
import { requireAdmin } from "@/features/auth/lib/session";
import { OutreachRowActions } from "@/features/outreach/components/admin/outreach-row-actions";
import { listOutreach } from "@/features/outreach/queries";

export const metadata = { title: "Outreach" };

export default async function AdminOutreachPage() {
  await requireAdmin();
  const events = await listOutreach();
  return (
    <>
      <PageHeader title="Annual outreach" description="The latest 6 appear in the website timeline." actions={<ButtonLink href="/admin/outreach/new" variant="forest" size="sm">+ Add outreach</ButtonLink>} />
      {events.length ? (
        <ul className="grid gap-3">
          {events.map((e) => (
            <li key={e.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-white p-4">
              <span className="font-serif text-2xl text-forest">{e.year}</span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{e.title} {e.upcoming && <Badge tone="gold">Upcoming</Badge>}</p>
                <p className="text-sm text-muted">{e.homesCount} homes · {e.childrenReached.toLocaleString()} children</p>
              </div>
              <OutreachRowActions id={e.id} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="py-10 text-center text-muted">No outreach entries yet.</p>
      )}
    </>
  );
}
