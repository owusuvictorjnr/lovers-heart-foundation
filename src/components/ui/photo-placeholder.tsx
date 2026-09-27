import { cn } from "@/lib/utils";

const tones = [
  "bg-[radial-gradient(circle_at_25%_30%,rgba(232,163,23,.55),transparent_55%),linear-gradient(135deg,#16734a,#0f5132)]",
  "bg-[radial-gradient(circle_at_70%_25%,rgba(22,115,74,.55),transparent_55%),linear-gradient(135deg,#e8a317,#c46d0c)]",
  "bg-[radial-gradient(circle_at_30%_70%,rgba(232,163,23,.5),transparent_55%),linear-gradient(135deg,#b3261e,#7a1712)]",
];

/** Shown where a real photo hasn't been added yet. */
export function PhotoPlaceholder({ label, tone = 0, className }: { label: string; tone?: number; className?: string }) {
  return (
    <div className={cn("relative overflow-hidden", tones[tone % tones.length], className)}>
      <span className="absolute bottom-3 left-3 rounded-md bg-black/35 px-2.5 py-1 text-xs text-white">{label}</span>
    </div>
  );
}
