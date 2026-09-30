"use client";

import { useActionState } from "react";
import { Field, Input } from "@/components/ui/field";
import { FormMessage } from "@/components/ui/form-message";
import { SubmitButton } from "@/components/ui/submit-button";
import { initialActionState } from "@/lib/action-result";
import { login } from "../actions";

export function LoginForm() {
  const [state, action] = useActionState(login, initialActionState);
  const errors = state.ok ? undefined : state.fieldErrors;

  return (
    <form action={action} className="grid gap-4">
      <Field label="Email" error={errors?.email}>
        <Input name="email" type="email" autoComplete="email" required autoFocus />
      </Field>
      <Field label="Password" error={errors?.password}>
        <Input name="password" type="password" autoComplete="current-password" required />
      </Field>
      {!errors && <FormMessage state={state} />}
      <SubmitButton pendingText="Signing in…" className="w-full">Sign in</SubmitButton>
    </form>
  );
}
