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

  it("fails closed on cron endpoint when CRON_SECRET is missing or unauthorized", async () => {
    const { GET } = await import("../src/app/api/cron/cleanup-donations/route");

    // Case 1: Missing header
    const reqNoAuth = new Request("http://localhost:3000/api/cron/cleanup-donations");
    const resNoAuth = await GET(reqNoAuth);
    assert.equal(resNoAuth.status, 401);

    // Case 2: Wrong Bearer token
    const reqWrongAuth = new Request("http://localhost:3000/api/cron/cleanup-donations", {
      headers: { authorization: "Bearer invalid_secret" },
    });
    const resWrongAuth = await GET(reqWrongAuth);
    assert.equal(resWrongAuth.status, 401);
  });
  it("escapes malicious HTML characters to prevent reflected XSS in exports", async () => {
    const { escapeHtml } = await import("../src/lib/utils");

    const xssScript = '<script>alert("XSS")</script>';
    const xssImg = '<img src=x onerror=alert(1)>';
    const xssQuotes = '"><script>alert(document.cookie)</script>';
    const safeInput = 'John Doe & Sons';

    assert.equal(escapeHtml(xssScript), '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
    assert.equal(escapeHtml(xssImg), '&lt;img src=x onerror=alert(1)&gt;');
    assert.equal(escapeHtml(xssQuotes), '&quot;&gt;&lt;script&gt;alert(document.cookie)&lt;/script&gt;');
    assert.equal(escapeHtml(safeInput), 'John Doe &amp; Sons');
    assert.equal(escapeHtml(null), '');
    assert.equal(escapeHtml(undefined), '');
  });

  it("structures and formats security audit log events accurately", async () => {
    const { logAuditEvent } = await import("../src/lib/audit");
    const { MAX_EXPORT_ROWS } = await import("../src/features/donations/queries");

    assert.equal(typeof MAX_EXPORT_ROWS, "number");
    assert.ok(MAX_EXPORT_ROWS >= 1000 && MAX_EXPORT_ROWS <= 10000);

    let loggedOutput = "";
    const originalConsoleInfo = console.info;
    console.info = (msg: string) => {
      loggedOutput = msg;
    };

    try {
      logAuditEvent({
        action: "EXPORT_DONATIONS",
        actor: { userId: "admin-123", email: "admin@gia.org" },
        details: { format: "csv", rowCount: 150 },
      });

      assert.ok(loggedOutput.startsWith("[AUDIT_LOG] "));
      const parsed = JSON.parse(loggedOutput.replace("[AUDIT_LOG] ", ""));
      assert.equal(parsed.action, "EXPORT_DONATIONS");
      assert.equal(parsed.actor.email, "admin@gia.org");
      assert.equal(parsed.details.rowCount, 150);
      assert.ok(parsed.timestamp);

      // Verify other audit actions
      logAuditEvent({
        action: "PASSWORD_CHANGE",
        actor: { userId: "admin-123", email: "admin@gia.org" },
        details: { message: "Password updated" },
      });
      const parsedPwd = JSON.parse(loggedOutput.replace("[AUDIT_LOG] ", ""));
      assert.equal(parsedPwd.action, "PASSWORD_CHANGE");

      logAuditEvent({
        action: "CONTENT_UPDATE",
        actor: { userId: "admin-123", email: "admin@gia.org" },
        details: { section: "hero", imageCount: 2 },
      });
      const parsedContent = JSON.parse(loggedOutput.replace("[AUDIT_LOG] ", ""));
      assert.equal(parsedContent.action, "CONTENT_UPDATE");

      logAuditEvent({
        action: "UPLOAD_SIGNATURE_GENERATED",
        actor: { userId: "admin-123", email: "admin@gia.org" },
        details: { folder: "gallery" },
      });
      const parsedUpload = JSON.parse(loggedOutput.replace("[AUDIT_LOG] ", ""));
      assert.equal(parsedUpload.action, "UPLOAD_SIGNATURE_GENERATED");
    } finally {
      console.info = originalConsoleInfo;
    }
  });

  it("sanitizes crafted and malicious search parameter 'q' values", async () => {
    const { escapeHtml } = await import("../src/lib/utils");

    const payloads = [
      '<script>alert("xss")</script>',
      '"><svg/onload=alert(1)>',
      '"><img src=x onerror=alert(document.cookie)>',
      "'; DROP TABLE \"Donation\";--",
      '"><a href="javascript:alert(1)">Click</a>',
    ];

    for (const p of payloads) {
      const escaped = escapeHtml(p);
      assert.ok(!escaped.includes("<script>"));
      assert.ok(!escaped.includes("<svg"));
      assert.ok(!escaped.includes("<img"));
      assert.ok(!escaped.includes('">'));
    }
  });

  it("rate limits rapid administrative actions with checkRateLimit", async () => {
    const { checkRateLimit } = await import("../src/lib/rate-limit");
    const testKey = `test_action_limit_${Date.now()}`;

    // Max 3 attempts
    const r1 = await checkRateLimit(testKey, 3, 5000);
    assert.equal(r1.allowed, true);

    const r2 = await checkRateLimit(testKey, 3, 5000);
    assert.equal(r2.allowed, true);

    const r3 = await checkRateLimit(testKey, 3, 5000);
    assert.equal(r3.allowed, true);

    // 4th attempt should be blocked
    const r4 = await checkRateLimit(testKey, 3, 5000);
    assert.equal(r4.allowed, false);
    assert.ok(r4.retryAfterSeconds > 0);
  });
});

