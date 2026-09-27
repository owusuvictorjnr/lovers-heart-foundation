import "server-only";
import { db } from "@/lib/db";

export function listPublishedHomes() {
  return db.home.findMany({ where: { published: true }, orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] });
}

export function listAllHomes() {
  return db.home.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] });
}

export function getHome(id: string) {
  return db.home.findUnique({ where: { id } });
}
