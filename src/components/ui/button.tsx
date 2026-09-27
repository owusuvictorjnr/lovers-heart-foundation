import Link from "next/link";
import { cn } from "@/lib/utils";

const variants = {
  primary: "bg-gold text-ink shadow-[0_6px_18px_rgba(232,163,23,.35)] hover:bg-[#f0b02c]",
  forest: "bg-forest text-white hover:bg-forest-light",
  ghost: "border-2 border-ink text-ink hover:bg-ink hover:text-white",
  light: "bg-white text-forest hover:bg-sand",
  outline: "border border-line bg-white text-ink hover:border-gold",
  danger: "bg-clay text-white hover:bg-[#8f1e18]",
  subtle: "text-muted hover:bg-sand hover:text-ink",
} as const;

const sizes = {
  sm: "px-3.5 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-7 py-4 text-lg",
} as const;

type Common = { variant?: keyof typeof variants; size?: keyof typeof sizes; className?: string };

export function buttonClasses({ variant = "primary", size = "md", className }: Common = {}) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition",
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
