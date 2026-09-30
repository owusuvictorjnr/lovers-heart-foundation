"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Field, Input } from "@/components/ui/field";
import { FormMessage } from "@/components/ui/form-message";
import { SubmitButton } from "@/components/ui/submit-button";
import { initialActionState } from "@/lib/action-result";
import { changePassword } from "../actions";

export function ChangePasswordForm() {
  const [state, action] = useActionState(changePassword, initialActionState);
  const formRef = useRef<HTMLFormElement>(null);
  const errors = state.ok ? undefined : state.fieldErrors;

  useEffect(() => {
    if (state.ok && state.message) {
      toast.success(state.message);
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={action} className="grid max-w-md gap-4">
      <Field label="Current Password" error={errors?.currentPassword}>
        <Input name="currentPassword" type="password" autoComplete="current-password" required />
      </Field>

      <Field label="New Password" hint="At least 10 characters" error={errors?.newPassword}>
        <Input name="newPassword" type="password" autoComplete="new-password" minLength={10} required />
      </Field>

      <Field label="Confirm New Password" error={errors?.confirmPassword}>
        <Input name="confirmPassword" type="password" autoComplete="new-password" minLength={10} required />
      </Field>

      {state.message && <FormMessage state={state} />}

      <div className="pt-2">
        <SubmitButton pendingText="Updating password…" variant="forest">
          Update password
        </SubmitButton>
      </div>
    </form>
  );
}
