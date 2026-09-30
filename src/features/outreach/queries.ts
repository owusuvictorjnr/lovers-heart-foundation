import "server-only";
import { db } from "@/lib/db";

export function listOutreach(limit?: number) {
  return db.outreach.findMany({ orderBy: [{ year: "desc" }, { createdAt: "desc" }], take: limit });
}

export function getOutreach(id: string) {
  return db.outreach.findUnique({ where: { id } });
}
