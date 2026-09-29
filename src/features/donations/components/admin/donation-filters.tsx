"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Download, FileText, RotateCcw, Search } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/field";
import type { DonationFilters as Filters } from "../../schemas";
import { donationStatuses } from "../../schemas";

export function DonationFilters({ filters }: { filters: Filters }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const iso = (d?: Date) => (d ? d.toISOString().slice(0, 10) : "");

  // Local state initialized from incoming filters / URL
  const [search, setSearch] = useState(filters.q ?? "");
  const [status, setStatus] = useState(filters.status ?? "");
  const [fromDate, setFromDate] = useState(iso(filters.from));
  const [toDate, setToDate] = useState(iso(filters.to));

  // Sync state if external URL changes (e.g. back/forward navigation)
  useEffect(() => {
    setSearch(filters.q ?? "");
    setStatus(filters.status ?? "");
    setFromDate(iso(filters.from));
    setToDate(iso(filters.to));
  }, [filters.q, filters.status, filters.from, filters.to]);

  // Helper to push updated search parameters to the router
  function updateParams(newValues: { q?: string; status?: string; from?: string; to?: string }) {
    const params = new URLSearchParams(searchParams.toString());

    const merged = {
      q: newValues.q !== undefined ? newValues.q : search,
      status: newValues.status !== undefined ? newValues.status : status,
      from: newValues.from !== undefined ? newValues.from : fromDate,
      to: newValues.to !== undefined ? newValues.to : toDate,
    };

    // Reset to page 1 on filter changes
    params.delete("page");

    if (merged.q?.trim()) params.set("q", merged.q.trim());
    else params.delete("q");

    if (merged.status) params.set("status", merged.status);
    else params.delete("status");

    if (merged.from) params.set("from", merged.from);
    else params.delete("from");

    if (merged.to) params.set("to", merged.to);
    else params.delete("to");

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  // Live debounced search when user types in the search bar
  useEffect(() => {
    const currentQ = searchParams.get("q") ?? "";
    if (search.trim() === currentQ.trim()) return;

    const handler = setTimeout(() => {
      updateParams({ q: search });
    }, 350);

    return () => clearTimeout(handler);
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  const hasActiveFilters = Boolean(search || status || fromDate || toDate);

  const exportCsvParams = new URLSearchParams(
    Object.entries({ status, q: search, from: fromDate, to: toDate, format: "csv" }).filter(
      (e): e is [string, string] => !!e[1],
    ),
  );

  const exportPdfParams = new URLSearchParams(
    Object.entries({ status, q: search, from: fromDate, to: toDate, format: "pdf" }).filter(
      (e): e is [string, string] => !!e[1],
    ),
  );

  const handleReset = () => {
    setSearch("");
    setStatus("");
    setFromDate("");
    setToDate("");
    startTransition(() => {
      router.replace(pathname, { scroll: false });
    });
  };

  return (
    <div className="mb-6 rounded-2xl border border-line bg-cream-pure p-4.5 shadow-2xs">
      <div className="flex flex-wrap items-end gap-3.5">
        {/* Live Search */}
        <label className="grid flex-1 basis-60 gap-1 text-xs font-semibold text-muted">
          <span>Search Donations</span>
          <div className="relative flex items-center">
            <Search className="pointer-events-none absolute left-3 size-4 text-muted/70" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Donor name, email or reference..."
              className="pl-9 py-2"
            />
          </div>
        </label>

        {/* Live Status Filter */}
        <label className="grid gap-1 text-xs font-semibold text-muted basis-36">
          <span>Status</span>
          <Select
            value={status}
            onChange={(e) => {
              const val = e.target.value;
              setStatus(val);
              updateParams({ status: val });
            }}
            className="py-2"
          >
            <option value="">All Statuses</option>
            {donationStatuses.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0) + s.slice(1).toLowerCase()}
              </option>
            ))}
          </Select>
        </label>

        {/* Live From Date */}
        <label className="grid gap-1 text-xs font-semibold text-muted">
          <span>From</span>
          <Input
            type="date"
            value={fromDate}
            onChange={(e) => {
              const val = e.target.value;
              setFromDate(val);
              updateParams({ from: val });
            }}
            className="py-2"
          />
        </label>

        {/* Live To Date */}
        <label className="grid gap-1 text-xs font-semibold text-muted">
          <span>To</span>
          <Input
            type="date"
            value={toDate}
            onChange={(e) => {
              const val = e.target.value;
              setToDate(val);
              updateParams({ to: val });
            }}
            className="py-2"
          />
        </label>

        {/* Reset Action */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleReset}
            disabled={isPending}
            className={buttonClasses({
              variant: "subtle",
              size: "sm",
              className: "py-2 gap-1.5 text-muted hover:text-ink",
            })}
            title="Clear all filters"
          >
            <RotateCcw className="size-3.5" />
            <span>Reset</span>
          </button>
        )}

        {/* Export Buttons: PDF and CSV */}
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <a
            href={`/api/admin/donations/export?${exportPdfParams}`}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClasses({
              variant: "forest",
              size: "sm",
              className: "py-2 gap-1.5 shadow-2xs",
            })}
            title="Open printable statement / Save as PDF"
          >
            <FileText className="size-4" />
            <span>Export PDF</span>
          </a>

          <a
            href={`/api/admin/donations/export?${exportCsvParams}`}
            className={buttonClasses({
              variant: "outline",
              size: "sm",
              className: "py-2 gap-1.5 border-line bg-white hover:border-gold",
            })}
            title="Download raw spreadsheet data"
          >
            <Download className="size-4 text-forest" />
            <span>Export CSV</span>
          </a>
        </div>
      </div>
    </div>
  );
}
