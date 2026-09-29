import "server-only";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient() {
  const connectionString = process.env.DATABASE_URL;
  const isSupabase =
    connectionString?.includes("supabase.com") ||
    connectionString?.includes("pooler.supabase.com");
  const cleanUrl = isSupabase
    ? connectionString?.replace(/[?&]sslmode=[^&]+/, "")
    : connectionString;
  const pool = new Pool({
    connectionString: cleanUrl,
    ssl: isSupabase ? { rejectUnauthorized: false } : undefined,
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

function getClient(): PrismaClient {
  if (globalForPrisma.prisma && "siteContent" in globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }
  const client = createClient();
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = client;
  return client;
}

// Reuse one client across hot reloads in development, auto-refreshing if schema changed
export const db = getClient();
