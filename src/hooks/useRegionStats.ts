"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getRegions,
  type RegionParams,
  type RegionRow,
} from "@/lib/api";
import { formatDateISO, toNumber } from "@/lib/utils";

export type RegionStat = {
  region: string;
  users: number;
  views: number;
  certificates: number;
};

export type RegionTotals = {
  users: number;
  views: number;
  certificates: number;
};

export type UseRegionStatsOptions = {
  startDate?: Date;
  endDate?: Date;
  provider?: string;
};

const initialTotals: RegionTotals = {
  users: 0,
  views: 0,
  certificates: 0,
};

export function useRegionStats(options?: UseRegionStatsOptions) {
  const [data, setData] = useState<RegionStat[]>([]);
  const [totals, setTotals] = useState<RegionTotals>(initialTotals);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  const query: RegionParams = useMemo(() => {
    if (!options) return {};
    return {
      provider: options.provider,
      startDate: options.startDate
        ? formatDateISO(options.startDate)
        : undefined,
      endDate: options.endDate ? formatDateISO(options.endDate) : undefined,
    };
  }, [options]);

  const refresh = useCallback(() => {
    setNonce((prev) => prev + 1);
  }, []);

  useEffect(() => {
    let active = true;
    const frame = requestAnimationFrame(() => {
      if (!active) return;
      setLoading(true);
      setError(null);
    });
    async function fetchData() {
      const rows = await getRegions(query);

      if (!active) return;

      if (!rows) {
        setError("Ma’lumotlarni yuklab bo’lmadi. Qayta urinib ko’ring.");
        setData([]);
        setTotals(initialTotals);
        setLoading(false);
        return;
      }

      const normalized: RegionStat[] = rows.map((row: RegionRow, index) => {
        const regionName = row.region ?? row.name ?? `Region ${index + 1}`;
        return {
          region: regionName,
          users: toNumber(row.users),
          views: toNumber(row.views),
          certificates: toNumber(row.certificates),
        };
      });

      const computed = normalized.reduce<RegionTotals>(
        (acc, item) => {
          acc.users += item.users;
          acc.views += item.views;
          acc.certificates += item.certificates;
          return acc;
        },
        { ...initialTotals },
      );

      setData(normalized);
      setTotals(computed);
      setLoading(false);
    }

    fetchData();

    return () => {
      active = false;
      cancelAnimationFrame(frame);
    };
  }, [nonce, query]);

  return { data, totals, loading, error, refresh };
}

