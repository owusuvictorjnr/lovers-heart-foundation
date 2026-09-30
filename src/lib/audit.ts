export interface AuditLogEntry {
  action: "EXPORT_DONATIONS" | "EXPORT_OVERSIZED_ATTEMPT" | "LOGIN" | "PASSWORD_CHANGE" | string;
  actor: {
    userId: string;
    email: string;
  };
  details: Record<string, unknown>;
  timestamp?: string;
  ip?: string | null;
  userAgent?: string | null;
}

export function logAuditEvent(entry: AuditLogEntry) {
  const timestamp = entry.timestamp || new Date().toISOString();
  const structured = {
    level: "AUDIT",
    timestamp,
    ...entry,
  };
  console.info(`[AUDIT_LOG] ${JSON.stringify(structured)}`);
}
