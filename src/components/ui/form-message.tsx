import type { ActionResult } from "@/lib/action-result";
import { cn } from "@/lib/utils";

export function FormMessage({ state }: { state: ActionResult<unknown> }) {
  if (!state.message) return null;
  return (
    <p
      role={state.ok ? "status" : "alert"}
      className={cn(
        "rounded-xl px-4 py-3 text-sm font-medium",
        state.ok ? "bg-[#e3f1e9] text-forest" : "bg-[#fbe4e2] text-clay",
      )}
    >
      {state.message}
    </p>
  );
}
