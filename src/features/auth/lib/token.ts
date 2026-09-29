import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE =
  process.env.NODE_ENV === "production" ? "__Host-lhf_session" : "lhf_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export type SessionPayload = { userId: string; email: string; name: string; sessionVersion: number };

function key() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("Missing environment variable: AUTH_SECRET");
  return new TextEncoder().encode(secret);
}

export function signSession(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(key());
}

export async function verifySession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify<SessionPayload>(token, key(), { algorithms: ["HS256"] });
    return payload;
  } catch {
    return null;
  }
}
