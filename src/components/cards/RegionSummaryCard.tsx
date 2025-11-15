"use client";
import { useEffect, useMemo, useState } from "react";
import DateRangePicker from "@/components/shared/DateRangePicker";
import GlassPanel from "@/components/ui/GlassPanel";
import RegionCard from "@/components/RegionCard";
import RegionDetailsSidebar, {
  type RegionAccent,
  type RegionDetailsRegion,
} from "@/components/RegionDetailsSidebar";
import CountryDetailsSidebar, {
  type CountryDetails,
} from "@/components/CountryDetailsSidebar";
import {
  useCountryStats,
  type CountryStat,
  type CountryTotals,
} from "@/hooks/useCountryStats";
import {
  useRegionStats,
  type RegionStat,
  type RegionTotals,
} from "@/hooks/useRegionStats";
import { formatNumber } from "@/lib/utils";

const accents: RegionAccent[] = ["purple", "orange", "blue", "green"];

type RegionPanelProps = {
  start: Date | null;
  end: Date | null;
  onStartDateChange: (date?: Date | null) => void;
  onEndDateChange: (date?: Date | null) => void;
  data: RegionStat[];
  totals: RegionTotals;
  loading: boolean;
  error: string | null;
};

type CountryPanelProps = {
  data: CountryStat[];
  totals: CountryTotals;
  loading: boolean;
  error: string | null;
};

function RegionPanel({
  start,
  end,
  onStartDateChange,
  onEndDateChange,
  data,
  totals,
  loading,
  error,
}: RegionPanelProps) {
  const [selectedRegion, setSelectedRegion] = useState<RegionDetailsRegion | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const ranked = useMemo(
    () => [...data].sort((a, b) => b.users - a.users),
    [data],
  );

  const handleRegionClick = (region: RegionStat, accent: RegionAccent) => {
    setSelectedRegion({ ...region, accent });
    setIsSidebarOpen(true);
  };

  const handleCloseSidebar = () => setIsSidebarOpen(false);

  return (
    <>
      <GlassPanel className="region-summary" disableHover={isSidebarOpen}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm	font-semibold uppercase tracking-wide text-slate-500">
              Viloyatlar kesimi
            </p>
            <p className="text-xs text-slate-400">
              Foydalanuvchilar va ko’rishlar bo’yicha TOP hududlar
            </p>
          </div>
          <DateRangePicker
            startDate={start ?? undefined}
            endDate={end ?? undefined}
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

        <div className="mt-4 region-list-scrollable">
          {loading
            ? Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="region-card skeleton" />
              ))
            : ranked.map((region, index) => {
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
            <span className="text-slate-900">{formatNumber(totals.users)}</span>
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
        </div>
      </GlassPanel>

      <RegionDetailsSidebar
        region={selectedRegion}
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
      />
    </>
  );
}

function CountryPanel({ data, totals, loading, error }: CountryPanelProps) {
  const [selectedCountry, setSelectedCountry] = useState<CountryDetails | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const ranked = useMemo(
    () => [...data].sort((a, b) => b.users - a.users),
    [data],
  );

  const handleCountryClick = (country: CountryStat, accent: RegionAccent) => {
    setSelectedCountry({ ...country, accent });
    setIsSidebarOpen(true);
  };

  const handleCloseSidebar = () => setIsSidebarOpen(false);

  return (
    <>
      <GlassPanel className="region-summary" disableHover={isSidebarOpen}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Davlatlar kesimi
            </p>
            <p className="text-xs text-slate-400">
              Foydalanuvchilar va ko’rishlar bo’yicha TOP davlatlar
            </p>
          </div>
          <DateRangePlaceholder />
        </div>

        {error && (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="mt-4 region-list-scrollable">
          {loading
            ? Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="region-card skeleton" />
              ))
            : ranked.map((country, index) => {
                const accent = accents[index % accents.length];
                return (
                  <RegionCard
                    key={country.country}
                    title={country.country}
                    value={country.users}
                    accent={accent}
                    onClick={() => handleCountryClick(country, accent)}
                  />
                );
              })}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm font-semibold text-slate-600">
          <div>
            Jami foydalanuvchilar:{" "}
            <span className="text-slate-900">{formatNumber(totals.users)}</span>
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
        </div>
      </GlassPanel>

      <CountryDetailsSidebar
        country={selectedCountry}
        totals={totals}
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
      />
    </>
  );
}

function DateRangePlaceholder() {
  return (
    <div
      className="invisible select-none opacity-0 w-full max-w-xs"
      aria-hidden="true"
    >
      <DateRangePicker className="w-full" />
    </div>
  );
}

function initialRange() {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 29);
  return { start, end };
}

export default function RegionSummaryCard() {
  const [{ start, end }, setRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>(() => ({ start: null, end: null }));

  const { data: countryData, totals: countryTotals, loading: countryLoading, error: countryError } =
    useCountryStats();

  useEffect(() => {
    setRange(initialRange());
  }, []);

  const statsOptions = useMemo(() => {
    if (!start || !end) return undefined;
    return { startDate: start, endDate: end };
  }, [start, end]);

  const {
    data: regionData,
    totals: regionTotals,
    loading: regionLoading,
    error: regionError,
  } = useRegionStats(statsOptions);

  const handleStartDateChange = (date?: Date | null) => {
    if (!date) return;
    setRange(({ end }) => ({ start: date, end }));
  };

  const handleEndDateChange = (date?: Date | null) => {
    if (!date) return;
    setRange(({ start }) => ({ start, end: date }));
  };

  return (
    <div className="region-summary-grid">
      <RegionPanel
        start={start}
        end={end}
        onStartDateChange={handleStartDateChange}
        onEndDateChange={handleEndDateChange}
        data={regionData}
        totals={regionTotals}
        loading={regionLoading}
        error={regionError}
      />
      <CountryPanel
        data={countryData}
        totals={countryTotals}
        loading={countryLoading}
        error={countryError}
      />
    </div>
  );
}

