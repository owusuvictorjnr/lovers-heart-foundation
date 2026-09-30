import "server-only";
import type { VolunteerStatus } from "@/generated/prisma/client";
import { db } from "@/lib/db";

export function listVolunteers(status?: VolunteerStatus) {
  return db.volunteer.findMany({ where: status ? { status } : undefined, orderBy: { createdAt: "desc" } });
}

export function countNewVolunteers() {
  return db.volunteer.count({ where: { status: "NEW" } });
}
