"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/features/auth/lib/session";
import { db } from "@/lib/db";
import { validationError, type ActionResult } from "@/lib/action-result";
import { volunteerSchema, volunteerStatuses } from "./schemas";

export async function signUpVolunteer(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = volunteerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    if (parsed.error.issues.some((i) => i.path[0] === "website")) return { ok: true, message: "Thank you for signing up!" };
    return validationError(parsed.error);
  }
  const { website, ...data } = parsed.data;
  void website;
  await db.volunteer.create({ data });
  revalidatePath("/admin", "layout");
  return { ok: true, message: "Thank you for signing up! We'll contact you before the next outreach." };
}

export async function setVolunteerStatus(id: string, status: (typeof volunteerStatuses)[number]) {
  await requireAdmin();
  if (!volunteerStatuses.includes(status)) throw new Error("Invalid status");
  await db.volunteer.update({ where: { id }, data: { status } });
  revalidatePath("/admin", "layout");
}

export async function deleteVolunteer(id: string) {
  await requireAdmin();
  await db.volunteer.delete({ where: { id } });
  revalidatePath("/admin", "layout");
}
