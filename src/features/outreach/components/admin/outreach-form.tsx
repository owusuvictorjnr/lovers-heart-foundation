"use client";

import { useActionState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Checkbox, Field, Input, Textarea } from "@/components/ui/field";
import { FormMessage } from "@/components/ui/form-message";
import { SubmitButton } from "@/components/ui/submit-button";
import type { Outreach } from "@/generated/prisma/client";
import { initialActionState } from "@/lib/action-result";
import { saveOutreach } from "../../actions";

export function OutreachForm({ outreach }: { outreach?: Outreach }) {
  const [state, action] = useActionState(saveOutreach.bind(null, outreach?.id ?? null), initialActionState);
  const errors = state.ok ? undefined : state.fieldErrors;

  return (
    <form action={action} className="grid max-w-2xl gap-5">
      <div className="grid gap-5 sm:grid-cols-[140px_1fr]">
        <Field label="Year" error={errors?.year}>
          <Input name="year" type="number" defaultValue={outreach?.year ?? new Date().getFullYear()} required />
        </Field>
        <Field label="Title" error={errors?.title}>
          <Input name="title" defaultValue={outreach?.title} placeholder="e.g. 4 homes · Eastern & Volta" required />
        </Field>
      </div>
      <Field label="Summary" error={errors?.summary}>
        <Textarea name="summary" defaultValue={outreach?.summary} rows={3} required />
      </Field>
      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Date" hint="optional" error={errors?.date}>
          <Input name="date" type="date" defaultValue={outreach?.date?.toISOString().slice(0, 10)} />
        </Field>
        <Field label="Homes visited" error={errors?.homesCount}>
          <Input name="homesCount" type="number" min={0} defaultValue={outreach?.homesCount ?? 0} />
        </Field>
        <Field label="Children reached" error={errors?.childrenReached}>
          <Input name="childrenReached" type="number" min={0} defaultValue={outreach?.childrenReached ?? 0} />
        </Field>
      </div>
      <Checkbox name="upcoming" label="Mark as upcoming" defaultChecked={outreach?.upcoming ?? false} />
      <FormMessage state={state} />
      <div className="flex gap-3">
        <SubmitButton variant="forest">{outreach ? "Save changes" : "Add outreach"}</SubmitButton>
        <ButtonLink href="/admin/outreach" variant="subtle">Cancel</ButtonLink>
      </div>
    </form>
  );
}
