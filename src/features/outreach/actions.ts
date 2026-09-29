"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/features/auth/lib/session";
import { db } from "@/lib/db";
import { validationError, type ActionResult } from "@/lib/action-result";
import { outreachSchema } from "./schemas";

function refresh() {
  revalidatePath("/", "layout");
  revalidatePath("/", "page");
  revalidatePath("/admin/outreach");
}

export async function saveOutreach(id: string | null, _prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = outreachSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return validationError(parsed.error);

  if (id) await db.outreach.update({ where: { id }, data: parsed.data });
  else await db.outreach.create({ data: parsed.data });

  refresh();
  redirect("/admin/outreach");
}

export async function deleteOutreach(id: string) {
  await requireAdmin();
  await db.outreach.delete({ where: { id } });
  refresh();
}
