import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatNumber(value: number | undefined | null) {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return "0";
  }
  return value.toLocaleString("uz-UZ");
}

export function formatDateISO(date: Date) {
  return date.toISOString().split("T")[0];
}

export function toNumber(value: unknown, fallback = 0) {
  const num = Number(value);
  if (Number.isNaN(num)) return fallback;
  return num;
}


