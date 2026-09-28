import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Scheduled job to mark stale PENDING donations (older than 24 hours) as ABANDONED.
 * Can be triggered by Vercel Cron or any scheduled HTTP caller.
 */
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago

  try {
    const result = await db.donation.updateMany({
      where: {
        status: "PENDING",
        createdAt: { lt: cutoff },
      },
      data: {
        status: "ABANDONED",
      },
    });

    return NextResponse.json({
      ok: true,
      abandonedCount: result.count,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to clean up stale donations:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
