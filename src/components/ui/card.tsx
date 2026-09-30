import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-line bg-cream-pure p-6 shadow-[0_4px_20px_rgba(23,21,18,0.04)]",
        className,
      )}
      {...props}
    />
  );
}

const badgeTones = {
  green: "bg-forest-soft text-forest border border-forest/15",
  gold: "bg-gold-soft text-gold-deep border border-gold/25",
  red: "bg-terracotta-soft text-clay border border-clay/20",
  gray: "bg-sand text-muted border border-line",
} as const;

export function Badge({
  tone = "green",
  className,
  ...props
}: { tone?: keyof typeof badgeTones } & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tracking-wide shadow-2xs",
        badgeTones[tone],
        className,
      )}
      {...props}
    />
  );
}
