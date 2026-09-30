"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button, ButtonLink } from "@/components/ui/button";
import { deleteOutreach } from "../../actions";

export function OutreachRowActions({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <div className="flex justify-end gap-1">
      <ButtonLink size="sm" variant="subtle" href={`/admin/outreach/${id}/edit`}>Edit</ButtonLink>
      <Button
        size="sm"
        variant="subtle"
        className="text-clay"
        disabled={pending}
        onClick={() => {
          if (!confirm("Delete this outreach entry?")) return;
          start(async () => { await deleteOutreach(id); toast.success("Deleted"); });
        }}
      >
        Delete
      </Button>
    </div>
  );
}
