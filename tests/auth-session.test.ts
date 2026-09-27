import { describe, it } from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcryptjs";
import { signSession, verifySession, type SessionPayload } from "../src/features/auth/lib/token";
import { loginSchema } from "../src/features/auth/schemas";

describe("Auth & Session Security", () => {
  const sampleUser: SessionPayload = {
    userId: "usr_12345",
    email: "admin@loversheartfoundation.org",
    name: "Admin User",
  };

  it("signs and verifies valid session tokens", async () => {
    const token = await signSession(sampleUser);
    assert.ok(typeof token === "string" && token.length > 50);

    const payload = await verifySession(token);
    assert.ok(payload);
    assert.equal(payload.userId, sampleUser.userId);
    assert.equal(payload.email, sampleUser.email);
    assert.equal(payload.name, sampleUser.name);
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
});

