import { z } from "zod";

export const volunteerStatuses = ["NEW", "CONTACTED", "ACTIVE", "ARCHIVED"] as const;

export const volunteerSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(100),
  email: z.email("Enter a valid email").trim().toLowerCase(),
  phone: z.string().trim().min(9, "Enter a valid phone number").max(20),
  message: z.string().trim().max(1000).optional().transform((v) => v || null),
  website: z.string().max(0).optional(), // honeypot
});
