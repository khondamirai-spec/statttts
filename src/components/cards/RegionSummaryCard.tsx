"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import DateRangePicker from "@/components/shared/DateRangePicker";
import GlassPanel from "@/components/ui/GlassPanel";
import RegionCard from "@/components/RegionCard";
import RegionDetailsSidebar, {
  type RegionAccent,
  type RegionDetailsRegion,
} from "@/components/RegionDetailsSidebar";
import {
  useRegionStats,
  type RegionStat,
  type RegionTotals,
} from "@/hooks/useRegionStats";
import { formatNumber } from "@/lib/utils";

function initialRange() {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 29);
  return { start, end };
}

const accents: RegionAccent[] = ["purple", "orange", "blue", "green"];

type RegionSummaryPanelProps = {
  start: Date;
  end: Date;
  onStartDateChange: (date: Date | null) => void;
  onEndDateChange: (date: Date | null) => void;
  data: RegionStat[];
  totals: RegionTotals;
  loading: boolean;
  error: string | null;
};

function RegionSummaryPanel({
  start,
  end,
  onStartDateChange,
  onEndDateChange,
  data,
  totals,
  loading,
  error,
}: RegionSummaryPanelProps) {
  const [selectedRegion, setSelectedRegion] = useState<RegionDetailsRegion | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const ranked = useMemo(
    () => [...data].sort((a, b) => b.users - a.users),
    [data],
  );

  const topRegions = ranked.slice(0, 14);

  const handleRegionClick = (region: RegionStat, accent: RegionAccent) => {
    setSelectedRegion({ ...region, accent });
    setIsSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <GlassPanel className="region-summary">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Viloyatlar kesimi
          </p>
          <p className="text-xs text-slate-400">
            Foydalanuvchilar va ko’rishlar bo’yicha TOP hududlar
          </p>
        </div>
        <DateRangePicker
          startDate={start}
          endDate={end}
          onStartDateChange={onStartDateChange}
          onEndDateChange={onEndDateChange}
          className="w-full max-w-xs"
        />
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="mt-4 grid gap-3">
        {loading
          ? Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="region-card skeleton" />
            ))
          : topRegions.map((region, index) => {
              const accent = accents[index % accents.length];
              return (
                <RegionCard
                  key={region.region}
                  title={region.region}
                  value={region.users}
                  accent={accent}
                  onClick={() => handleRegionClick(region, accent)}
                />
              );
            })}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm font-semibold text-slate-600">
        <div>
          Jami foydalanuvchilar:{" "}
          <span className="text-slate-900">
            {formatNumber(totals.users)}
          </span>
        </div>
        <div>
          Ko’rishlar:{" "}
          <span className="text-slate-900">{formatNumber(totals.views)}</span>
        </div>
        <div>
          Sertifikatlar:{" "}
          <span className="text-slate-900">
            {formatNumber(totals.certificates)}
          </span>
        </div>
        <Link
          href="/regions"
          className="rounded-full bg-slate-900/90 px-4 py-2 text-xs uppercase tracking-wide text-white hover:bg-slate-900"
        >
          Barcha hududlarni ko'rish
        </Link>
      </div>

      <RegionDetailsSidebar
        region={selectedRegion}
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
      />
    </GlassPanel>
  );
}

export default function RegionSummaryCard() {
  const [{ start, end }, setRange] = useState(initialRange);

  const statsOptions = useMemo(
    () => ({ startDate: start, endDate: end }),
    [start, end],
  );
  const { data, totals, loading, error } = useRegionStats(statsOptions);

  const handleStartDateChange = (date: Date | null) => {
    if (!date) return;
    setRange(({ end }) => ({ start: date, end }));
  };

  const handleEndDateChange = (date: Date | null) => {
    if (!date) return;
    setRange(({ start }) => ({ start, end: date }));
  };

  const sharedProps = {
    start,
    end,
    onStartDateChange: handleStartDateChange,
    onEndDateChange: handleEndDateChange,
    data,
    totals,
    loading,
    error,
  };

  return (
    <div className="region-summary-grid">
      <RegionSummaryPanel {...sharedProps} />
      <RegionSummaryPanel {...sharedProps} />
    </div>
  );
}

