import "server-only";
import crypto from "node:crypto";
import { requireEnv } from "@/lib/env";

const BASE = "https://api.paystack.co";

type PaystackResponse<T> = { status: boolean; message: string; data: T };

export type PaystackTransaction = {
  reference: string;
  status: "success" | "failed" | "abandoned" | "ongoing" | "pending" | "reversed";
  amount: number; // pesewas
  currency: string;
  channel: string;
  paid_at: string | null;
};

async function paystack<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${requireEnv("PAYSTACK_SECRET_KEY")}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });
  const json = (await res.json()) as PaystackResponse<T>;
  if (!res.ok || !json.status) throw new Error(`Paystack: ${json.message ?? res.statusText}`);
  return json.data;
}

export function initializeTransaction(input: {
  email: string;
  amount: number; // pesewas
  reference: string;
  metadata?: Record<string, unknown>;
}) {
  return paystack<{ access_code: string; reference: string; authorization_url: string }>(
    "/transaction/initialize",
    {
      method: "POST",
      body: JSON.stringify({
        ...input,
        amount: String(input.amount),
        currency: "GHS",
        channels: ["mobile_money", "card", "bank_transfer"],
      }),
    },
  );
}

export function verifyTransaction(reference: string) {
  return paystack<PaystackTransaction>(`/transaction/verify/${encodeURIComponent(reference)}`);
}

/** Paystack signs webhook bodies with HMAC-SHA512 using your secret key. */
export function isValidWebhookSignature(rawBody: string, signature: string | null) {
  if (!signature) return false;
  const expected = crypto.createHmac("sha512", requireEnv("PAYSTACK_SECRET_KEY")).update(rawBody).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
