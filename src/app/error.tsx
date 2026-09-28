"use client";

import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Public page error:", error);
  }, [error]);

  return (
    <main className="grid min-h-dvh place-items-center p-6 text-center">
      <div className="max-w-md">
        <p className="eyebrow">Something went wrong</p>
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">We encountered an issue</h1>
        <p className="mt-3 mb-6 text-muted">
          An unexpected error occurred while loading this page. Please try again or return to the homepage.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button onClick={() => reset()} variant="forest">
            Try again
          </Button>
          <ButtonLink href="/" variant="ghost">
            Back to home
          </ButtonLink>
        </div>
      </div>
    </main>
  );
}
