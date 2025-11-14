"use client";

import { useEffect, useMemo, useState } from "react";
import { getDailyUsers, type SeriesRow } from "@/lib/api";

export type DailyUserPoint = {
  date: string;
  count: number;
};

const fallbackSeries: DailyUserPoint[] = [
  { date: "2025-11-01", count: 640 },
  { date: "2025-11-02", count: 812 },
  { date: "2025-11-03", count: 1208 },
  { date: "2025-11-04", count: 980 },
  { date: "2025-11-05", count: 1432 },
  { date: "2025-11-06", count: 1605 },
  { date: "2025-11-07", count: 1392 },
  { date: "2025-11-08", count: 1710 },
  { date: "2025-11-09", count: 1880 },
  { date: "2025-11-10", count: 2005 },
  { date: "2025-11-11", count: 2320 },
  { date: "2025-11-12", count: 2160 },
  { date: "2025-11-13", count: 1902 },
  { date: "2025-11-14", count: 2056 },
];

function computeGrowth(series: DailyUserPoint[]) {
  if (series.length < 2) return 0;
  const last = series[series.length - 1]?.count ?? 0;
  const prev = series[series.length - 2]?.count ?? 0;
  if (!prev) return 0;
  const change = ((last - prev) / prev) * 100;
  return Number(change.toFixed(1));
}

function normalizeSeries(rows: SeriesRow[] | null): DailyUserPoint[] {
  if (!rows || !rows.length) return fallbackSeries;
  return rows.map((row) => ({
    date: row.date,
    count: row.count,
  }));
}

export function useDailyUsers(startDate: string, endDate: string) {
  const [data, setData] = useState<DailyUserPoint[]>(fallbackSeries);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const frame = requestAnimationFrame(() => {
      if (active) setLoading(true);
    });

    async function fetchData() {
      const rows = await getDailyUsers(startDate, endDate);
      if (!active) return;
      setData(normalizeSeries(rows));
      setLoading(false);
    }

    fetchData();

    return () => {
      active = false;
      cancelAnimationFrame(frame);
    };
  }, [startDate, endDate]);

  const metrics = useMemo(() => {
    const total = data.reduce((sum, point) => sum + point.count, 0);
    const dailyAvg = data.length ? Math.round(total / data.length) : 0;
    const peakDay = data.reduce(
      (max, point) => Math.max(max, point.count),
      0,
    );
    const growth = computeGrowth(data);

    return {
      total,
      dailyAvg,
      peakDay,
      growth,
    };
  }, [data]);

  return { data, loading, ...metrics };
}

