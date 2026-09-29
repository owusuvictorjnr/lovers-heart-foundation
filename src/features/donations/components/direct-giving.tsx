"use client";

import { Landmark } from "lucide-react";
import { toast } from "sonner";
import { siteConfig } from "@/config/site";

function CopyButton({ value, label }: { value: string; label: string }) {
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(value.replace(/\s/g, ""));
        toast.success(`Copied ${label}: ${value}`);
      }}
      className="cursor-pointer rounded-full border border-line bg-sand/80 px-2.5 py-0.5 text-xs font-semibold text-ink transition hover:border-forest hover:bg-forest hover:text-white"
    >
      Copy
    </button>
  );
}

function Row({ label, value, copy }: { label: string; value: string; copy?: boolean }) {
  return (
    <div className="mt-3">
      <dt className="text-[11px] font-bold tracking-wider text-muted uppercase">{label}</dt>
      <dd className="flex flex-wrap items-center justify-between gap-2 text-sm font-bold text-ink">
        <span>{value}</span>
        {copy && <CopyButton value={value} label={label} />}
      </dd>
    </div>
  );
}

export function DirectGiving() {
  const { momo, bank } = siteConfig.directGiving;

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {momo.map((m) => (
        <div
          key={m.network}
          className="relative rounded-2xl border border-white/20 bg-cream-pure p-5.5 text-ink shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-lg"
        >
          {/* Top color bar */}
          <div
            className="absolute top-0 inset-x-0 h-1.5 rounded-t-2xl"
            style={{ backgroundColor: m.color }}
          />

          <div className="mb-3 flex items-center gap-3 pt-1">
            <span
              className="grid size-11 place-items-center rounded-xl font-bold text-xs shadow-xs"
              style={{ background: m.color, color: m.textColor }}
            >
              {m.short}
            </span>
            <div>
              <h4 className="font-serif text-base font-bold text-ink">{m.network}</h4>
              <span className="text-[11px] text-forest font-medium">Direct Mobile Money</span>
            </div>
          </div>

          <dl className="divide-y divide-line/60">
            <Row label="Account Number" value={m.number} copy />
            <Row label="Account Name" value={bank.accountName} />
          </dl>
        </div>
      ))}

      {/* Bank Account with clean Lucide icon */}
      <div className="relative rounded-2xl border border-white/20 bg-cream-pure p-5.5 text-ink shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-lg">
        <div className="absolute top-0 inset-x-0 h-1.5 rounded-t-2xl bg-forest" />

        <div className="mb-3 flex items-center gap-3 pt-1">
          <div className="grid size-11 place-items-center rounded-xl bg-forest-soft text-forest shadow-xs">
            <Landmark className="size-5.5" />
          </div>
          <div>
            <h4 className="font-serif text-base font-bold text-ink">Bank Transfer</h4>
            <span className="text-[11px] text-forest font-medium">Direct Wire / Branch</span>
          </div>
        </div>

        <dl className="divide-y divide-line/60">
          <Row label="Bank" value={bank.bank} />
          <Row label="Account Name" value={bank.accountName} />
          <Row label="Account Number" value={bank.accountNumber} copy />
        </dl>
      </div>
    </div>
  );
}
