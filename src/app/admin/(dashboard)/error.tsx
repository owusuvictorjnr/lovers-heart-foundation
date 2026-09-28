"use client";

import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin portal error:", error);
  }, [error]);

  return (
    <div className="grid min-h-[60vh] place-items-center rounded-2xl border border-clay/20 bg-white p-8 text-center shadow-sm">
      <div className="max-w-md">
        <span className="text-4xl" aria-hidden>⚠️</span>
        <h1 className="mt-4 font-serif text-2xl font-bold text-ink">Dashboard Error</h1>
        <p className="mt-2 text-sm text-muted">
          {error.message || "Failed to load admin resources. Please check your network or try refreshing."}
        </p>
        {error.digest && (
          <p className="mt-1 font-mono text-xs text-muted/70">Digest: {error.digest}</p>
        )}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button onClick={() => reset()} variant="forest">
            Retry action
          </Button>
          <ButtonLink href="/admin" variant="ghost">
            Back to Overview
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
