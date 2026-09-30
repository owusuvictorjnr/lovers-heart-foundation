#!/usr/bin/env node
/**
 * Validates the environment pulled from Vercel before building a deploy.
 * Prints key NAMES only, never values.
 * Usage: node scripts/verify-deploy-env.mjs <env-file> <staging|production>
 */
import { readFileSync } from "node:fs";

const [file, expected] = process.argv.slice(2);
if (!file || !["staging", "production"].includes(expected)) {
  console.error("Usage: verify-deploy-env.mjs <env-file> <staging|production>");
  process.exit(2);
}

const env = Object.fromEntries(
  readFileSync(file, "utf8")
    .split("\n")
    .map((l) => l.match(/^\s*([A-Z0-9_]+)\s*=\s*"?(.*?)"?\s*$/))
    .filter(Boolean)
    .map((m) => [m[1], m[2]]),
);

const errors = [];
const required = [
  "APP_ENV", "DATABASE_URL", "AUTH_SECRET", "PAYSTACK_SECRET_KEY",
  "CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET", "NEXT_PUBLIC_SITE_URL",
];
for (const key of required) if (!env[key]) errors.push(`missing ${key}`);

if (env.APP_ENV && env.APP_ENV !== expected) {
  errors.push(`APP_ENV is "${env.APP_ENV}" but this job deploys "${expected}". Wrong Vercel project?`);
}
if (env.AUTH_SECRET && env.AUTH_SECRET.length < 32) errors.push("AUTH_SECRET must be at least 32 characters");
if (expected === "production" && env.PAYSTACK_SECRET_KEY && !env.PAYSTACK_SECRET_KEY.startsWith("sk_live_")) {
  errors.push("production must use a live Paystack key (sk_live_…)");
}
if (expected === "staging" && env.PAYSTACK_SECRET_KEY?.startsWith("sk_live_")) {
  errors.push("staging must NEVER use a live Paystack key");
}
if (env.NEXT_PUBLIC_SITE_URL && !env.NEXT_PUBLIC_SITE_URL.startsWith("https://")) {
  errors.push("NEXT_PUBLIC_SITE_URL must use https://");
}
if (env.DATABASE_URL && !/sslmode=(require|verify-full)/.test(env.DATABASE_URL)) {
  errors.push("DATABASE_URL must enforce TLS (add ?sslmode=require)");
}
for (const key of Object.keys(env)) {
  if (/^NEXT_PUBLIC_\w*(SECRET|PASSWORD|TOKEN|PRIVATE|DATABASE|API_KEY)/.test(key)) errors.push(`${key} would expose a secret to browsers`);
}

if (errors.length) {
  console.error(`\n✖ Environment check failed for ${expected}:\n  - ${errors.join("\n  - ")}\n`);
  process.exit(1);
}
console.log(`✔ ${expected} environment OK (${Object.keys(env).length} variables)`);