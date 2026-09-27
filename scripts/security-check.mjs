#!/usr/bin/env node
/**
 * Project-specific security rules, enforced in CI (and runnable locally: `npm run security:check`).
 * Fails the build with a clear message for each violation.
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const SRC = join(ROOT, "src");
const errors = [];
const fail = (file, msg) => errors.push(`✖ ${relative(ROOT, file)}: ${msg}`);

/** Server actions that are intentionally callable by anonymous visitors. Keep this list short. */
const PUBLIC_ACTIONS = new Set([
  "login", "logout",                                  // auth
  "startDonation", "confirmDonation", "cancelDonation", // donors
  "sendMessage",                                       // contact form
  "signUpVolunteer",                                   // volunteer form
]);

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (name === "generated" || name === "node_modules") return [];
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

const files = walk(SRC).filter((f) => /\.(ts|tsx|mjs|js)$/.test(f));
const read = (f) => readFileSync(f, "utf8");

// ── Rule 1: every non-public server action must call requireAdmin() ──────────
for (const file of files.filter((f) => f.endsWith("actions.ts"))) {
  const src = read(file);
  if (!/^\s*["']use server["'];?/.test(src)) fail(file, 'actions.ts must start with "use server"');
  const parts = src.split(/(?=export\s+async\s+function\s+)/).slice(1);
  for (const part of parts) {
    const name = part.match(/export\s+async\s+function\s+(\w+)/)?.[1];
    const body = part.split(/\nexport\s/)[0];
    if (!PUBLIC_ACTIONS.has(name) && !/await\s+requireAdmin\(\)/.test(body)) {
      fail(file, `server action "${name}" must call \`await requireAdmin()\` (or be added to PUBLIC_ACTIONS with a reason)`);
    }
  }
  if (/export\s+(const|function)\s+/.test(src.replace(/export\s+async\s+function/g, ""))) {
    fail(file, "only `export async function` is allowed in a server actions file");
  }
}

// ── Rule 2: server-only modules must import "server-only" ─────────────────────
const serverOnlyPattern = /(queries|service)\.ts$|\/lib\/(db|env)\.ts$|\/lib\/(paystack|cloudinary|session)\.ts$/;
for (const file of files.filter((f) => serverOnlyPattern.test(f))) {
  if (!/import\s+["']server-only["']/.test(read(file))) fail(file, 'must `import "server-only"` so it can never ship to the browser');
}

// ── Rule 3: client components must not import server modules ─────────────────
for (const file of files) {
  const src = read(file);
  if (!/^\s*["']use client["']/.test(src)) continue;
  for (const m of src.matchAll(/^import\s+(?!type\b)[^;]*from\s+["']([^"']+)["']/gm)) {
    const spec = m[1];
    if (/(@\/lib\/db|@\/lib\/env|\/queries|\/service|\/lib\/(paystack|cloudinary|session))$/.test(spec)) {
      fail(file, `client component imports server module "${spec}"`);
    }
  }
}

// ── Rule 4: dangerous APIs ────────────────────────────────────────────────────
const banned = [
  [/dangerouslySetInnerHTML/, "dangerouslySetInnerHTML (XSS risk)"],
  [/\beval\s*\(/, "eval()"],
  [/new\s+Function\s*\(/, "new Function()"],
  [/\$(queryRawUnsafe|executeRawUnsafe)\b/, "Prisma *RawUnsafe (SQL injection risk): use $queryRaw`...` tagged templates"],
  [/console\.(log|info|debug)\([^)]*process\.env/, "logging process.env"],
];
for (const file of files) {
  const src = read(file);
  for (const [re, label] of banned) if (re.test(src)) fail(file, `uses ${label}`);
}

// ── Rule 5: never expose secrets through NEXT_PUBLIC_* ────────────────────────
const secretish = /NEXT_PUBLIC_\w*(SECRET|PASSWORD|TOKEN|PRIVATE|DATABASE|API_KEY)\w*/;
for (const file of [...files, join(ROOT, ".env.example")].filter(existsSync)) {
  const hit = read(file).match(secretish);
  if (hit) fail(file, `"${hit[0]}" looks like a secret exposed to the browser`);
}

// ── Rule 6: no real env files committed (CI checkouts only contain tracked files) ─
if (process.env.CI) {
  for (const name of readdirSync(ROOT)) {
    if (/^\.env(\..+)?$/.test(name) && name !== ".env.example") fail(join(ROOT, name), "env file must not be committed");
  }
}

if (errors.length) {
  console.error(`\nSecurity check failed (${errors.length}):\n\n${errors.join("\n")}\n`);
  process.exit(1);
}
console.log(`✔ Security check passed (${files.length} files)`);