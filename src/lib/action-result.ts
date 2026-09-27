import type { z } from "zod";

/** Standard shape returned by every server action, consumed by useActionState. */
export type ActionResult<T = undefined> =
  | { ok: true; message?: string; data?: T }
  | { ok: false; message: string; fieldErrors?: Record<string, string[] | undefined> };

export const initialActionState = { ok: false, message: "" } as ActionResult<never>;

export function validationError(error: z.ZodError): ActionResult<never> {
  return {
    ok: false,
    message: "Please fix the highlighted fields.",
    fieldErrors: error.flatten().fieldErrors as Record<string, string[]>,
  };
}
