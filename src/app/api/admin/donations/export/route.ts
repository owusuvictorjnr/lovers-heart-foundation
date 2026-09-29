import { getSession } from "@/features/auth/lib/session";
import { listDonationsForExport } from "@/features/donations/queries";
import { donationFilterSchema } from "@/features/donations/schemas";
import { formatCedis, formatDate } from "@/lib/utils";

function csvCell(value: unknown) {
  const s = value == null ? "" : String(value);
  // Quote everything and neutralise spreadsheet formula injection
  return `"${(/^[=+\-@]/.test(s) ? `'${s}` : s).replace(/"/g, '""')}"`;
}

export async function GET(request: Request) {
  if (!(await getSession())) return new Response("Unauthorized", { status: 401 });

  const url = new URL(request.url);
  const format = url.searchParams.get("format") || "csv";
  const filters = donationFilterSchema.parse(Object.fromEntries(url.searchParams));
  const rows = await listDonationsForExport(filters);

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
  if (filters.status) filterSummary.push(`Status: ${filters.status}`);
  if (filters.q) filterSummary.push(`Search: "${filters.q}"`);
  if (filters.from) filterSummary.push(`From: ${filters.from.toISOString().slice(0, 10)}`);
  if (filters.to) filterSummary.push(`To: ${filters.to.toISOString().slice(0, 10)}`);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Donations Statement - God Is Alive Foundation</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Playfair+Display:wght@700&family=JetBrains+Mono:wght@400;500&display=swap');

    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      background-color: #f7f4ec;
      color: #1a2e22;
      line-height: 1.5;
      padding: 24px;
    }

    .container {
      max-width: 1040px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e5dec9;
      border-radius: 16px;
      padding: 36px 40px;
      box-shadow: 0 4px 20px rgba(23, 21, 18, 0.05);
    }

    .no-print {
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      background: #143826;
      color: #ffffff;
      padding: 12px 20px;
      border-radius: 12px;
      max-width: 1040px;
      margin-left: auto;
      margin-right: auto;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
      text-decoration: none;
      border: none;
      transition: opacity 0.2s;
    }
    .btn-gold { background: #d4a347; color: #143826; }
    .btn-gold:hover { opacity: 0.9; }
    .btn-subtle { background: rgba(255,255,255,0.15); color: #ffffff; }
    .btn-subtle:hover { background: rgba(255,255,255,0.25); }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #143826;
      padding-bottom: 20px;
      margin-bottom: 24px;
    }

    .brand h1 {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 24px;
      color: #143826;
      letter-spacing: -0.01em;
    }
    .brand p {
      font-size: 12px;
      color: #637568;
      margin-top: 4px;
    }

    .meta {
      text-align: right;
      font-size: 12px;
      color: #637568;
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
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 28px;
    }
    .metric-card {
      background: #faf8f3;
      border: 1px solid #e5dec9;
      border-radius: 10px;
      padding: 14px 16px;
    }
    .metric-label {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      color: #637568;
      letter-spacing: 0.05em;
    }
    .metric-value {
      font-size: 20px;
      font-weight: 700;
      color: #143826;
      margin-top: 4px;
    }
    .metric-sub {
      font-size: 11px;
      color: #8c7b64;
      margin-top: 2px;
    }

    .filter-bar {
      background: #f4f0e6;
      border-radius: 8px;
      padding: 8px 14px;
      font-size: 12px;
      color: #554d3f;
      margin-bottom: 20px;
    }

    table {
      width: 100%;
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
      border-bottom: 2px solid #143826;
    }
    td {
      padding: 9px 8px;
      vertical-align: middle;
    }
    .mono {
      font-family: 'JetBrains Mono', monospace;
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
      margin-top: 32px;
      padding-top: 16px;
      border-top: 1px solid #e5dec9;
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: #8c7b64;
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
    <div style="display: flex; gap: 8px;">
      <button onclick="window.print()" class="btn btn-gold">
        🖨️ Print / Save as PDF
      </button>
      <a href="/api/admin/donations/export?${url.searchParams.toString().replace("format=pdf", "format=csv")}" class="btn btn-subtle">
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
        <h1>God Is Alive Foundation</h1>
        <p>Lover&apos;s Heart Foundation &bull; Registered Non-Profit Organization &bull; Accra, Ghana</p>
      </div>
      <div class="meta">
        <div class="title">Donation Report</div>
        <div>Generated: ${dateGenerated}</div>
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
                  return `<tr>
                    <td style="white-space: nowrap; color: #637568;">${dateStr}</td>
                    <td><strong>${escapeHtml(d.donorName)}</strong>${d.anonymous ? ' <span style="font-size:10px; color:#8c7b64;">(anon)</span>' : ""}</td>
                    <td style="color: #637568;">${escapeHtml(d.email || d.phone || "—")}</td>
                    <td class="text-right" style="font-weight: 700; white-space: nowrap;">${formatCedis(d.amount)}</td>
                    <td><span class="badge ${badgeClass}">${d.status}</span></td>
                    <td style="text-transform: capitalize; color: #637568;">${(d.channel || "—").replace("_", " ")}</td>
                    <td class="mono">${escapeHtml(d.reference)}</td>
                  </tr>`;
                })
                .join("")
        }
      </tbody>
    </table>

    <footer class="footer">
      <div>Official financial report generated from the God Is Alive Foundation Admin Portal.</div>
      <div>Page 1 of 1</div>
    </footer>
  </div>

  <script>
    // Prompt print dialog when window loads in browser
    window.addEventListener('load', () => {
      // Small delay to allow fonts and CSS to render
      setTimeout(() => {
        window.print();
      }, 350);
    });
  </script>
</body>
</html>`;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}

function escapeHtml(text: string | null | undefined): string {
  if (!text) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
