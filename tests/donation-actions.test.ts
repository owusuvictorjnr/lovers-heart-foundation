import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { donateSchema, donationActionSchema } from "../src/features/donations/schemas";
import { confirmDonation, cancelDonation } from "../src/features/donations/actions";

describe("Donation Actions - Validation & Authorization", () => {
  it("validates donateSchema requirements", () => {
    // Valid input
    const valid = donateSchema.safeParse({
      amount: 100,
      name: "Ama Serwaa",
      email: "ama@example.com",
      phone: "0240000000",
      anonymous: false,
    });
    assert.ok(valid.success);

    // Invalid email
    const badEmail = donateSchema.safeParse({
      amount: 100,
      name: "Ama Serwaa",
      email: "invalid-email",
      anonymous: false,
    });
    assert.ok(!badEmail.success);

    // Negative / zero amount
    const badAmount = donateSchema.safeParse({
      amount: 0,
      name: "Ama Serwaa",
      email: "ama@example.com",
      anonymous: false,
    });
    assert.ok(!badAmount.success);
  });

  it("donationActionSchema requires valid GIA reference and token length", () => {
    const valid = donationActionSchema.safeParse({
      reference: "GIA-1727470000000-ABCDEF",
      token: "a".repeat(64),
    });
    assert.ok(valid.success);

    // Bad reference format
    const badRef = donationActionSchema.safeParse({
      reference: "MALICIOUS-REF-123",
      token: "a".repeat(64),
    });
    assert.ok(!badRef.success);

    // Short / missing token
    const shortToken = donationActionSchema.safeParse({
      reference: "GIA-1727470000000-ABCDEF",
      token: "too-short",
    });
    assert.ok(!shortToken.success);
  });

  it("confirmDonation rejects invalid or forged checkout tokens without error", async () => {
    const result = await confirmDonation({
      reference: "GIA-1727470000000-ABCDEF",
      token: "f".repeat(64), // Forged token
    });
    assert.equal(result.ok, false);
  });

  it("cancelDonation rejects invalid or forged checkout tokens", async () => {
    const result = await cancelDonation({
      reference: "GIA-1727470000000-ABCDEF",
      token: "f".repeat(64), // Forged token
    });
    assert.equal(result.ok, false);
  });
});
