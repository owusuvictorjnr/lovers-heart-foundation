import { cn } from "@/lib/utils";

export function Container({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mx-auto w-[min(1140px,100%-32px)]", className)} {...props} />;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  center,
  dark,
}: {
  eyebrow: string;
  title: string;
  description?: React.ReactNode;
  center?: boolean;
  dark?: boolean;
}) {
  return (
    <div className={cn("mb-12 max-w-2xl", center && "mx-auto text-center")}>
      <p className={cn("eyebrow", dark && "text-gold")}>{eyebrow}</p>
      <h2 className="text-[clamp(1.8rem,3.5vw,2.6rem)]">{title}</h2>
      {description && <p className={cn("mt-3", dark ? "text-white/70" : "text-muted")}>{description}</p>}
    </div>
  );
}
