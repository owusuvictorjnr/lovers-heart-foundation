import "server-only";

type RateLimitRecord = {
  attempts: number;
  resetTime: number;
};

// In-memory sliding rate limit store
const store = new Map<string, RateLimitRecord>();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes lockout window

export function checkLoginRateLimit(key: string): { allowed: boolean; remaining: number; retryAfterSeconds: number } {
  const now = Date.now();
  const record = store.get(key);

  if (!record || now > record.resetTime) {
    return { allowed: true, remaining: MAX_ATTEMPTS, retryAfterSeconds: 0 };
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1000);
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }

  return { allowed: true, remaining: MAX_ATTEMPTS - record.attempts, retryAfterSeconds: 0 };
}

export function recordFailedLogin(key: string): void {
  const now = Date.now();
  const record = store.get(key);

  if (!record || now > record.resetTime) {
    store.set(key, { attempts: 1, resetTime: now + WINDOW_MS });
  } else {
    record.attempts += 1;
  }
}

export function clearLoginRateLimit(key: string): void {
  store.delete(key);
}
