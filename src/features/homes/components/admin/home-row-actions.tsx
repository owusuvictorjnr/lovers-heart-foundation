"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button, ButtonLink } from "@/components/ui/button";
import { deleteHome, toggleHomePublished } from "../../actions";

export function HomeRowActions({ id, published }: { id: string; published: boolean }) {
  const [pending, start] = useTransition();
  return (
    <div className="flex flex-wrap justify-end gap-1">
      <Button size="sm" variant="subtle" disabled={pending} onClick={() => start(() => toggleHomePublished(id, !published))}>
        {published ? "Hide" : "Publish"}
      </Button>
      <ButtonLink size="sm" variant="subtle" href={`/admin/homes/${id}/edit`}>Edit</ButtonLink>
      <Button
        size="sm"
        variant="subtle"
        className="text-clay"
        disabled={pending}
        onClick={() => {
          if (!confirm("Delete this home?")) return;
          start(async () => { await deleteHome(id); toast.success("Home deleted"); });
        }}
      >
        Delete
      </Button>
    </div>
  );
}
