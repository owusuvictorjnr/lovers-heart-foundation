"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/features/auth/lib/session";
import { db } from "@/lib/db";
import { validationError, type ActionResult } from "@/lib/action-result";
import { homeSchema } from "./schemas";

function refresh() {
  revalidatePath("/", "layout");
  revalidatePath("/", "page");
  revalidatePath("/admin/homes");
}

/** Create when `id` is empty, otherwise update. */
export async function saveHome(id: string | null, _prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = homeSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return validationError(parsed.error);

  if (id) await db.home.update({ where: { id }, data: parsed.data });
  else await db.home.create({ data: parsed.data });

  refresh();
  redirect("/admin/homes");
}

export async function deleteHome(id: string) {
  await requireAdmin();
  await db.home.delete({ where: { id } });
  refresh();
}

export async function toggleHomePublished(id: string, published: boolean) {
  await requireAdmin();
  await db.home.update({ where: { id }, data: { published } });
  refresh();
}
