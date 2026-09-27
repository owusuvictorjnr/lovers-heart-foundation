"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import type { Volunteer } from "@/generated/prisma/client";
import { formatDate } from "@/lib/utils";
import { deleteVolunteer, setVolunteerStatus } from "../../actions";
import { volunteerStatuses } from "../../schemas";

export function VolunteerTable({ volunteers }: { volunteers: Volunteer[] }) {
  if (!volunteers.length) return <p className="py-10 text-center text-muted">No volunteers yet.</p>;
  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-white">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b border-line bg-sand/60 text-xs tracking-wider text-muted uppercase">
          <tr><th className="p-3">Name</th><th className="p-3">Contact</th><th className="p-3">Note</th><th className="p-3">Signed up</th><th className="p-3">Status</th><th className="p-3" /></tr>
        </thead>
        <tbody>{volunteers.map((v) => <Row key={v.id} v={v} />)}</tbody>
      </table>
    </div>
  );
}

function Row({ v }: { v: Volunteer }) {
  const [pending, start] = useTransition();
  return (
    <tr className="border-b border-line last:border-0 align-top">
      <td className="p-3 font-semibold">{v.name}</td>
      <td className="p-3">
        <a href={`mailto:${v.email}`} className="block text-forest underline">{v.email}</a>
        <a href={`tel:${v.phone.replace(/\s/g, "")}`} className="text-muted">{v.phone}</a>
      </td>
      <td className="max-w-xs p-3 text-muted">{v.message ?? "—"}</td>
      <td className="p-3 whitespace-nowrap text-muted">{formatDate(v.createdAt)}</td>
      <td className="p-3">
        <select
          aria-label="Status"
          defaultValue={v.status}
          disabled={pending}
          onChange={(e) => start(() => setVolunteerStatus(v.id, e.target.value as Volunteer["status"]))}
          className="rounded-lg border border-line bg-cream px-2 py-1"
        >
          {volunteerStatuses.map((s) => <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>)}
        </select>
      </td>
      <td className="p-3 text-right">
        <Button size="sm" variant="subtle" className="text-clay" disabled={pending} onClick={() => confirm("Remove this volunteer?") && start(() => deleteVolunteer(v.id))}>
          Delete
        </Button>
      </td>
    </tr>
  );
}
