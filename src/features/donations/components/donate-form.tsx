"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input } from "@/components/ui/field";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { cancelDonation, confirmDonation, startDonation } from "../actions";
import { ThankYouDialog } from "./thank-you-dialog";

type Errors = Record<string, string[] | undefined>;

export function DonateForm() {
  const [amount, setAmount] = useState<number | "">(100);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState("");
  const [pending, startTransition] = useTransition();
  const [thanks, setThanks] = useState<{ amount: number; email: string; reference: string; confirmed: boolean } | null>(null);

  const hint = typeof amount === "number" ? siteConfig.impactHints.find((h) => amount >= h.min) : undefined;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const input = {
      amount: Number(amount),
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      anonymous: fd.get("anonymous") === "on",
    };
    setErrors({});
    setFormError("");

    startTransition(async () => {
      const res = await startDonation(input);
      if (!res.ok) {
        setErrors(res.fieldErrors ?? {});
        if (!res.fieldErrors) setFormError(res.message);
        return;
      }

      // Load Paystack only when needed (it touches `window`)
      const { default: PaystackPop } = await import("@paystack/inline-js");
      const popup = new PaystackPop();
      popup.resumeTransaction(res.accessCode, {
        onSuccess: async () => {
          const { ok } = await confirmDonation(res.reference);
          setThanks({ amount: input.amount, email: input.email, reference: res.reference, confirmed: ok });
          form.reset();
          setAmount(100);
        },
        onCancel: () => {
          cancelDonation(res.reference);
          toast("Payment cancelled");
        },
        onError: (err: { message?: string }) => {
          setFormError(err?.message ?? "Something went wrong with the payment. Please try again.");
        },
      });
    });
  }

  return (
    <>
      <form onSubmit={handleSubmit} noValidate className="mx-auto max-w-3xl rounded-3xl bg-white p-6 text-ink shadow-[0_20px_50px_rgba(0,0,0,.25)] sm:p-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-2xl">Donate online</h3>
          <span className="rounded-full bg-[#e3f1e9] px-3 py-1 text-xs font-semibold text-forest-light">
            🔒 Secured by Paystack · MoMo &amp; Card
          </span>
        </div>

        <fieldset>
          <legend className="mb-3 text-sm font-semibold">Choose an amount (GH₵)</legend>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {siteConfig.donationPresets.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setAmount(p)}
                className={cn(
                  "rounded-xl border-2 py-3 font-semibold transition",
                  amount === p ? "border-forest bg-forest text-white" : "border-line bg-cream hover:border-gold",
                )}
              >
                GH₵ {p.toLocaleString()}
              </button>
            ))}
          </div>
          <label className="mt-3 flex items-center overflow-hidden rounded-xl border-2 border-line bg-cream focus-within:border-gold">
            <span className="px-4 font-semibold text-muted">GH₵</span>
            <input
              type="number"
              min={1}
              step={1}
              inputMode="numeric"
              aria-label="Donation amount in cedis"
              value={amount}
              onChange={(e) => setAmount(e.target.value === "" ? "" : Math.floor(+e.target.value))}
              className="min-w-0 flex-1 bg-transparent py-3 pr-3 text-xl font-semibold outline-none"
            />
          </label>
          <p className="mt-2 min-h-6 text-sm text-forest-light">
            {errors.amount?.[0] ? <span className="text-clay">{errors.amount[0]}</span> : hint && `GH₵ ${Number(amount).toLocaleString()} ${hint.text}`}
          </p>
        </fieldset>

        <div className="my-5 grid gap-4 sm:grid-cols-2">
          <Field label="Full name" error={errors.name}>
            <Input name="name" autoComplete="name" required aria-invalid={!!errors.name} />
          </Field>
          <Field label="Email" hint="for your receipt" error={errors.email}>
            <Input name="email" type="email" autoComplete="email" required aria-invalid={!!errors.email} />
          </Field>
          <Field label="Phone" error={errors.phone}>
            <Input name="phone" type="tel" autoComplete="tel" placeholder="024 000 0000" />
          </Field>
          <div className="flex items-end pb-3">
            <Checkbox name="anonymous" label="Keep my donation anonymous" />
          </div>
        </div>

        {formError && <p role="alert" className="mb-3 text-sm text-clay">{formError}</p>}
        <Button type="submit" size="lg" className="w-full" disabled={pending || !amount}>
          {pending ? "Opening secure checkout…" : `Donate GH₵ ${amount ? amount.toLocaleString() : ""}`}
        </Button>
      </form>

      <ThankYouDialog data={thanks} onClose={() => setThanks(null)} />
    </>
  );
}
