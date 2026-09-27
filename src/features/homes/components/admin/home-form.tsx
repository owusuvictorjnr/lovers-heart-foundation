"use client";

import { useActionState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/field";
import { FormMessage } from "@/components/ui/form-message";
import { SubmitButton } from "@/components/ui/submit-button";
import { ghanaRegions } from "@/config/site";
import { ImageUploadField } from "@/features/media/components/image-upload-field";
import type { Home } from "@/generated/prisma/client";
import { initialActionState } from "@/lib/action-result";
import { saveHome } from "../../actions";

export function HomeForm({ home }: { home?: Home }) {
  const [state, action] = useActionState(saveHome.bind(null, home?.id ?? null), initialActionState);
  const errors = state.ok ? undefined : state.fieldErrors;

  return (
    <form action={action} className="grid max-w-2xl gap-5">
      <Field label="Name" error={errors?.name}>
        <Input name="name" defaultValue={home?.name} required />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Region" error={errors?.region}>
          <Select name="region" defaultValue={home?.region ?? ""} required>
            <option value="" disabled>Choose…</option>
            {ghanaRegions.map((r) => <option key={r}>{r}</option>)}
          </Select>
        </Field>
        <Field label="Display order" hint="lower shows first" error={errors?.sortOrder}>
          <Input name="sortOrder" type="number" defaultValue={home?.sortOrder ?? 0} />
        </Field>
      </div>
      <Field label="What we donated / description" error={errors?.description}>
        <Textarea name="description" defaultValue={home?.description} rows={3} required />
      </Field>
      <ImageUploadField name="imageUrl" folder="homes" defaultValue={home?.imageUrl} />
      <Checkbox name="published" label="Show on website" defaultChecked={home?.published ?? true} />
      <FormMessage state={state} />
      <div className="flex gap-3">
        <SubmitButton variant="forest">{home ? "Save changes" : "Add home"}</SubmitButton>
        <ButtonLink href="/admin/homes" variant="subtle">Cancel</ButtonLink>
      </div>
    </form>
  );
}
