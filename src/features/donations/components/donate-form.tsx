"use client";

import { useState, useTransition } from "react";
import { Heart, Lock, ShieldCheck } from "lucide-react";
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
          const { ok } = await confirmDonation({ reference: res.reference, token: res.token });
          setThanks({ amount: input.amount, email: input.email, reference: res.reference, confirmed: ok });
          form.reset();
          setAmount(100);
        },
        onCancel: () => {
          cancelDonation({ reference: res.reference, token: res.token });
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
      <form
        onSubmit={handleSubmit}
        noValidate
        className="mx-auto w-full max-w-2xl overflow-hidden rounded-3xl border border-white/20 bg-cream-pure p-5 sm:p-7 md:p-9 text-ink shadow-[0_20px_50px_rgba(0,0,0,0.22)]"
      >
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line/80 pb-5">
          <div>
            <span className="eyebrow mb-1">Make a Meaningful Gift</span>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-ink">Online Donation</h3>
          </div>
          <div className="inline-flex self-start sm:self-auto items-center gap-1.5 rounded-full border border-forest/15 bg-forest-soft px-3 py-1 text-xs font-semibold text-forest shadow-2xs">
            <ShieldCheck className="size-4 text-forest shrink-0" />
            <span>Paystack Secured · MoMo &amp; Cards</span>
          </div>
        </div>

        <fieldset>
          <legend className="mb-2.5 text-xs sm:text-sm font-bold text-ink flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
            <span>Select Amount (Ghana Cedis)</span>
            <span className="text-[11px] text-muted font-normal">Choose preset or enter custom</span>
          </legend>

          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {siteConfig.donationPresets.map((p, idx) => (
              <button
                key={p}
                type="button"
                onClick={() => setAmount(p)}
                className={cn(
                  "cursor-pointer rounded-xl border-2 py-2.5 px-1.5 text-center font-bold text-xs sm:text-sm transition-all duration-200 active:scale-95",
                  idx === 4 && "col-span-3 sm:col-span-1",
                  amount === p
                    ? "border-forest bg-forest text-gold shadow-xs"
                    : "border-line bg-cream hover:border-gold hover:bg-gold-soft/30 text-ink",
                )}
              >
                GH₵ {p.toLocaleString()}
              </button>
            ))}
          </div>

          {/* Custom amount input */}
          <div className="mt-3">
            <label className="flex items-center overflow-hidden rounded-xl border-2 border-line bg-cream transition focus-within:border-forest focus-within:bg-cream-pure focus-within:shadow-xs">
              <span className="pl-3.5 pr-2 sm:px-4 font-bold text-forest text-sm sm:text-base shrink-0">GH₵</span>
              <input
                type="number"
                min={1}
                step={1}
                inputMode="numeric"
                aria-label="Donation amount in Ghana Cedis"
                value={amount}
                placeholder="Enter custom amount"
                onChange={(e) => setAmount(e.target.value === "" ? "" : Math.floor(+e.target.value))}
                className="min-w-0 flex-1 bg-transparent py-2.5 sm:py-3 pr-3 text-base sm:text-lg font-bold text-ink outline-none placeholder:text-muted/50 placeholder:font-normal placeholder:text-xs sm:placeholder:text-sm"
              />
            </label>
          </div>

          {/* Impact hint */}
          <div className="mt-2 min-h-6">
            {errors.amount?.[0] ? (
              <p className="text-xs font-semibold text-clay">{errors.amount[0]}</p>
            ) : hint ? (
              <p className="inline-flex items-center gap-1.5 rounded-lg border border-gold/30 bg-gold-soft px-2.5 py-1 text-[11px] sm:text-xs font-semibold text-[#7a4800]">
                <span className="size-1.5 rounded-full bg-[#7a4800] shrink-0" />
                <span>GH₵ {Number(amount).toLocaleString()} {hint.text}</span>
              </p>
            ) : null}
          </div>
        </fieldset>

        <div className="my-5 grid gap-4 sm:grid-cols-2">
          <Field label="Full name" error={errors.name}>
            <Input name="name" autoComplete="name" placeholder="Kwame Mensah" required aria-invalid={!!errors.name} />
          </Field>
          <Field label="Email address" hint="for receipt" error={errors.email}>
            <Input name="email" type="email" autoComplete="email" placeholder="kwame@example.com" required aria-invalid={!!errors.email} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Phone number" hint="optional for MoMo prompt" error={errors.phone}>
              <Input name="phone" type="tel" autoComplete="tel" placeholder="024 000 0000" />
            </Field>
          </div>
          <div className="sm:col-span-2 flex items-center pt-1">
            <Checkbox name="anonymous" label="Keep my donation anonymous" />
          </div>
        </div>

        {formError && (
          <div role="alert" className="mb-4 rounded-xl border border-clay/30 bg-terracotta-soft p-3 text-xs font-semibold text-clay">
            {formError}
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          variant="primary"
          className="w-full justify-center gap-2 shadow-md py-3.5 text-sm sm:text-base font-bold active:scale-[0.99] transition-transform"
          disabled={pending || !amount}
        >
          <Heart className="size-4.5 shrink-0 fill-ink/10" />
          <span className="truncate">
            {pending ? "Opening Paystack Checkout…" : `Complete Donation • GH₵ ${amount ? Number(amount).toLocaleString() : "0"}`}
          </span>
        </Button>

        <p className="mt-3.5 text-center text-[11px] sm:text-xs text-muted flex items-center justify-center gap-1.5">
          <Lock className="size-3 text-muted shrink-0" />
          <span>256-bit SSL encrypted • Powered by Paystack Ghana</span>
        </p>
      </form>

      <ThankYouDialog data={thanks} onClose={() => setThanks(null)} />
    </>
  );
}

