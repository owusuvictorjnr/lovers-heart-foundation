"use client";

import { useState } from "react";
import { Compass, HeartHandshake, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContentTabsProps {
  heroForm: React.ReactNode;
  aboutForm: React.ReactNode;
  outreachForm: React.ReactNode;
}

export function ContentTabs({
  heroForm,
  aboutForm,
  outreachForm,
}: ContentTabsProps) {
  const [activeTab, setActiveTab] = useState<"hero" | "about" | "outreach">(
    "hero",
  );

  const tabs = [
    {
      id: "hero" as const,
      label: "Hero Showcase",
      icon: Sparkles,
      description: "Top headline, description & carousel photo",
    },
    {
      id: "about" as const,
      label: "About Us Story",
      icon: HeartHandshake,
      description: "Mission narrative, quote, values & carousel",
    },
    {
      id: "outreach" as const,
      label: "Outreach Journey",
      icon: Compass,
      description: "Annual giving legacy narrative & carousel",
    },
  ];

  return (
    <div className="grid gap-6">
      {/* Tabs Switcher */}
      <div className="flex flex-wrap gap-2 rounded-2xl border border-line bg-cream-pure p-1.5 shadow-2xs">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={cn(
                "flex flex-1 min-w-[200px] items-center gap-3 rounded-xl px-4 py-3 text-left transition-all cursor-pointer",
                isActive
                  ? "bg-forest text-white shadow-xs"
                  : "text-ink hover:bg-sand/60",
              )}
            >
              <div
                className={cn(
                  "grid size-9 shrink-0 place-items-center rounded-lg",
                  isActive ? "bg-white/15 text-gold" : "bg-forest-soft text-forest",
                )}
              >
                <Icon className="size-4.5" />
              </div>
              <div>
                <strong className="block text-sm font-bold">{t.label}</strong>
                <span
                  className={cn(
                    "text-[11px]",
                    isActive ? "text-white/80" : "text-muted",
                  )}
                >
                  {t.description}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="rounded-3xl border border-line bg-cream-pure p-6 sm:p-8 shadow-sm">
        {activeTab === "hero" && heroForm}
        {activeTab === "about" && aboutForm}
        {activeTab === "outreach" && outreachForm}
      </div>
    </div>
  );
}
