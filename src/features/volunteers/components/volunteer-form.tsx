"use client";

import { useActionState, useEffect, useRef } from "react";
import { Field, Input, Textarea } from "@/components/ui/field";
import { FormMessage } from "@/components/ui/form-message";
import { SubmitButton } from "@/components/ui/submit-button";
import { initialActionState } from "@/lib/action-result";
import { signUpVolunteer } from "../actions";

export function VolunteerForm() {
  const [state, action] = useActionState(signUpVolunteer, initialActionState);
  const formRef = useRef<HTMLFormElement>(null);
  const errors = state.ok ? undefined : state.fieldErrors;

  useEffect(() => { if (state.ok) formRef.current?.reset(); }, [state]);

  return (
    <form ref={formRef} action={action} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Name" error={errors?.name}><Input name="name" autoComplete="name" required /></Field>
        <Field label="Email" error={errors?.email}><Input name="email" type="email" autoComplete="email" required /></Field>
        <Field label="Phone" error={errors?.phone}><Input name="phone" type="tel" autoComplete="tel" required /></Field>
      </div>
      <Field label="How would you like to help?" hint="optional">
        <Textarea name="message" rows={2} placeholder="e.g. packing, driving, photography, teaching…" />
      </Field>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <FormMessage state={state} />
      <SubmitButton variant="forest" pendingText="Signing up…" className="justify-self-start">Sign me up</SubmitButton>
    </form>
  );
}
