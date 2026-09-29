import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { SESSION_COOKIE, SESSION_TTL_SECONDS, signSession, verifySession, type SessionPayload } from "./token";

export async function createSession(payload: SessionPayload) {
  const token = await signSession(payload);
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function deleteSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

export const getSession = cache(async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const payload = await verifySession(token);
  if (!payload) {
    if (token) {
      try {
        cookieStore.delete(SESSION_COOKIE);
      } catch {
        // Safe ignore in read-only render contexts
      }
    }
    return null;
  }

  try {
    const user = await db.adminUser.findUnique({
      where: { id: payload.userId },
      select: { sessionVersion: true },
    });

    if (!user || user.sessionVersion !== payload.sessionVersion) {
      try {
        cookieStore.delete(SESSION_COOKIE);
      } catch {
        // Safe ignore in read-only render contexts
      }
      return null;
    }
  } catch {
    // If DB is temporarily unavailable, fall back to null for strict security
    return null;
  }

  return payload;
});

/**
 * Call at the top of every admin page AND admin server action.
 * Server actions are public endpoints, so the proxy alone is not enough.
 */
export async function requireAdmin() {
  const session = await getSession();
  if (!session) {
    try {
      (await cookies()).delete(SESSION_COOKIE);
    } catch {
      // Safe ignore in read-only render contexts
    }
    redirect("/admin/login");
  }
  return session;
}
