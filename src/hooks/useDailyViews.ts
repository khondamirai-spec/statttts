"use client";

import { useEffect, useMemo, useState } from "react";
import { getDailyViews, type SeriesRow } from "@/lib/api";
import {
  formatDateISO,
  toUTCDate,
  formatUzbekWeekday,
  formatUzbekMonth,
  formatUzbekDate,
} from "@/lib/utils";

export type DailyViewPoint = {
  day: string;
  date: number;
  value: number;
  shortLabel: string;
  longLabel: string;
};

const fallbackSeries: SeriesRow[] = [
  { date: "2025-11-08", count: 780 },
  { date: "2025-11-09", count: 812 },
  { date: "2025-11-10", count: 995 },
  { date: "2025-11-11", count: 1020 },
  { date: "2025-11-12", count: 890 },
  { date: "2025-11-13", count: 930 },
  { date: "2025-11-14", count: 868 },
];

function buildWindow() {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 6);
  return {
    start: formatDateISO(start),
    end: formatDateISO(end),
  };
}

function dedupeAndSort(rows: SeriesRow[]) {
  const map = new Map<string, SeriesRow>();
  rows.forEach((row) => {
    if (!map.has(row.date)) {
      map.set(row.date, row);
    } else {
      map.set(row.date, { date: row.date, count: row.count });
    }
  });
  return Array.from(map.values()).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
}

function formatChartRows(rows: SeriesRow[]): DailyViewPoint[] {
  return rows.slice(-7).map((row) => {
    const date = toUTCDate(row.date);
    const dayName = formatUzbekWeekday(date, true);
    const dayNum = date.getUTCDate();
    const monthName = formatUzbekMonth(date, true);
    return {
      day: dayName,
      date: dayNum,
      value: row.count,
      shortLabel: `${dayNum} ${monthName}`,
      longLabel: `${dayName} ${dayNum} ${monthName}`,
    };
  });
}

function computePercentage(rows: SeriesRow[]) {
  if (rows.length < 3) return 0;
  const yesterday = rows[rows.length - 2];
  const before = rows[rows.length - 3];
  if (!before?.count) return 0;
  const change = ((yesterday.count - before.count) / before.count) * 100;
  return Number(change.toFixed(1));
}

export function useDailyViews() {
  const [window, setWindow] = useState<{ start: string; end: string } | null>(null);
  const [series, setSeries] = useState<SeriesRow[]>(fallbackSeries);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setWindow(buildWindow());
  }, []);

  useEffect(() => {
    if (!window) return;
    const { start, end } = window;
    let active = true;
    const frame = requestAnimationFrame(() => {
      if (active) setLoading(true);
    });
    async function fetchData() {
      const rows = await getDailyViews(start, end);
      if (!active) return;
      if (!rows || !rows.length) {
        setSeries(fallbackSeries);
      } else {
        setSeries(dedupeAndSort(rows));
      }
      setLoading(false);
    }

    fetchData();

    const timer = setInterval(() => {
      setWindow(buildWindow());
    }, 1000 * 60 * 60); // refresh daily window hourly

    return () => {
      active = false;
      clearInterval(timer);
      cancelAnimationFrame(frame);
    };
  }, [window]);

  const chart = useMemo(() => formatChartRows(series), [series]);
  const today = series.at(-1)?.count ?? fallbackSeries.at(-1)!.count;
  const percentageChange = useMemo(
    () => computePercentage(series),
    [series],
  );

  return { today, chart, loading, percentageChange };
}

