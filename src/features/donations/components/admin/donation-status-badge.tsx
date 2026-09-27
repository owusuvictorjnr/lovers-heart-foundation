import { Badge } from "@/components/ui/card";
import type { DonationStatus } from "@/generated/prisma/client";

const tones = { SUCCESS: "green", PENDING: "gold", FAILED: "red", ABANDONED: "gray" } as const;

export function DonationStatusBadge({ status }: { status: DonationStatus }) {
  return <Badge tone={tones[status]}>{status.charAt(0) + status.slice(1).toLowerCase()}</Badge>;
}
