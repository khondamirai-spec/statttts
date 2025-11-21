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
