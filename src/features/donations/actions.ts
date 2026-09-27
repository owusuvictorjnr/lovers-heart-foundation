"use server";

import crypto from "node:crypto";
import { db } from "@/lib/db";
import { initializeTransaction, verifyTransaction } from "./lib/paystack";
import { applyPaystackResult } from "./service";
import { donateSchema, type DonateInput } from "./schemas";

type StartResult =
  | { ok: true; accessCode: string; reference: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string[] | undefined> };

/** Step 1: record a pending donation and open a Paystack transaction for it. */
export async function startDonation(input: DonateInput): Promise<StartResult> {
  const parsed = donateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Please check the form.", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const { amount, name, email, phone, anonymous } = parsed.data;
  const reference = `GIA-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`.toUpperCase();

  try {
    await db.donation.create({
      data: { reference, amount: amount * 100, donorName: name, email, phone: phone || null, anonymous },
    });
    const tx = await initializeTransaction({
      email,
      amount: amount * 100,
      reference,
      metadata: {
        custom_fields: [
          { display_name: "Donor name", variable_name: "donor_name", value: name },
          { display_name: "Phone", variable_name: "phone", value: phone || "-" },
          { display_name: "Anonymous", variable_name: "anonymous", value: anonymous ? "Yes" : "No" },
        ],
      },
    });
    return { ok: true, accessCode: tx.access_code, reference };
  } catch (error) {
    console.error("startDonation failed", error);
    await db.donation.updateMany({ where: { reference, status: "PENDING" }, data: { status: "FAILED" } }).catch(() => {});
    return { ok: false, message: "We couldn't start the payment. Please try again or use the MoMo details below." };
  }
}

/** Step 2: after the popup reports success, confirm with Paystack server-to-server. */
export async function confirmDonation(reference: string) {
  try {
    const tx = await verifyTransaction(reference);
    const donation = await applyPaystackResult(tx);
    return { ok: donation?.status === "SUCCESS" };
  } catch (error) {
    console.error("confirmDonation failed", error);
    // The webhook will still reconcile it
    return { ok: false };
  }
}

/** Popup closed without paying. */
export async function cancelDonation(reference: string) {
  await db.donation.updateMany({ where: { reference, status: "PENDING" }, data: { status: "ABANDONED" } });
}
