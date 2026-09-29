import "server-only";
import { db } from "@/lib/db";

const memoryStore = new Map<string, { attempts: number; resetTime: number }>();

/**
 * Checks and records rate limit for arbitrary actions (e.g. upload signatures, content updates).
 * Returns { allowed, remaining, retryAfterSeconds }.
 */
export async function checkRateLimit(
  key: string,
  maxAttempts: number = 30,
  windowMs: number = 60 * 1000,
): Promise<{ allowed: boolean; remaining: number; retryAfterSeconds: number }> {
  const now = Date.now();
  const resetAt = new Date(now + windowMs);

  try {
    const record = await db.rateLimit.findUnique({ where: { key } });
    if (!record || now > record.resetAt.getTime()) {
      // First attempt in new window
      await db.rateLimit.upsert({
        where: { key },
        create: { key, attempts: 1, resetAt },
        update: { attempts: 1, resetAt },
      });
      return { allowed: true, remaining: maxAttempts - 1, retryAfterSeconds: 0 };
    }

    if (record.attempts >= maxAttempts) {
      const retryAfterSeconds = Math.ceil((record.resetAt.getTime() - now) / 1000);
      return { allowed: false, remaining: 0, retryAfterSeconds };
    }

    // Increment attempts
    await db.rateLimit.update({
      where: { key },
      data: { attempts: { increment: 1 } },
    });

    return { allowed: true, remaining: maxAttempts - (record.attempts + 1), retryAfterSeconds: 0 };
  } catch {
    // Memory store fallback
    const rec = memoryStore.get(key);
    if (!rec || now > rec.resetTime) {
      memoryStore.set(key, { attempts: 1, resetTime: now + windowMs });
      return { allowed: true, remaining: maxAttempts - 1, retryAfterSeconds: 0 };
    }

    if (rec.attempts >= maxAttempts) {
      const retryAfterSeconds = Math.ceil((rec.resetTime - now) / 1000);
      return { allowed: false, remaining: 0, retryAfterSeconds };
    }

    rec.attempts += 1;
    return { allowed: true, remaining: maxAttempts - rec.attempts, retryAfterSeconds: 0 };
  }
}
