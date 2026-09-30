"use client";

import { useActionState, useEffect, useRef } from "react";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { FormMessage } from "@/components/ui/form-message";
import { SubmitButton } from "@/components/ui/submit-button";
import { initialActionState } from "@/lib/action-result";
import { sendMessage } from "../actions";
import { messageTopics } from "../schemas";

export function ContactForm() {
  const [state, action] = useActionState(sendMessage, initialActionState);
  const formRef = useRef<HTMLFormElement>(null);
  const errors = state.ok ? undefined : state.fieldErrors;

  useEffect(() => { if (state.ok) formRef.current?.reset(); }, [state]);

  return (
    <form ref={formRef} action={action} className="grid gap-4 rounded-2xl bg-white p-6 shadow-[0_10px_30px_rgba(29,26,22,.08)] sm:p-8">
      <Field label="Your name" error={errors?.name}>
        <Input name="name" autoComplete="name" required />
      </Field>
      <Field label="Phone or email" error={errors?.contact}>
        <Input name="contact" required />
      </Field>
      <Field label="I'd like to…">
        <Select name="topic">{messageTopics.map((t) => <option key={t}>{t}</option>)}</Select>
      </Field>
      <Field label="Message" error={errors?.body}>
        <Textarea name="body" rows={4} required />
      </Field>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <FormMessage state={state} />
      <SubmitButton pendingText="Sending…">Send message</SubmitButton>
    </form>
  );
}
