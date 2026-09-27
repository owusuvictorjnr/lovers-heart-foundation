import "server-only";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import type { PaystackTransaction } from "./lib/paystack";

/**
 * Apply a verified Paystack transaction to our Donation record.
 * Idempotent: safe to call from both the browser confirm step and the webhook.
 */
export async function applyPaystackResult(tx: PaystackTransaction) {
  const donation = await db.donation.findUnique({ where: { reference: tx.reference } });
  if (!donation) return null;
  if (donation.status === "SUCCESS") return donation;

  // Never trust an amount/currency mismatch
  const matches = tx.amount === donation.amount && tx.currency === donation.currency;
  const status =
    tx.status === "success" && matches ? "SUCCESS"
    : tx.status === "abandoned" ? "ABANDONED"
    : tx.status === "failed" || (tx.status === "success" && !matches) ? "FAILED"
    : "PENDING";

  const updated = await db.donation.update({
    where: { id: donation.id },
    data: {
      status,
      channel: tx.channel,
      paidAt: status === "SUCCESS" ? new Date(tx.paid_at ?? Date.now()) : null,
    },
  });
  if (status === "SUCCESS") revalidatePath("/admin", "layout");
  return updated;
}
