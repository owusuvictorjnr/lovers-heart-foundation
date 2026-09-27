import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format pesewas as cedis, e.g. 12500 → "GH₵ 125.00" */
export function formatCedis(pesewas: number, opts: { decimals?: boolean } = {}) {
  const cedis = pesewas / 100;
  return `GH₵ ${cedis.toLocaleString("en-GH", {
    minimumFractionDigits: opts.decimals === false ? 0 : 2,
    maximumFractionDigits: opts.decimals === false ? 0 : 2,
  })}`;
}

export function formatDate(date: Date | string, withTime = false) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(withTime && { hour: "2-digit", minute: "2-digit" }),
  });
}
