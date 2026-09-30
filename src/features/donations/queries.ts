import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import type { DonationFilters } from "./schemas";

export const DONATIONS_PAGE_SIZE = 20;

function buildWhere({ status, q, from, to }: DonationFilters): Prisma.DonationWhereInput {
  return {
    ...(status && { status }),
    ...(q && {
      OR: [
        { donorName: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { reference: { contains: q, mode: "insensitive" } },
      ],
    }),
    ...((from || to) && { createdAt: { ...(from && { gte: from }), ...(to && { lte: endOfDay(to) }) } }),
  };
}

function endOfDay(d: Date) {
  const e = new Date(d);
  e.setHours(23, 59, 59, 999);
  return e;
}

export async function listDonations(filters: DonationFilters) {
  const where = buildWhere(filters);
  const [items, total, sum] = await Promise.all([
    db.donation.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (filters.page - 1) * DONATIONS_PAGE_SIZE,
      take: DONATIONS_PAGE_SIZE,
    }),
    db.donation.count({ where }),
    db.donation.aggregate({ where: { ...where, status: "SUCCESS" }, _sum: { amount: true } }),
  ]);
  return { items, total, pages: Math.max(1, Math.ceil(total / DONATIONS_PAGE_SIZE)), successTotal: sum._sum.amount ?? 0 };
}

export const MAX_EXPORT_ROWS = 5_000;

export function listDonationsForExport(filters: DonationFilters, limit = MAX_EXPORT_ROWS + 1) {
  return db.donation.findMany({
    where: buildWhere(filters),
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getDonationStats() {
  const startOfYear = new Date(new Date().getFullYear(), 0, 1);
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const [allTime, thisYear, thisMonth, recent] = await Promise.all([
    db.donation.aggregate({ where: { status: "SUCCESS" }, _sum: { amount: true }, _count: true }),
    db.donation.aggregate({ where: { status: "SUCCESS", paidAt: { gte: startOfYear } }, _sum: { amount: true }, _count: true }),
    db.donation.aggregate({ where: { status: "SUCCESS", paidAt: { gte: startOfMonth } }, _sum: { amount: true }, _count: true }),
    db.donation.findMany({ where: { status: "SUCCESS" }, orderBy: { paidAt: "desc" }, take: 5 }),
  ]);
  return {
    allTime: { amount: allTime._sum.amount ?? 0, count: allTime._count },
    thisYear: { amount: thisYear._sum.amount ?? 0, count: thisYear._count },
    thisMonth: { amount: thisMonth._sum.amount ?? 0, count: thisMonth._count },
    recent,
  };
}
