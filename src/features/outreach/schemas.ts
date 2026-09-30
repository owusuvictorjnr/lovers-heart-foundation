import { z } from "zod";

export const outreachSchema = z.object({
  year: z.coerce.number().int().min(2000, "Enter a valid year").max(2100),
  title: z.string().trim().min(2, "Add a title").max(120),
  summary: z.string().trim().min(5, "Add a short summary").max(400),
  date: z.union([z.literal("").transform(() => null), z.coerce.date()]).optional().transform((v) => v ?? null),
  homesCount: z.coerce.number().int().min(0).default(0),
  childrenReached: z.coerce.number().int().min(0).default(0),
  upcoming: z.preprocess((v) => v === "on" || v === true, z.boolean()),
});
