import { getSession } from "@/features/auth/lib/session";
import { listDonationsForExport, MAX_EXPORT_ROWS } from "@/features/donations/queries";
import { donationFilterSchema } from "@/features/donations/schemas";
import { logAuditEvent } from "@/lib/audit";
import { formatCedis, formatDate, escapeHtml } from "@/lib/utils";

function csvCell(value: unknown) {
  const s = value == null ? "" : String(value);
  // Quote everything and neutralise spreadsheet formula injection
  return `"${(/^[=+\-@]/.test(s) ? `'${s}` : s).replace(/"/g, '""')}"`;
}

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return new Response("Unauthorized", { status: 401 });

  const url = new URL(request.url);
  const format = url.searchParams.get("format") ?? "csv";

  if (format !== "csv" && format !== "pdf") {
    return new Response("Invalid export format. Only 'csv' and 'pdf' are supported.", {
      status: 400,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const filters = donationFilterSchema.parse(Object.fromEntries(url.searchParams));

  // Date range sanity validation
  if (filters.from && filters.to && filters.from > filters.to) {
    return new Response("Invalid date range: 'From' date must be before or equal to 'To' date.", {
      status: 400,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  // Fetch up to MAX_EXPORT_ROWS + 1 to detect overflow without uncapped memory consumption
  const rows = await listDonationsForExport(filters, MAX_EXPORT_ROWS + 1);

  if (rows.length > MAX_EXPORT_ROWS) {
    logAuditEvent({
      action: "EXPORT_OVERSIZED_ATTEMPT",
      actor: { userId: session.userId, email: session.email },
      details: {
        format,
        limit: MAX_EXPORT_ROWS,
        filters: {
          status: filters.status,
          q: filters.q,
          from: filters.from?.toISOString().slice(0, 10),
          to: filters.to?.toISOString().slice(0, 10),
        },
      },
      userAgent: request.headers.get("user-agent"),
      ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
    });

    return new Response(
      `Export limit exceeded: Found more than ${MAX_EXPORT_ROWS.toLocaleString()} records matching these criteria. Please narrow your date range or search filters before exporting.`,
      {
        status: 413,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      },
    );
  }

  // Log successful audit event
  logAuditEvent({
    action: "EXPORT_DONATIONS",
    actor: { userId: session.userId, email: session.email },
    details: {
      format,
      rowCount: rows.length,
      filters: {
        status: filters.status,
        q: filters.q,
        from: filters.from?.toISOString().slice(0, 10),
        to: filters.to?.toISOString().slice(0, 10),
      },
    },
    userAgent: request.headers.get("user-agent"),
    ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
  });

  // If CSV export requested:
  if (format === "csv") {
    const header = [
      "Date",
      "Donor",
      "Email",
      "Phone",
      "Anonymous",
      "Amount (GHS)",
      "Status",
      "Channel",
      "Reference",
    ];
    const lines = rows.map((d) =>
      [
        (d.paidAt ?? d.createdAt).toISOString(),
        d.donorName,
        d.email,
        d.phone,
        d.anonymous ? "Yes" : "No",
        (d.amount / 100).toFixed(2),
        d.status,
        d.channel,
        d.reference,
      ]
        .map(csvCell)
        .join(","),
    );
    const csv = [header.map(csvCell).join(","), ...lines].join("\n");

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="donations-${new Date().toISOString().slice(0, 10)}.csv"`,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "no-store",
      },
    });
  }

  // Otherwise, render a high-fidelity, print-ready PDF statement
  const totalSuccessful = rows
    .filter((d) => d.status === "SUCCESS")
    .reduce((sum, d) => sum + d.amount, 0);

  const successCount = rows.filter((d) => d.status === "SUCCESS").length;
  const pendingCount = rows.filter((d) => d.status === "PENDING").length;

  const dateGenerated = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const filterSummary: string[] = [];
  if (filters.status) filterSummary.push(`Status: ${escapeHtml(filters.status)}`);
  if (filters.q) filterSummary.push(`Search: "${escapeHtml(filters.q)}"`);
  if (filters.from) filterSummary.push(`From: ${escapeHtml(filters.from.toISOString().slice(0, 10))}`);
  if (filters.to) filterSummary.push(`To: ${escapeHtml(filters.to.toISOString().slice(0, 10))}`);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Donation Statement - Lovers Heart Foundation</title>
  <style>
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background-color: #f7f4ec;
      color: #1a2e22;
      line-height: 1.5;
      padding: 12px;
      -webkit-font-smoothing: antialiased;
    }
    @media (min-width: 640px) {
      body {
        padding: 24px;
      }
    }

    .container {
      max-width: 1040px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e5dec9;
      border-radius: 16px;
      padding: 20px 16px;
      box-shadow: 0 4px 20px rgba(23, 21, 18, 0.05);
      overflow: hidden;
    }
    @media (min-width: 640px) {
      .container {
        padding: 36px 40px;
      }
    }

    .no-print {
      margin-bottom: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      background: #143826;
      color: #ffffff;
      padding: 14px 16px;
      border-radius: 12px;
      max-width: 1040px;
      margin-left: auto;
      margin-right: auto;
    }
    @media (min-width: 640px) {
      .no-print {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        padding: 12px 20px;
        margin-bottom: 24px;
      }
    }
    .no-print-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 14px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
      text-decoration: none;
      border: none;
      transition: opacity 0.2s;
      white-space: nowrap;
    }
    .btn-gold { background: #d4a347; color: #143826; }
    .btn-gold:hover { opacity: 0.9; }
    .btn-subtle { background: rgba(255,255,255,0.15); color: #ffffff; }
    .btn-subtle:hover { background: rgba(255,255,255,0.25); }

    .header {
      display: flex;
      flex-direction: column;
      gap: 14px;
      border-bottom: 2px solid #143826;
      padding-bottom: 16px;
      margin-bottom: 20px;
    }
    @media (min-width: 640px) {
      .header {
        flex-direction: row;
        justify-content: space-between;
        align-items: flex-start;
        padding-bottom: 20px;
        margin-bottom: 24px;
      }
    }

    .brand h1 {
      font-family: "Georgia", "Times New Roman", Times, serif;
      font-size: 22px;
      color: #143826;
      letter-spacing: -0.01em;
    }
    @media (min-width: 640px) {
      .brand h1 {
        font-size: 26px;
      }
    }
    .brand p {
      font-size: 12px;
      color: #637568;
      margin-top: 4px;
    }

    .meta {
      text-align: left;
      font-size: 12px;
      color: #637568;
    }
    @media (min-width: 640px) {
      .meta {
        text-align: right;
      }
    }
    .meta .title {
      font-size: 14px;
      font-weight: 700;
      color: #143826;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      margin-bottom: 20px;
    }
    @media (min-width: 768px) {
      .summary-grid {
        grid-template-columns: repeat(4, 1fr);
        gap: 16px;
        margin-bottom: 28px;
      }
    }
    .metric-card {
      background: #faf8f3;
      border: 1px solid #e5dec9;
      border-radius: 10px;
      padding: 12px 14px;
    }
    .metric-label {
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      color: #637568;
      letter-spacing: 0.05em;
    }
    .metric-value {
      font-size: 17px;
      font-weight: 700;
      color: #143826;
      margin-top: 4px;
    }
    @media (min-width: 640px) {
      .metric-value {
        font-size: 20px;
      }
    }
    .metric-sub {
      font-size: 11px;
      color: #8c7b64;
      margin-top: 2px;
    }

    .filter-bar {
      background: #f4f0e6;
      border-radius: 8px;
      padding: 8px 12px;
      font-size: 11px;
      color: #554d3f;
      margin-bottom: 16px;
      word-break: break-word;
    }

    .table-wrap {
      width: 100%;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      margin-bottom: 20px;
      border-radius: 8px;
      border: 1px solid #e5dec9;
    }

    table {
      width: 100%;
      min-width: 640px;
      border-collapse: collapse;
      font-size: 12px;
    }
    thead {
      background: #faf8f3;
      border-bottom: 1.5px solid #e5dec9;
    }
    th {
      text-align: left;
      padding: 10px 8px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: #637568;
    }
    th.text-right, td.text-right { text-align: right; }
    tbody tr {
      border-bottom: 1px solid #f0ecdf;
    }
    tbody tr:last-child {
      border-bottom: none;
    }
    td {
      padding: 9px 8px;
      vertical-align: middle;
    }
    .mono {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      font-size: 11px;
      color: #637568;
    }

    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 6px;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.03em;
    }
    .badge-success { background: #e8f5ed; color: #17643b; }
    .badge-pending { background: #fef5e7; color: #b46d0a; }
    .badge-failed { background: #fbeae8; color: #c0392b; }
    .badge-abandoned { background: #f0f0f0; color: #777777; }

    .footer {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #e5dec9;
      display: flex;
      flex-direction: column;
      gap: 8px;
      font-size: 11px;
      color: #8c7b64;
    }
    @media (min-width: 640px) {
      .footer {
        flex-direction: row;
        justify-content: space-between;
        margin-top: 32px;
      }
    }

    @media print {
      @page {
        margin: 1.2cm;
        size: landscape;
      }
      body {
        background: #ffffff;
        padding: 0;
      }
      .container {
        border: none;
        padding: 0;
        box-shadow: none;
        max-width: 100%;
      }
      .no-print {
        display: none !important;
      }
      .table-wrap {
        border: none;
        overflow: visible;
      }
      tr {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="no-print">
    <div>
      <strong>Donation Statement Ready</strong> &mdash; Generated ${rows.length} records (${formatCedis(totalSuccessful)} total).
    </div>
    <div class="no-print-actions">
      <button onclick="window.print()" class="btn btn-gold">
        🖨️ Print / Save as PDF
      </button>
      <a href="/api/admin/donations/export?${escapeHtml(url.searchParams.toString().replace("format=pdf", "format=csv"))}" class="btn btn-subtle">
        📥 Download CSV
      </a>
      <button onclick="window.close()" class="btn btn-subtle">
        ✕ Close
      </button>
    </div>
  </div>

  <div class="container">
    <header class="header">
      <div class="brand">
        <h1>Lovers Heart Foundation</h1>
        <p>Lovers Heart Foundation &bull; Registered Non-Profit Organization &bull; Accra, Ghana</p>
      </div>
      <div class="meta">
        <div class="title">Donation Report</div>
        <div>Generated: ${escapeHtml(dateGenerated)}</div>
        <div>Total Entries: ${rows.length}</div>
      </div>
    </header>

    <section class="summary-grid">
      <div class="metric-card">
        <div class="metric-label">Total Received</div>
        <div class="metric-value">${formatCedis(totalSuccessful)}</div>
        <div class="metric-sub">${successCount} successful donation${successCount === 1 ? "" : "s"}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Total Transactions</div>
        <div class="metric-value">${rows.length}</div>
        <div class="metric-sub">All payment statuses</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Pending Verifications</div>
        <div class="metric-value">${pendingCount}</div>
        <div class="metric-sub">Awaiting confirmation</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Currency</div>
        <div class="metric-value">GHS (GH₵)</div>
        <div class="metric-sub">Ghanaian Cedis</div>
      </div>
    </section>

    ${
      filterSummary.length > 0
        ? `<div class="filter-bar"><strong>Active Filter Scope:</strong> ${filterSummary.join(" &bull; ")}</div>`
        : ""
    }

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Donor</th>
            <th>Contact</th>
            <th class="text-right">Amount</th>
            <th>Status</th>
            <th>Channel</th>
            <th>Reference</th>
          </tr>
        </thead>
        <tbody>
          ${
            rows.length === 0
              ? `<tr><td colspan="7" style="text-align: center; padding: 36px; color: #8c7b64;">No donation records match the selected criteria.</td></tr>`
              : rows
                  .map((d) => {
                    const badgeClass =
                      d.status === "SUCCESS"
                        ? "badge-success"
                        : d.status === "PENDING"
                          ? "badge-pending"
                          : d.status === "FAILED"
                            ? "badge-failed"
                            : "badge-abandoned";
                    const dateStr = formatDate(d.paidAt ?? d.createdAt, true);
                    const STATUS_LABELS: Record<string, string> = {
                      SUCCESS: "Success",
                      PENDING: "Pending",
                      FAILED: "Failed",
                      ABANDONED: "Abandoned",
                    };
                    const CHANNEL_LABELS: Record<string, string> = {
                      card: "Card",
                      bank_transfer: "Bank Transfer",
                      mobile_money: "Mobile Money",
                      ussd: "USSD",
                      qr: "QR",
                      eft: "EFT",
                    };
                    const statusLabel = STATUS_LABELS[d.status] || escapeHtml(d.status);
                    const rawChannel = (d.channel || "").toLowerCase();
                    const channelLabel = rawChannel ? (CHANNEL_LABELS[rawChannel] || escapeHtml(rawChannel.replace(/_/g, " "))) : "—";

                    return `<tr>
                      <td style="white-space: nowrap; color: #637568;">${escapeHtml(dateStr)}</td>
                      <td><strong>${escapeHtml(d.donorName)}</strong>${d.anonymous ? ' <span style="font-size:10px; color:#8c7b64;">(anon)</span>' : ""}</td>
                      <td style="color: #637568;">${escapeHtml(d.email || d.phone || "—")}</td>
                      <td class="text-right" style="font-weight: 700; white-space: nowrap;">${formatCedis(d.amount)}</td>
                      <td><span class="badge ${badgeClass}">${statusLabel}</span></td>
                      <td style="color: #637568;">${channelLabel}</td>
                      <td class="mono">${escapeHtml(d.reference)}</td>
                    </tr>`;
                  })
                  .join("")
          }
        </tbody>
      </table>
    </div>

    <footer class="footer">
      <div>Official financial report generated from the Lovers Heart Foundation Admin Portal.</div>
      <div>Page 1 of 1</div>
    </footer>
  </div>
</body>
</html>`;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Security-Policy": "default-src 'self'; style-src 'unsafe-inline'; img-src 'self' data:; font-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-store",
    },
  });
}

export { escapeHtml };
