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
              className="text-4xl font-black text-slate-900"
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
        <div className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-600">
          Live
        </div>
      </div>

      <MiniBarChart data={chart} loading={loading} />

      <div className="tall-card__footer">
        <div>
          <p className="text-sm font-semibold text-slate-500">
            Eng faol kun
          </p>
          {chart.length ? (
            <p className="text-lg font-semibold text-slate-800">
              {chart.reduce((max, point) =>
                point.value > max.value ? point : max,
              ).day}
            </p>
          ) : (
            <p className="text-lg font-semibold text-slate-800">—</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            JAMI KO’RGANALAR
          </p>
          <p className="text-2xl font-black text-slate-900">
            {formatNumber(stats.courseViews)}
          </p>
        </div>
      </div>
    </GlassPanel>
  );
}

