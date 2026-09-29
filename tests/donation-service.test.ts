import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { db } from "../src/lib/db";
import { applyPaystackResult } from "../src/features/donations/service";
import type { PaystackTransaction } from "../src/features/donations/lib/paystack";

describe("Donation Service - State Transitions & Idempotency", () => {
  let reference: string;

  beforeEach(async () => {
    reference = `TEST-DONATION-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    await db.donation.create({
      data: {
        reference,
        amount: 5000, // 50.00 GHS in pesewas
        currency: "GHS",
        donorName: "Test Donor",
        email: "donor@example.com",
        status: "PENDING",
      },
    });
  });

  it("successfully transitions PENDING to SUCCESS on valid matching transaction", async () => {
    const tx: PaystackTransaction = {
      reference,
      status: "success",
      amount: 5000,
      currency: "GHS",
      channel: "mobile_money",
      paid_at: new Date().toISOString(),
    };

    const result = await applyPaystackResult(tx);
    assert.equal(result?.status, "SUCCESS");
    assert.equal(result?.channel, "mobile_money");
    assert.ok(result?.paidAt instanceof Date);
  });

  it("rejects amount mismatch and transitions to FAILED", async () => {
    const tx: PaystackTransaction = {
      reference,
      status: "success",
      amount: 1000, // Underpaid amount
      currency: "GHS",
      channel: "card",
      paid_at: new Date().toISOString(),
    };

    const result = await applyPaystackResult(tx);
    assert.equal(result?.status, "FAILED");
  });

  it("is idempotent on duplicate SUCCESS webhook delivery", async () => {
    const tx: PaystackTransaction = {
      reference,
      status: "success",
      amount: 5000,
      currency: "GHS",
      channel: "mobile_money",
      paid_at: new Date().toISOString(),
    };

    const first = await applyPaystackResult(tx);
    const second = await applyPaystackResult(tx);
    assert.equal(first?.status, "SUCCESS");
    assert.equal(second?.status, "SUCCESS");
  });

  it("never overwrites a SUCCESS status with ABANDONED or FAILED", async () => {
    const successTx: PaystackTransaction = {
      reference,
      status: "success",
      amount: 5000,
      currency: "GHS",
      channel: "card",
      paid_at: new Date().toISOString(),
    };

    await applyPaystackResult(successTx);

    // Simulate an out-of-order or duplicate abandoned / failed webhook
    const abandonedTx: PaystackTransaction = {
      reference,
      status: "abandoned",
      amount: 5000,
      currency: "GHS",
      channel: "card",
      paid_at: null,
    };

    const afterAbandoned = await applyPaystackResult(abandonedTx);
    assert.equal(afterAbandoned?.status, "SUCCESS", "SUCCESS must be immutable");

    // Also check the database record directly
    const stored = await db.donation.findUnique({ where: { reference } });
    assert.equal(stored?.status, "SUCCESS");
  });

  it("handles concurrent success and abandoned events safely without race conditions", async () => {
    const successTx: PaystackTransaction = {
      reference,
      status: "success",
      amount: 5000,
      currency: "GHS",
      channel: "mobile_money",
      paid_at: new Date().toISOString(),
    };

    const abandonedTx: PaystackTransaction = {
      reference,
      status: "abandoned",
      amount: 5000,
      currency: "GHS",
      channel: "mobile_money",
      paid_at: null,
    };

    // Run both concurrently
    await Promise.all([applyPaystackResult(successTx), applyPaystackResult(abandonedTx)]);

    const stored = await db.donation.findUnique({ where: { reference } });
    assert.equal(stored?.status, "SUCCESS", "Concurrent resolution must result in SUCCESS");
  });
});

