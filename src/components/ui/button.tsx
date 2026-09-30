import Link from "next/link";
import { cn } from "@/lib/utils";

const variants = {
  primary:
    "bg-gold text-ink font-bold shadow-[0_4px_14px_rgba(229,155,16,0.35)] hover:bg-gold-warm hover:shadow-[0_6px_20px_rgba(229,155,16,0.45)] active:translate-y-0",
  forest:
    "bg-forest text-white shadow-[0_4px_14px_rgba(12,59,46,0.25)] hover:bg-forest-light hover:shadow-[0_6px_20px_rgba(12,59,46,0.35)] active:translate-y-0",
  ghost:
    "border-2 border-ink/80 text-ink bg-transparent hover:bg-ink hover:text-white active:translate-y-0",
  light:
    "bg-cream-pure text-forest font-bold shadow-[0_4px_14px_rgba(0,0,0,0.08)] hover:bg-sand hover:text-forest-dark active:translate-y-0",
  outline:
    "border border-line bg-cream-pure text-ink hover:border-gold hover:bg-gold-soft/40 active:translate-y-0",
  danger:
    "bg-clay text-white shadow-[0_4px_14px_rgba(184,67,40,0.25)] hover:bg-[#96331c] active:translate-y-0",
  subtle:
    "text-muted hover:bg-sand/80 hover:text-ink active:translate-y-0",
} as const;

const sizes = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-3.5 text-lg",
} as const;

type Common = {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  className?: string;
};

export function buttonClasses({ variant = "primary", size = "md", className }: Common = {}) {
  return cn(
    "inline-flex items-center justify-center gap-2.5 rounded-full font-semibold transition duration-200 cursor-pointer",
    "hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold",
    variants[variant],
    sizes[size],
    className,
  );
}

export function Button({
  variant,
  size,
  className,
  ...props
}: Common & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={buttonClasses({ variant, size, className })} {...props} />;
}

export function ButtonLink({
  variant,
  size,
  className,
  ...props
}: Common & React.ComponentProps<typeof Link>) {
  return <Link className={buttonClasses({ variant, size, className })} {...props} />;
}
