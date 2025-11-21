import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

type FormatNumberOptions = {
  decimals?: number;
  decimalSeparator?: string;
  groupSeparator?: string;
};

export function formatNumber(
  value: number | undefined | null,
  options: FormatNumberOptions = {},
) {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return "0";
  }

  const {
    decimals,
    decimalSeparator = ",",
    groupSeparator = " ",
  } = options;

  const resolvedDecimals =
    typeof decimals === "number"
      ? Math.max(0, decimals)
      : Number.isInteger(value)
        ? 0
        : 2;

  const sign = value < 0 ? "-" : "";
  const absoluteValue = Math.abs(value);
  const fixed = absoluteValue.toFixed(resolvedDecimals);
  const [integerPart, decimalPart] = fixed.split(".");
  const groupedInteger = integerPart.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    groupSeparator,
  );
  const decimalSection =
    resolvedDecimals > 0 && decimalPart ? `${decimalSeparator}${decimalPart}` : "";

  return `${sign}${groupedInteger}${decimalSection}`;
}

export function formatDateISO(date: Date) {
  return date.toISOString().split("T")[0];
}

export function toUTCDate(dateString: string) {
  return new Date(`${dateString}T00:00:00Z`);
}

const DEFAULT_START_DATE_ISO = "2024-11-30T00:00:00Z";

export function getDefaultDateRange() {
  const end = new Date();
  const start = new Date(DEFAULT_START_DATE_ISO);

  if (start.getTime() > end.getTime()) {
    const fallbackStart = new Date(end);
    return { start: fallbackStart, end };
  }

  return { start, end };
}

export function toNumber(value: unknown, fallback = 0) {
  const num = Number(value);
  if (Number.isNaN(num)) return fallback;
  return num;
}

// Uzbek weekday and month translations
const UZBEK_WEEKDAYS_SHORT = ["Ya", "Du", "Se", "Ch", "Pa", "Ju", "Sh"]; // Sunday = 0
const UZBEK_WEEKDAYS_FULL = [
  "Yakshanba",
  "Dushanba",
  "Seshanba",
  "Chorshanba",
  "Payshanba",
  "Juma",
  "Shanba",
];

const UZBEK_MONTHS_SHORT = [
  "Yan",
  "Fev",
  "Mar",
  "Apr",
  "May",
  "Iyun",
  "Iyul",
  "Avg",
  "Sen",
  "Okt",
  "Noy",
  "Dek",
];

const UZBEK_MONTHS_FULL = [
  "Yanvar",
  "Fevral",
  "Mart",
  "Aprel",
  "May",
  "Iyun",
  "Iyul",
  "Avgust",
  "Sentabr",
  "Oktabr",
  "Noyabr",
  "Dekabr",
];

export function formatUzbekWeekday(date: Date | null, short = true): string {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) return "";
  const dayIndex = date.getUTCDay();
  return short
    ? UZBEK_WEEKDAYS_SHORT[dayIndex] || ""
    : UZBEK_WEEKDAYS_FULL[dayIndex] || "";
}

export function formatUzbekMonth(date: Date | null, short = true): string {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) return "";
  const monthIndex = date.getUTCMonth();
  return short
    ? UZBEK_MONTHS_SHORT[monthIndex] || ""
    : UZBEK_MONTHS_FULL[monthIndex] || "";
}

export function formatUzbekDate(date: Date | null, includeWeekday = false): string {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) return "";
  const day = date.getUTCDate().toString().padStart(2, "0");
  const month = formatUzbekMonth(date, true);
  if (includeWeekday) {
    const weekday = formatUzbekWeekday(date, true);
    return `${weekday} ${day} ${month}`;
  }
  return `${day} ${month}`;
}