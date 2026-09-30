import "server-only";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForDb = globalThis as unknown as {
  prisma?: PrismaClient;
  pool?: Pool;
};

function getClient(): PrismaClient {
  if (globalForDb.prisma && "siteContent" in globalForDb.prisma) {
    return globalForDb.prisma;
  }

  if (globalForDb.pool) {
    globalForDb.pool.end().catch(() => {});
  }

  const connectionString = process.env.DATABASE_URL ?? "";
  const isSupabase =
    connectionString.includes("supabase.com") ||
    connectionString.includes("pooler.supabase.com");
  const isNeon = connectionString.includes("neon.tech");
  const hasSslMode = connectionString.includes("sslmode=");

  let cleanUrl = connectionString;
  if (isSupabase || isNeon || hasSslMode) {
    cleanUrl = cleanUrl.replace(/[?&]sslmode=[^&]+/, "");
  }
  if (isSupabase && cleanUrl.includes("pooler.supabase.com:5432")) {
    cleanUrl = cleanUrl.replace("pooler.supabase.com:5432", "pooler.supabase.com:6543");
  }

  const pool = new Pool({
    connectionString: cleanUrl,
    ssl: isSupabase || isNeon || hasSslMode ? { rejectUnauthorized: false } : undefined,
    max: 10,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 10000,
  });

  const adapter = new PrismaPg(pool);
  const client = new PrismaClient({ adapter });

  globalForDb.prisma = client;
  globalForDb.pool = pool;

  return client;
}

// Reuse one client and connection pool across hot reloads in development
export const db = getClient();
