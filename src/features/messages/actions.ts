"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/features/auth/lib/session";
import { db } from "@/lib/db";
import { validationError, type ActionResult } from "@/lib/action-result";
import { contactSchema } from "./schemas";

export async function sendMessage(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = contactSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    // Silently "succeed" for bots that filled the honeypot
    if (parsed.error.issues.some((i) => i.path[0] === "website")) return { ok: true, message: "Thanks! We'll be in touch." };
    return validationError(parsed.error);
  }
  const { website, ...data } = parsed.data;
  void website;
  await db.message.create({ data });
  revalidatePath("/admin", "layout");
  return { ok: true, message: "Thank you! We've received your message and will get back to you soon." };
}

export async function setMessageRead(id: string, read: boolean) {
  await requireAdmin();
  await db.message.update({ where: { id }, data: { read } });
  revalidatePath("/admin", "layout");
}

export async function deleteMessage(id: string) {
  await requireAdmin();
  await db.message.delete({ where: { id } });
  revalidatePath("/admin", "layout");
}
