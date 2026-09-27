import "server-only";
import { db } from "@/lib/db";

export function listMessages(filter: "all" | "unread" = "all") {
  return db.message.findMany({ where: filter === "unread" ? { read: false } : undefined, orderBy: { createdAt: "desc" } });
}

export function countUnreadMessages() {
  return db.message.count({ where: { read: false } });
}
