import { describe, it } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { isValidWebhookSignature } from "../src/features/donations/lib/paystack";
import { createUploadSignature, MEDIA_FOLDERS } from "../src/features/media/lib/cloudinary";

// CSV cell formula injection escape function (same logic as in export route)
function csvCell(value: unknown) {
  const s = value == null ? "" : String(value);
  return `"${(/^[=+\-@]/.test(s) ? `'${s}` : s).replace(/"/g, '""')}"`;
}

describe("Security Controls: Webhooks, Signatures & Sanitization", () => {
  const secretKey = process.env.PAYSTACK_SECRET_KEY || "sk_test_ci_placeholder";

  it("validates authentic Paystack HMAC-SHA512 webhook signatures", () => {
    const rawPayload = JSON.stringify({ event: "charge.success", data: { reference: "GIA-123456" } });
    const signature = crypto.createHmac("sha512", secretKey).update(rawPayload).digest("hex");

    assert.equal(isValidWebhookSignature(rawPayload, signature), true);
  });

  it("rejects tampered or forged webhook payloads", () => {
    const rawPayload = JSON.stringify({ event: "charge.success", data: { reference: "GIA-123456" } });
    const signature = crypto.createHmac("sha512", secretKey).update(rawPayload).digest("hex");

    const tamperedPayload = JSON.stringify({ event: "charge.success", data: { reference: "GIA-654321" } });
    assert.equal(isValidWebhookSignature(tamperedPayload, signature), false);
    assert.equal(isValidWebhookSignature(rawPayload, "invalid_signature_hex"), false);
    assert.equal(isValidWebhookSignature(rawPayload, null), false);
  });

  it("generates signed Cloudinary upload params for authorized folders", () => {
    const sig = createUploadSignature("gallery");
    assert.ok(sig.signature);
    assert.equal(sig.folder, MEDIA_FOLDERS.gallery);
    assert.ok(typeof sig.timestamp === "number");
    assert.ok(sig.apiKey);
    assert.ok(sig.cloudName);
  });

  it("neutralizes CSV spreadsheet formula injection vulnerabilities", () => {
    // Dangerous formulas starting with =, +, -, @
    const formula1 = "=SUM(A1:A10)";
    const formula2 = "+cmd|' /C calc'!A0";
    const formula3 = "-2+3*cmd";
    const formula4 = "@SUM(1+1)";
    const safeText = "Kwame Mensah";

    assert.equal(csvCell(formula1), `"'=SUM(A1:A10)"`);
    assert.equal(csvCell(formula2), `"'+cmd|' /C calc'!A0"`);
    assert.equal(csvCell(formula3), `"'-2+3*cmd"`);
    assert.equal(csvCell(formula4), `"'@SUM(1+1)"`);
    assert.equal(csvCell(safeText), `"Kwame Mensah"`);
    assert.equal(csvCell('Text with "quotes"'), `"Text with ""quotes"""`);
  });
});
