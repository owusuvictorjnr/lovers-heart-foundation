import "server-only";
import { z } from "zod";

/** Read a required server env var lazily so builds don't fail when it's unset. */
export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

const baseEnvSchema = z.object({
  APP_ENV: z.enum(["development", "staging", "production"]).default("development"),
  DATABASE_URL: z.string().startsWith("postgres", "DATABASE_URL must be a PostgreSQL URL"),
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET must be at least 32 characters"),
  PAYSTACK_SECRET_KEY: z.string().regex(/^sk_(test|live)_/, "PAYSTACK_SECRET_KEY must start with sk_test_ or sk_live_"),
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
  NEXT_PUBLIC_SITE_URL: z.string().url(),
});

export type ServerEnv = z.infer<typeof baseEnvSchema>;

const serverEnvSchema = baseEnvSchema.superRefine((env: ServerEnv, ctx: { addIssue: (issue: { code: "custom"; path: (string | number)[]; message: string }) => void }) => {
  const live = env.PAYSTACK_SECRET_KEY.startsWith("sk_live_");
  if (env.APP_ENV === "production" && !live) {
    ctx.addIssue({ code: "custom", path: ["PAYSTACK_SECRET_KEY"], message: "production requires a live Paystack key" });
  }
  if (env.APP_ENV !== "production" && live) {
    ctx.addIssue({ code: "custom", path: ["PAYSTACK_SECRET_KEY"], message: `live Paystack key is not allowed in ${env.APP_ENV}` });
  }
  if (env.APP_ENV !== "development" && !env.NEXT_PUBLIC_SITE_URL.startsWith("https://")) {
    ctx.addIssue({ code: "custom", path: ["NEXT_PUBLIC_SITE_URL"], message: "must use https outside development" });
  }
});

/** Called once at server start (src/instrumentation.ts). Crashes early on bad config. */
export function validateServerEnv() {
  const result = serverEnvSchema.safeParse(process.env);
  if (!result.success) {
    // Only names and reasons, never values
    const issues = result.error.issues.map((i: { path: PropertyKey[]; message?: string }) => `  - ${i.path.join(".")}: ${i.message ?? ""}`).join("\n");
    throw new Error(`Invalid server environment:\n${issues}`);
  }
  return result.data;
}