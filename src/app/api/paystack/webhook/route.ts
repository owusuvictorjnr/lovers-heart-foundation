import { NextResponse } from "next/server";
import { isValidWebhookSignature, verifyTransaction } from "@/features/donations/lib/paystack";
import { applyPaystackResult } from "@/features/donations/service";

/**
 * Paystack → our server notification. Set this URL in the Paystack dashboard:
 *   https://<your-domain>/api/paystack/webhook
 * It catches payments even if the donor closes the browser before we confirm.
 */
export async function POST(request: Request) {
  const raw = await request.text();
  if (!isValidWebhookSignature(raw, request.headers.get("x-paystack-signature"))) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(raw) as { event: string; data: { reference: string } };
  if (event.event === "charge.success") {
    try {
      // Re-verify rather than trusting the payload blindly
      await applyPaystackResult(await verifyTransaction(event.data.reference));
    } catch (error) {
      console.error("Webhook processing failed", error);
      return NextResponse.json({ error: "Processing failed" }, { status: 500 }); // Paystack will retry
    }
  }
  return NextResponse.json({ received: true });
}
