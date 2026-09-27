"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { validationError, type ActionResult } from "@/lib/action-result";
import { createSession, deleteSession } from "./lib/session";
import { loginSchema } from "./schemas";

export async function login(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return validationError(parsed.error);

  const user = await db.adminUser.findUnique({ where: { email: parsed.data.email } });
  // Compare even when the user doesn't exist to keep response times similar
  const valid = await bcrypt.compare(parsed.data.password, user?.passwordHash ?? "$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinv");
  if (!user || !valid) return { ok: false, message: "Incorrect email or password." };

  await createSession({ userId: user.id, email: user.email, name: user.name });
  redirect("/admin");
}

export async function logout() {
  await deleteSession();
  redirect("/admin/login");
}
