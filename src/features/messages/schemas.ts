import { z } from "zod";

export const messageTopics = ["Make a donation", "Donate items", "Partner with you", "Something else"] as const;

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(100),
  contact: z.string().trim().min(5, "Enter a phone number or email").max(120),
  topic: z.enum(messageTopics).catch("Something else"),
  body: z.string().trim().min(5, "Write a short message").max(2000),
  // Honeypot: real people never fill this hidden field
  website: z.string().max(0).optional(),
});
