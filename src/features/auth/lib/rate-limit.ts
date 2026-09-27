import "server-only";
import { db } from "@/lib/db";

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes lockout window

// In-memory fallback for test environments or temporary DB disconnections
const memoryStore = new Map<string, { attempts: number; resetTime: number }>();

/**
 * Checks if a login identifier is rate-limited.
 * Persists across all serverless / container replicas via PostgreSQL.
 */
export async function checkLoginRateLimit(key: string): Promise<{ allowed: boolean; remaining: number; retryAfterSeconds: number }> {
  const now = Date.now();
  try {
    const record = await db.rateLimit.findUnique({ where: { key } });
    if (!record || now > record.resetAt.getTime()) {
      return { allowed: true, remaining: MAX_ATTEMPTS, retryAfterSeconds: 0 };
    }

    if (record.attempts >= MAX_ATTEMPTS) {
      const retryAfterSeconds = Math.ceil((record.resetAt.getTime() - now) / 1000);
      return { allowed: false, remaining: 0, retryAfterSeconds };
    }

    return { allowed: true, remaining: MAX_ATTEMPTS - record.attempts, retryAfterSeconds: 0 };
  } catch {
    // Graceful fallback to memory store
    const rec = memoryStore.get(key);
    if (!rec || now > rec.resetTime) return { allowed: true, remaining: MAX_ATTEMPTS, retryAfterSeconds: 0 };
    if (rec.attempts >= MAX_ATTEMPTS) {
      return { allowed: false, remaining: 0, retryAfterSeconds: Math.ceil((rec.resetTime - now) / 1000) };
    }
    return { allowed: true, remaining: MAX_ATTEMPTS - rec.attempts, retryAfterSeconds: 0 };
  }
}

/**
 * Records a failed login attempt for the key.
 */
export async function recordFailedLogin(key: string): Promise<void> {
  const now = Date.now();
  const resetAt = new Date(now + WINDOW_MS);
  try {
    const record = await db.rateLimit.findUnique({ where: { key } });
    if (!record || now > record.resetAt.getTime()) {
      await db.rateLimit.upsert({
        where: { key },
        create: { key, attempts: 1, resetAt },
        update: { attempts: 1, resetAt },
      });
    } else {
      await db.rateLimit.update({
        where: { key },
        data: { attempts: { increment: 1 } },
      });
    }
  } catch {
    const rec = memoryStore.get(key);
    if (!rec || now > rec.resetTime) {
      memoryStore.set(key, { attempts: 1, resetTime: now + WINDOW_MS });
    } else {
      rec.attempts += 1;
    }
  }
}

/**
 * Clears rate limiting for a key on successful authentication.
 */
export async function clearLoginRateLimit(key: string): Promise<void> {
  try {
    await db.rateLimit.deleteMany({ where: { key } });
  } catch {
    // Ignore error
  }
  memoryStore.delete(key);
}
