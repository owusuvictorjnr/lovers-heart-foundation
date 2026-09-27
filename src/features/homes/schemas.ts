import { z } from "zod";
import { ghanaRegions } from "@/config/site";

export const homeSchema = z.object({
  name: z.string().trim().min(2, "Enter the home's name").max(120),
  region: z.enum(ghanaRegions, { error: "Choose a region" }),
  description: z.string().trim().min(5, "Describe what was donated").max(400),
  imageUrl: z.url().optional().or(z.literal("")).transform((v) => v || null),
  sortOrder: z.coerce.number().int().default(0),
  published: z.preprocess((v) => v === "on" || v === true, z.boolean()),
});
