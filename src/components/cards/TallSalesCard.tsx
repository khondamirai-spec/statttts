"use client";

import AnimatedNumber from "@/components/shared/AnimatedNumber";
import GlassPanel from "@/components/ui/GlassPanel";
import MiniBarChart from "@/components/charts/MiniBarChart";
import { useDailyViews } from "@/hooks/useDailyViews";
import { useMainStats } from "@/hooks/useMainStats";
import { formatNumber } from "@/lib/utils";

export default function TallSalesCard() {
  const { today, chart, loading, percentageChange } = useDailyViews();
  const { data: stats } = useMainStats();
  const isNegative = percentageChange < 0;

  const totalRangeViews = chart.reduce((sum, point) => sum + point.value, 0);
  const averageViews = chart.length ? totalRangeViews / chart.length : 0;
  const peakPoint = chart.length
    ? chart.reduce((max, point) =>
        point.value > max.value ? point : max,
      )
    : null;
  const windowLabel =
    chart.length >= 2
      ? `${chart[0].shortLabel} — ${chart.at(-1)!.shortLabel}`
      : chart[0]?.shortLabel ?? "—";

  return (
    <GlassPanel className="tall-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Kunlik ko’rilgan videodarslar soni
          </p>
          <div className="mt-2 flex items-baseline gap-3">
            <AnimatedNumber
              value={today}
              className="text-3xl font-black text-slate-900"
            />
            <span
              className={`change-pill ${isNegative ? "change-pill--down" : "change-pill--up"}`}
            >
              {isNegative ? "−" : "+"}
              {Math.abs(percentageChange).toFixed(1)}%
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Bugungi ko’rsatkich. Kechagi kun bilan solishtirilgan.
          </p>
        </div>
        <div className="tall-card__status-chip">
          <span className="tall-card__status-dot" aria-hidden />
          <span>Live</span>
          <strong>{formatNumber(today)}</strong>
        </div>
      </div>

      <div className="tall-card__summary">
        <div className="summary-tile summary-tile--primary summary-tile--inline">
          <p className="summary-tile__label">Sana oralig’i</p>
          <p className="summary-tile__value">{windowLabel}</p>
          <p className="summary-tile__hint">Oxirgi 7 kunlik ko’rsatkichlar</p>
        </div>
        <div className="summary-tile summary-tile--inline">
          <p className="summary-tile__label">Daily average</p>
          <p className="summary-tile__value">
            {formatNumber(Math.round(averageViews))}
          </p>
          <p className="summary-tile__hint">videodars / kun</p>
        </div>
        <div className="summary-tile summary-tile--inline">
          <p className="summary-tile__label">Peak day</p>
          <p className="summary-tile__value">
            {peakPoint ? formatNumber(peakPoint.value) : "—"}
          </p>
          <p className="summary-tile__hint">
            {peakPoint ? peakPoint.longLabel : "Ma’lumot yo’q"}
          </p>
        </div>
      </div>

      <MiniBarChart data={chart} loading={loading} />

      <div className="tall-card__footer">
        <div>
          <p className="text-sm font-semibold text-slate-500">
            Eng faol kun
          </p>
          {peakPoint ? (
            <div className="text-lg font-semibold text-slate-800">
              <span>{peakPoint.day}</span>{" "}
              <span className="text-slate-500">{peakPoint.date}</span>
            </div>
          ) : (
            <p className="text-lg font-semibold text-slate-800">—</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Jami ko’rgazmalar
          </p>
          <p className="text-2xl font-black text-slate-900">
            {formatNumber(stats.courseViews)}
          </p>
        </div>
      </div>
    </GlassPanel>
  );
}

