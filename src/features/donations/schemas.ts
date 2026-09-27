import { z } from "zod";

export const donateSchema = z.object({
  amount: z.coerce
    .number({ error: "Enter an amount" })
    .int("Whole cedis only")
    .min(1, "Minimum is GH₵ 1")
    .max(1_000_000, "For large gifts please contact us directly"),
  name: z.string().trim().min(2, "Enter your name").max(100),
  email: z.email("Enter a valid email for your receipt").trim().toLowerCase(),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  anonymous: z.boolean().default(false),
});
export type DonateInput = z.infer<typeof donateSchema>;

export const donationStatuses = ["PENDING", "SUCCESS", "FAILED", "ABANDONED"] as const;

export const donationFilterSchema = z.object({
  status: z.enum(donationStatuses).optional().catch(undefined),
  q: z.string().trim().max(100).optional().catch(undefined),
  from: z.coerce.date().optional().catch(undefined),
  to: z.coerce.date().optional().catch(undefined),
  page: z.coerce.number().int().min(1).default(1).catch(1),
});
export type DonationFilters = z.infer<typeof donationFilterSchema>;

export const donationActionSchema = z.object({
  reference: z
    .string()
    .trim()
    .min(5, "Reference too short")
    .max(100, "Reference too long")
    .regex(/^GIA-\d+-[a-zA-Z0-9_-]+$/, "Invalid donation reference format"),
  token: z.string().trim().min(32, "Invalid token").max(128, "Invalid token"),
});
export type DonationActionInput = z.infer<typeof donationActionSchema>;

