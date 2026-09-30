import "server-only";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import type { PaystackTransaction } from "./lib/paystack";

/**
 * Apply a verified Paystack transaction to our Donation record.
 * Idempotent & race-safe: safe to call from both the browser confirm step and concurrent webhooks.
 * Once a donation reaches SUCCESS, it is immutable and cannot be transitioned to any other state.
 */
export async function applyPaystackResult(tx: PaystackTransaction) {
  const donation = await db.donation.findUnique({ where: { reference: tx.reference } });
  if (!donation) return null;
  if (donation.status === "SUCCESS") return donation;

  // Never trust an amount/currency mismatch
  const matches = tx.amount === donation.amount && tx.currency === donation.currency;
  const nextStatus =
    tx.status === "success" && matches ? "SUCCESS"
    : tx.status === "abandoned" ? "ABANDONED"
    : tx.status === "failed" || (tx.status === "success" && !matches) ? "FAILED"
    : "PENDING";

  // Atomically update only if status has not already been marked SUCCESS in a concurrent call
  if (nextStatus === "SUCCESS") {
    await db.donation.updateMany({
      where: {
        id: donation.id,
        status: { in: ["PENDING", "ABANDONED", "FAILED"] },
      },
      data: {
        status: "SUCCESS",
        channel: tx.channel ?? donation.channel,
        paidAt: new Date(tx.paid_at ?? Date.now()),
      },
    });
  } else {
    // Non-success statuses can ONLY overwrite PENDING, never SUCCESS or other final states
    await db.donation.updateMany({
      where: {
        id: donation.id,
        status: "PENDING",
      },
      data: {
        status: nextStatus,
        channel: tx.channel ?? donation.channel,
        paidAt: null,
      },
    });
  }

  const finalDonation = await db.donation.findUnique({ where: { id: donation.id } });
  if (finalDonation?.status === "SUCCESS") {
    try {
      revalidatePath("/admin", "layout");
    } catch {
      // Safe no-op outside active request contexts (e.g. tests / background jobs)
    }
  }
  return finalDonation;
}

