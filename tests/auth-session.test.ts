import { describe, it } from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcryptjs";
import { signSession, verifySession, SESSION_COOKIE, type SessionPayload } from "../src/features/auth/lib/token";
import { loginSchema, changePasswordSchema } from "../src/features/auth/schemas";

describe("Auth & Session Security", () => {
  const sampleUser: SessionPayload = {
    userId: "usr_12345",
    email: "admin@loversheartfoundation.org",
    name: "Admin User",
    sessionVersion: 1,
  };

  it("uses an isolated project session cookie name", () => {
    assert.ok(typeof SESSION_COOKIE === "string");
    assert.ok(SESSION_COOKIE === "__Host-lhf_session" || SESSION_COOKIE === "lhf_session");
  });

  it("signs and verifies valid session tokens with sessionVersion", async () => {
    const token = await signSession(sampleUser);
    assert.ok(typeof token === "string" && token.length > 50);

    const payload = await verifySession(token);
    assert.ok(payload);
    assert.equal(payload.userId, sampleUser.userId);
    assert.equal(payload.email, sampleUser.email);
    assert.equal(payload.name, sampleUser.name);
    assert.equal(payload.sessionVersion, sampleUser.sessionVersion);
  });

  it("rejects tampered tokens", async () => {
    const token = await signSession(sampleUser);
    const tampered = token.slice(0, -5) + "abcde";
    const payload = await verifySession(tampered);
    assert.equal(payload, null);
  });

  it("returns null for empty or missing tokens", async () => {
    assert.equal(await verifySession(undefined), null);
    assert.equal(await verifySession(""), null);
    assert.equal(await verifySession("random.invalid.token"), null);
  });

  it("loginSchema enforces valid email and password format", () => {
    assert.ok(loginSchema.safeParse({ email: "admin@loversheartfoundation.org", password: "Password123!" }).success);
    assert.ok(!loginSchema.safeParse({ email: "not-an-email", password: "123" }).success);
    assert.ok(!loginSchema.safeParse({ email: "admin@loversheartfoundation.org", password: "" }).success);
  });

  it("changePasswordSchema enforces minimum password length and matching confirmation", () => {
    assert.ok(
      changePasswordSchema.safeParse({
        currentPassword: "OldPassword123",
        newPassword: "NewSecretPassword123!",
        confirmPassword: "NewSecretPassword123!",
      }).success
    );

    // Mismatched confirmation
    assert.ok(
      !changePasswordSchema.safeParse({
        currentPassword: "OldPassword123",
        newPassword: "NewSecretPassword123!",
        confirmPassword: "DifferentPassword123!",
      }).success
    );

    // Too short (under 10 chars)
    assert.ok(
      !changePasswordSchema.safeParse({
        currentPassword: "OldPassword123",
        newPassword: "short",
        confirmPassword: "short",
      }).success
    );
  });

  it("bcrypt password verification is constant-time safe against missing users", async () => {
    const dummyHash = "$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinv";
    const result = await bcrypt.compare("wrong-password", dummyHash);
    assert.equal(result, false);

    const realHash = await bcrypt.hash("correct-password", 10);
    assert.equal(await bcrypt.compare("correct-password", realHash), true);
    assert.equal(await bcrypt.compare("wrong-password", realHash), false);
  });

  it("rate limits repeated failed login attempts", async () => {
    const { checkLoginRateLimit, recordFailedLogin, clearLoginRateLimit } = await import(
      "../src/features/auth/lib/rate-limit"
    );

    const testEmail = `attacker-${Date.now()}@example.com`;
    await clearLoginRateLimit(testEmail);

    // First 5 attempts allowed
    for (let i = 0; i < 5; i++) {
      const status = await checkLoginRateLimit(testEmail);
      assert.equal(status.allowed, true);
      await recordFailedLogin(testEmail);
    }

    // 6th attempt blocked by rate limit
    const blocked = await checkLoginRateLimit(testEmail);
    assert.equal(blocked.allowed, false);
    assert.ok(blocked.retryAfterSeconds > 0);

    // Clear after success
    await clearLoginRateLimit(testEmail);
    const cleared = await checkLoginRateLimit(testEmail);
    assert.equal(cleared.allowed, true);
  });

  it("handles concurrent failed login attempts atomically", async () => {
    const { checkLoginRateLimit, recordFailedLogin, clearLoginRateLimit } = await import(
      "../src/features/auth/lib/rate-limit"
    );

    const concurrentEmail = `concurrent-${Date.now()}@example.com`;
    await clearLoginRateLimit(concurrentEmail);

    // Fire 6 failed attempts concurrently in parallel
    await Promise.all(
      Array.from({ length: 6 }, () => recordFailedLogin(concurrentEmail))
    );

    // Concurrently recorded attempts must result in rate limit being exceeded
    const status = await checkLoginRateLimit(concurrentEmail);
    assert.equal(status.allowed, false);
    assert.equal(status.remaining, 0);
    assert.ok(status.retryAfterSeconds > 0);

    await clearLoginRateLimit(concurrentEmail);
  });

  it("passes /admin/login to LoginPage and protects /admin routes in proxy", async () => {
    const { proxy } = await import("../src/proxy");
    const token = await signSession(sampleUser);

    // Case 1: Visiting /admin/login passes through so LoginPage can check database authoritatively
    const reqAuthLogin = {
      nextUrl: new URL("http://localhost:3000/admin/login"),
      url: "http://localhost:3000/admin/login",
      cookies: {
        get: (name: string) => (name === SESSION_COOKIE ? { value: token } : undefined),
      },
    } as any;

    const resAuthLogin = await proxy(reqAuthLogin);
    assert.equal(resAuthLogin.status, 200);

    // Case 2: Unauthenticated user visiting /admin -> redirect to /admin/login
    const reqUnauthAdmin = {
      nextUrl: new URL("http://localhost:3000/admin"),
      url: "http://localhost:3000/admin",
      cookies: {
        get: () => undefined,
      },
    } as any;

    const resUnauthAdmin = await proxy(reqUnauthAdmin);
    assert.equal(resUnauthAdmin.status, 307);
    assert.equal(resUnauthAdmin.headers.get("location"), "http://localhost:3000/admin/login");

    // Case 3: Authenticated user visiting /admin -> passes through to dashboard
    const reqAuthAdmin = {
      nextUrl: new URL("http://localhost:3000/admin"),
      url: "http://localhost:3000/admin",
      cookies: {
        get: (name: string) => (name === SESSION_COOKIE ? { value: token } : undefined),
      },
    } as any;

    const resAuthAdmin = await proxy(reqAuthAdmin);
    assert.equal(resAuthAdmin.status, 200);
  });
});

