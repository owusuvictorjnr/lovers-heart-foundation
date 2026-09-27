#!/usr/bin/env node
/**
 * Post-deploy smoke + security checks against the live URL.
 * Usage: node scripts/smoke-test.mjs https://staging.example.org
 */
const base = (process.argv[2] ?? "").replace(/\/$/, "");
if (!/^https:\/\//.test(base)) {
  console.error("Usage: smoke-test.mjs https://<deployment-url>");
  process.exit(2);
}

const errors = [];
const check = (ok, msg) => { console.log(`${ok ? "✔" : "✖"} ${msg}`); if (!ok) errors.push(msg); };

async function get(path, init = {}) {
  for (let attempt = 1; ; attempt++) {
    try {
      return await fetch(base + path, { redirect: "manual", ...init });
    } catch (e) {
      if (attempt >= 5) throw e;
      await new Promise((r) => setTimeout(r, attempt * 3000)); // cold starts
    }
  }
}

const home = await get("/");
check(home.status === 200, `GET / → 200 (got ${home.status})`);

const h = home.headers;
check(/max-age=\d{7,}/.test(h.get("strict-transport-security") ?? ""), "HSTS header");
check((h.get("content-security-policy") ?? "").includes("frame-ancestors 'none'"), "CSP with frame-ancestors 'none'");
check(h.get("x-content-type-options") === "nosniff", "X-Content-Type-Options: nosniff");
check(h.get("x-frame-options") === "DENY", "X-Frame-Options: DENY");
check(!!h.get("referrer-policy"), "Referrer-Policy header");
check(!!h.get("permissions-policy"), "Permissions-Policy header");
check(!h.get("x-powered-by"), "No X-Powered-By header");

const admin = await get("/admin/donations");
check([307, 308].includes(admin.status) && (admin.headers.get("location") ?? "").includes("/admin/login"),
  `Unauthenticated /admin/donations redirects to login (got ${admin.status})`);

const exp = await get("/api/admin/donations/export");
check(exp.status === 401, `Unauthenticated CSV export → 401 (got ${exp.status})`);

const hook = await get("/api/paystack/webhook", { method: "POST", body: "{}", headers: { "content-type": "application/json" } });
check(hook.status === 401, `Unsigned Paystack webhook → 401 (got ${hook.status})`);

const login = await get("/admin/login");
check(login.status === 200, `GET /admin/login → 200 (got ${login.status})`);

if (errors.length) {
  console.error(`\n${errors.length} check(s) failed.`);
  process.exit(1);
}
console.log("\nAll smoke & security checks passed.");