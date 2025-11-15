"use client";

import { useCallback, useEffect, useState } from "react";
import { getCountries, type CountryRow } from "@/lib/api";
import { toNumber } from "@/lib/utils";

export type CountryStat = {
  country: string;
  users: number;
  views: number;
  certificates: number;
};

export type CountryTotals = {
  users: number;
  views: number;
  certificates: number;
};

const initialTotals: CountryTotals = {
  users: 0,
  views: 0,
  certificates: 0,
};

export function useCountryStats() {
  const [data, setData] = useState<CountryStat[]>([]);
  const [totals, setTotals] = useState<CountryTotals>(initialTotals);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

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
      const rows = await getCountries();

      if (!active) return;

      if (!rows) {
        setError("Ma’lumotlarni yuklab bo‘lmadi. Qayta urinib ko‘ring.");
        setData([]);
        setTotals(initialTotals);
        setLoading(false);
        return;
      }

      const normalized: CountryStat[] = rows.map((row, index) => ({
        country: row.country ?? `Davlat ${index + 1}`,
        users: toNumber(row.users),
        views: toNumber(row.views),
        certificates: toNumber(row.certificates),
      }));

      const computed = normalized.reduce<CountryTotals>(
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
  }, [nonce]);

  return { data, totals, loading, error, refresh };
}



