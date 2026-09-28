"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { validationError, type ActionResult } from "@/lib/action-result";
import { createSession, deleteSession, requireAdmin } from "./lib/session";
import { loginSchema, changePasswordSchema } from "./schemas";

import { checkLoginRateLimit, recordFailedLogin, clearLoginRateLimit } from "./lib/rate-limit";

export async function login(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return validationError(parsed.error);

  const { email, password } = parsed.data;
  const rateLimit = await checkLoginRateLimit(email);
  if (!rateLimit.allowed) {
    const minutes = Math.ceil(rateLimit.retryAfterSeconds / 60);
    return {
      ok: false,
      message: `Too many failed login attempts. Please wait ${minutes} minute${minutes > 1 ? "s" : ""} before trying again.`,
    };
  }

  const user = await db.adminUser.findUnique({ where: { email } });
  // Compare even when the user doesn't exist to keep response times similar
  const valid = await bcrypt.compare(password, user?.passwordHash ?? "$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinv");
  if (!user || !valid) {
    await recordFailedLogin(email);
    return { ok: false, message: "Incorrect email or password." };
  }

  await clearLoginRateLimit(email);
  await createSession({ userId: user.id, email: user.email, name: user.name });
  redirect("/admin");
}

export async function logout() {
  await deleteSession();
  redirect("/admin/login");
}

export async function changePassword(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const session = await requireAdmin();
  const parsed = changePasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return validationError(parsed.error);

  const { currentPassword, newPassword } = parsed.data;
  const user = await db.adminUser.findUnique({ where: { id: session.userId } });
  if (!user) return { ok: false, message: "User not found" };

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) {
    return { ok: false, message: "Current password is incorrect" };
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await db.adminUser.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  return { ok: true, message: "Password updated successfully" };
}

