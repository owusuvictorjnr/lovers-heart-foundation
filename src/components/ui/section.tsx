import { cn } from "@/lib/utils";

export function Container({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mx-auto w-[min(1180px,100%-40px)] px-2 sm:px-4", className)}
      {...props}
    />
  );
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
    <div className={cn("mb-14 max-w-2xl", center && "mx-auto text-center")}>
      <p className={cn("eyebrow", dark && "text-gold")}>
        <span className={cn("h-1.5 w-1.5 rounded-full", dark ? "bg-gold" : "bg-forest-light")} />
        {eyebrow}
      </p>
      <h2
        className={cn(
          "text-[clamp(2rem,4vw,2.85rem)] font-bold tracking-tight",
          dark ? "text-white" : "text-ink",
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "mt-3.5 text-base sm:text-lg leading-relaxed",
            dark ? "text-white/75" : "text-muted",
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
