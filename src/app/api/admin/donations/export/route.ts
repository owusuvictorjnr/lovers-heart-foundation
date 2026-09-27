import { getSession } from "@/features/auth/lib/session";
import { listDonationsForExport } from "@/features/donations/queries";
import { donationFilterSchema } from "@/features/donations/schemas";

function csvCell(value: unknown) {
  const s = value == null ? "" : String(value);
  // Quote everything and neutralise spreadsheet formula injection
  return `"${(/^[=+\-@]/.test(s) ? `'${s}` : s).replace(/"/g, '""')}"`;
}

export async function GET(request: Request) {
  if (!(await getSession())) return new Response("Unauthorized", { status: 401 });

  const filters = donationFilterSchema.parse(Object.fromEntries(new URL(request.url).searchParams));
  const rows = await listDonationsForExport(filters);

  const header = ["Date", "Donor", "Email", "Phone", "Anonymous", "Amount (GHS)", "Status", "Channel", "Reference"];
  const lines = rows.map((d) =>
    [
      (d.paidAt ?? d.createdAt).toISOString(), d.donorName, d.email, d.phone, d.anonymous ? "Yes" : "No",
      (d.amount / 100).toFixed(2), d.status, d.channel, d.reference,
    ].map(csvCell).join(","),
  );
  const csv = [header.map(csvCell).join(","), ...lines].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="donations-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
