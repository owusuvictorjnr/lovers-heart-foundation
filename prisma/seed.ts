/**
 * Seeds the first admin account and sample content.
 * Run: pnpm db:seed   (safe to re-run: skips what already exists)
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
const isSupabase = connectionString?.includes("supabase.com") || connectionString?.includes("pooler.supabase.com");
const cleanUrl = isSupabase ? connectionString?.replace(/[?&]sslmode=[^&]+/, "") : connectionString;
const pool = new Pool({
  connectionString: cleanUrl,
  ssl: isSupabase ? { rejectUnauthorized: false } : undefined,
});
const db = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  const email = process.env.ADMIN_EMAIL?.toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD in .env");
  if (password.length < 10) throw new Error("ADMIN_PASSWORD must be at least 10 characters");

  const hash = await bcrypt.hash(password, 12);
  await db.adminUser.upsert({
    where: { email },
    update: { passwordHash: hash },
    create: { email, name: "Administrator", passwordHash: hash },
  });
  console.log(`✔ Admin: ${email}`);

  if ((await db.home.count()) === 0) {
    await db.home.createMany({
      data: [
        { name: "[Children's Home Name]", region: "Greater Accra", description: "Food items, mattresses and school uniforms for 60+ children.", sortOrder: 1 },
        { name: "[Children's Home Name]", region: "Ashanti", description: "Books, stationery and a water storage tank for the home.", sortOrder: 2 },
        { name: "[Children's Home Name]", region: "Central", description: "Clothing, toiletries and a Christmas party for the children.", sortOrder: 3 },
      ],
    });
    console.log("✔ Sample homes");
  }

  if ((await db.outreach.count()) === 0) {
    const y = new Date().getFullYear();
    await db.outreach.createMany({
      data: [
        { year: y, title: "This year's outreach", summary: "Target: 5 homes and 400 children. Date to be announced.", upcoming: true },
        { year: y - 1, title: "4 homes · Eastern & Volta", summary: "Delivered rice, oil, sanitary products, school bags and shoes.", homesCount: 4, childrenReached: 320 },
        { year: y - 2, title: "3 homes · Greater Accra", summary: "Hosted a fun day with meals, games and gifts for every child.", homesCount: 3, childrenReached: 210 },
        { year: y - 3, title: "3 homes · Ashanti", summary: "Funded school fees and provided learning materials.", homesCount: 3, childrenReached: 180 },
      ],
    });
    console.log("✔ Sample outreach");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());



