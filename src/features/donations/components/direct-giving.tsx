"use client";

import { toast } from "sonner";
import { siteConfig } from "@/config/site";

function CopyButton({ value }: { value: string }) {
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(value.replace(/\s/g, ""));
        toast.success(`Copied ${value}`);
      }}
      className="rounded-full border border-line bg-sand px-3 py-1 text-xs font-semibold hover:border-gold hover:bg-gold-soft"
    >
      Copy
    </button>
  );
}

function Row({ label, value, copy }: { label: string; value: string; copy?: boolean }) {
  return (
    <div className="mt-2.5">
      <dt className="text-xs tracking-wider text-muted uppercase">{label}</dt>
      <dd className="flex flex-wrap items-center justify-between gap-2 font-semibold">
        {value} {copy && <CopyButton value={value} />}
      </dd>
    </div>
  );
}

export function DirectGiving() {
  const { momo, bank } = siteConfig.directGiving;
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {momo.map((m) => (
        <div key={m.network} className="rounded-2xl border-t-[6px] bg-white p-6 text-ink" style={{ borderTopColor: m.color }}>
          <div className="mb-2 flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-lg text-xs font-bold" style={{ background: m.color, color: m.textColor }}>
              {m.short}
            </span>
            <h3 className="text-lg">{m.network}</h3>
          </div>
          <dl>
            <Row label="Number" value={m.number} copy />
            <Row label="Name" value={bank.accountName} />
          </dl>
        </div>
      ))}
      <div className="rounded-2xl border-t-[6px] border-forest-light bg-white p-6 text-ink">
        <div className="mb-2 flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-lg bg-sand">🏦</span>
          <h3 className="text-lg">Bank Transfer</h3>
        </div>
        <dl>
          <Row label="Bank" value={bank.bank} />
          <Row label="Account name" value={bank.accountName} />
          <Row label="Account no." value={bank.accountNumber} copy />
        </dl>
      </div>
    </div>
  );
}
