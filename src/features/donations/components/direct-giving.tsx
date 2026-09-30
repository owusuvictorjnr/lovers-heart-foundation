"use client";

import { useState } from "react";
import { Check, Copy, Landmark, ShieldCheck, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

function CopyButton({
  value,
  label,
  copied,
  onCopy,
}: {
  value: string;
  label: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <button
      type="button"
      onClick={async (e) => {
        e.stopPropagation();
        await navigator.clipboard.writeText(value.replace(/\s/g, ""));
        toast.success(`Copied ${label}: ${value}`);
        onCopy();
      }}
      aria-label={`Copy ${label}`}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all duration-200 cursor-pointer select-none active:scale-95",
        copied
          ? "bg-forest text-gold shadow-xs"
          : "border border-line bg-cream hover:border-gold hover:bg-gold-soft/50 text-ink",
      )}
    >
      {copied ? (
        <>
          <Check className="size-3.5 text-gold animate-in zoom-in-50" />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <Copy className="size-3.5 text-muted" />
          <span>Copy</span>
        </>
      )}
    </button>
  );
}

export function DirectGiving() {
  const { momo, bank } = siteConfig.directGiving;
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<number>(0);

  const handleCopy = (key: string, value: string, label: string) => {
    navigator.clipboard.writeText(value.replace(/\s/g, ""));
    toast.success(`Copied ${label}: ${value}`);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey((prev) => (prev === key ? null : prev));
    }, 2500);
  };

  const allItems = [
    ...momo.map((m, idx) => ({
      id: `momo-${idx}`,
      type: "momo" as const,
      network: m.network,
      short: m.short,
      number: m.number,
      color: m.color,
      textColor: m.textColor,
      subtitle: "Direct Mobile Money",
      accountName: bank.accountName,
    })),
    {
      id: "bank",
      type: "bank" as const,
      network: "Bank Transfer",
      short: "BANK",
      number: bank.accountNumber,
      bankName: bank.bank,
      color: "#0c3b2e",
      textColor: "#f3b12c",
      subtitle: "Direct Wire / Branch",
      accountName: bank.accountName,
    },
  ];

  return (
    <div className="w-full">
      {/* Account Verification Subheading */}
      <div className="mb-5 flex flex-wrap items-center justify-center gap-2 text-center text-xs font-medium text-white/80">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 backdrop-blur-xs text-white">
          <ShieldCheck className="size-3.5 text-gold" />
          <span>Verified Non-Profit Account:</span>
          <strong className="text-gold">{bank.accountName}</strong>
        </span>
      </div>

      {/* Mobile-Only Segmented Tabs */}
      <div className="sm:hidden mb-4">
        <div className="grid grid-cols-4 gap-1 rounded-2xl bg-forest-dark/70 p-1 border border-white/15 backdrop-blur-md">
          {allItems.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedTab(idx)}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-1 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer",
                selectedTab === idx
                  ? "bg-cream-pure text-ink shadow-sm"
                  : "text-white/70 hover:text-white hover:bg-white/5",
              )}
            >
              <span
                className="size-2 rounded-full mb-1"
                style={{ backgroundColor: item.color }}
              />
              <span className="truncate max-w-full text-[11px] leading-tight">
                {item.short}
              </span>
            </button>
          ))}
        </div>

        {/* Active Mobile Card */}
        {(() => {
          const activeItem = allItems[selectedTab];
          const isCopied = copiedKey === activeItem.id;

          return (
            <div
              key={activeItem.id}
              className="relative overflow-hidden rounded-2xl border border-white/25 bg-cream-pure p-5 text-ink shadow-lg animate-in fade-in-50 duration-200"
            >
              {/* Top Accent Gradient Bar */}
              <div
                className="absolute top-0 inset-x-0 h-1.5"
                style={{ backgroundColor: activeItem.color }}
              />

              <div className="flex items-center justify-between gap-3 pt-1 mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="grid size-10 place-items-center rounded-xl font-bold text-xs shadow-xs shrink-0"
                    style={{ background: activeItem.color, color: activeItem.textColor }}
                  >
                    {activeItem.type === "bank" ? (
                      <Landmark className="size-5" />
                    ) : (
                      activeItem.short
                    )}
                  </div>
                  <div>
                    <h4 className="font-serif text-base font-bold text-ink leading-snug">
                      {activeItem.network}
                    </h4>
                    <p className="text-[11px] text-forest font-medium">
                      {activeItem.subtitle}
                    </p>
                  </div>
                </div>

                <div className="shrink-0">
                  <CopyButton
                    value={activeItem.number}
                    label={`${activeItem.network} account`}
                    copied={isCopied}
                    onCopy={() =>
                      handleCopy(
                        activeItem.id,
                        activeItem.number,
                        `${activeItem.network} account`,
                      )
                    }
                  />
                </div>
              </div>

              {/* Number Action Card */}
              <div
                onClick={() =>
                  handleCopy(
                    activeItem.id,
                    activeItem.number,
                    `${activeItem.network} account`,
                  )
                }
                className="cursor-pointer rounded-xl border border-line bg-cream p-3 transition hover:border-gold hover:bg-gold-soft/20 flex items-center justify-between"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted block">
                    {activeItem.type === "bank" ? "Account Number" : "Mobile Number"}
                  </span>
                  <span className="font-mono text-base font-bold text-ink tracking-wide">
                    {activeItem.number}
                  </span>
                </div>
                <span className="text-[11px] text-muted-light font-medium">Tap to copy</span>
              </div>

              {activeItem.type === "bank" && activeItem.bankName && (
                <div className="mt-3 flex items-center justify-between text-xs text-muted">
                  <span className="font-medium">Bank &amp; Branch:</span>
                  <span className="font-bold text-ink">{activeItem.bankName}</span>
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* Responsive Grid on Tablet / Desktop */}
      <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {allItems.map((item) => {
          const isCopied = copiedKey === item.id;

          return (
            <div
              key={item.id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/20 bg-cream-pure p-5 text-ink shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-white/40"
            >
              {/* Top Accent Strip */}
              <div
                className="absolute top-0 inset-x-0 h-1.5 rounded-t-2xl transition-all duration-300 group-hover:h-2"
                style={{ backgroundColor: item.color }}
              />

              <div>
                {/* Header */}
                <div className="mb-4 flex items-center gap-3 pt-1">
                  <div
                    className="grid size-10 place-items-center rounded-xl font-bold text-xs shadow-xs shrink-0"
                    style={{ background: item.color, color: item.textColor }}
                  >
                    {item.type === "bank" ? (
                      <Landmark className="size-5" />
                    ) : (
                      item.short
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="truncate font-serif text-base font-bold text-ink">
                      {item.network}
                    </h4>
                    <span className="block text-[11px] font-medium text-forest">
                      {item.subtitle}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <dl className="space-y-3">
                  <div>
                    <dt className="text-[10px] font-bold uppercase tracking-wider text-muted">
                      {item.type === "bank" ? "Account Number" : "Mobile Number"}
                    </dt>
                    <dd className="mt-1 flex items-center justify-between gap-2">
                      <span className="font-mono text-sm font-bold text-ink tracking-wide">
                        {item.number}
                      </span>
                      <CopyButton
                        value={item.number}
                        label={`${item.network} account`}
                        copied={isCopied}
                        onCopy={() =>
                          handleCopy(
                            item.id,
                            item.number,
                            `${item.network} account`,
                          )
                        }
                      />
                    </dd>
                  </div>

                  {item.type === "bank" && item.bankName && (
                    <div className="border-t border-line/60 pt-2 text-xs">
                      <dt className="text-[10px] font-bold uppercase tracking-wider text-muted">
                        Bank / Branch
                      </dt>
                      <dd className="mt-0.5 font-bold text-ink text-xs truncate">
                        {item.bankName}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              <div className="mt-4 border-t border-line/50 pt-2.5 flex items-center justify-between text-[11px] text-muted">
                <span>Account Name</span>
                <span className="font-semibold text-ink truncate max-w-[120px]">
                  {bank.accountName}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

