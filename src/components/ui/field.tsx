import { cn } from "@/lib/utils";

const control =
  "w-full rounded-xl border border-line bg-cream px-3.5 py-3 font-normal text-ink outline-none transition focus:border-transparent focus:ring-2 focus:ring-gold aria-invalid:border-clay";

export function Field({
  label,
  hint,
  error,
  className,
  children,
}: {
  label: string;
  hint?: string;
  error?: string[] | string;
  className?: string;
  children: React.ReactNode;
}) {
  const message = Array.isArray(error) ? error[0] : error;
  return (
    <label className={cn("grid gap-1.5 text-sm font-semibold", className)}>
      <span>
        {label} {hint && <small className="font-normal text-muted">({hint})</small>}
      </span>
      {children}
      {message && <span className="text-xs font-medium text-clay">{message}</span>}
    </label>
  );
}

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return <input className={cn(control, className)} {...props} />;
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(control, "min-h-28", className)} {...props} />;
}

export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(control, className)} {...props} />;
}

export function Checkbox({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex items-center gap-2 text-sm font-medium">
      <input type="checkbox" className="size-4.5 accent-forest" {...props} />
      {label}
    </label>
  );
}
