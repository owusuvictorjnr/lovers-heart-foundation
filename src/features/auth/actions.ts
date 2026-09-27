"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { validationError, type ActionResult } from "@/lib/action-result";
import { createSession, deleteSession } from "./lib/session";
import { loginSchema } from "./schemas";

import { checkLoginRateLimit, recordFailedLogin, clearLoginRateLimit } from "./lib/rate-limit";

export async function login(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return validationError(parsed.error);

  const { email, password } = parsed.data;
  const rateLimit = checkLoginRateLimit(email);
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
    recordFailedLogin(email);
    return { ok: false, message: "Incorrect email or password." };
  }

  clearLoginRateLimit(email);
  await createSession({ userId: user.id, email: user.email, name: user.name });
  redirect("/admin");
}

export async function logout() {
  await deleteSession();
  redirect("/admin/login");
}
