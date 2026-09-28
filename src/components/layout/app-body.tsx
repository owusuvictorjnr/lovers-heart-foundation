import type { ReactNode } from "react";

/**
 * AppBody encapsulates the root document body.
 * suppressHydrationWarning is applied strictly to the <body> tag to safely
 * ignore non-destructive attributes injected by browser extensions (e.g. Grammarly, LastPass).
 */
export function AppBody({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <body suppressHydrationWarning className={className}>
      {children}
    </body>
  );
}
