import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-2xl border border-line bg-white", className)} {...props} />;
}

const badgeTones = {
  green: "bg-[#e3f1e9] text-forest",
  gold: "bg-gold-soft text-[#7a5200]",
  red: "bg-[#fbe4e2] text-clay",
  gray: "bg-sand text-muted",
} as const;

export function Badge({
  tone = "green",
  className,
  ...props
}: { tone?: keyof typeof badgeTones } & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", badgeTones[tone], className)}
      {...props}
    />
  );
}
