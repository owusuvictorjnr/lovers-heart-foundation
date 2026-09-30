import "dotenv/config";
import { defineConfig } from "prisma/config";

const rawUrl = process.env.DIRECT_URL || process.env.DATABASE_URL || "";
// Prisma Migrate requires a direct connection / session pooler (port 5432), not transaction pooler (port 6543)
const migrationUrl = rawUrl.includes("pooler.supabase.com:6543")
  ? rawUrl.replace("pooler.supabase.com:6543", "pooler.supabase.com:5432")
  : rawUrl;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: migrationUrl,
  },
});

