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

  const peakPoint = chart.length
    ? chart.reduce((max, point) =>
        point.value > max.value ? point : max,
      )
    : null;

  return (
    <GlassPanel className="tall-card">
      <div className="tall-card__metric">
        <div className="tall-card__metric-label">
          KUNLIK KO’RILGAN VIDEODARSLAR SONI
        </div>
        <div className="tall-card__metric-main">
          <AnimatedNumber value={today} className="tall-card__metric-value" />
          <span
            className={`change-pill tall-card__metric-change ${isNegative ? "change-pill--down" : "change-pill--up"}`}
          >
            {isNegative ? "−" : "+"}
            {Math.abs(percentageChange).toFixed(1)}%
          </span>
        </div>
      </div>
      <div className="tall-card__chart">
        <MiniBarChart data={chart} loading={loading} />
      </div>

      <div className="tall-card__footer">
        <div className="tall-card__total">
          <div>
            <p className="tall-card__total-label">Jami ko’rgazmalar</p>
            <p className="tall-card__total-value">
              {formatNumber(stats.courseViews)}
            </p>
          </div>
          <svg
            className="h-12 w-12 text-slate-900"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <rect
              x="4"
              y="4"
              width="40"
              height="40"
              rx="10"
              className="fill-slate-100"
            />
            <path
              d="M12 30L20 22L26 28L36 18"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M32 18H37V23"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      <div className="tall-card__total tall-card__total--peak">
        <div>
          <p className="tall-card__total-label">Eng faol kun</p>
          <p className="tall-card__total-value">
            {peakPoint ? `${peakPoint.day} ${peakPoint.date}` : "Aniqlanmagan"}
          </p>
          <p className="tall-card__total-subvalue">
            {peakPoint
              ? `${formatNumber(peakPoint.value)} ta ko’rish`
              : `Jami ${formatNumber(stats.courseViews)} ko’rgazma`}
          </p>
        </div>
        <svg
          className="tall-card__total-peak-icon"
          viewBox="0 0 72 72"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="peakGradient" x1="0" y1="0" x2="72" y2="72">
              <stop offset="0" stopColor="#38bdf8" />
              <stop offset="1" stopColor="#6366f1" />
            </linearGradient>
          </defs>
          <circle
            cx="36"
            cy="36"
            r="32"
            fill="url(#peakGradient)"
            opacity="0.15"
          />
          <path
            d="M20 44L30 34L38 40L52 26"
            stroke="#2563eb"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M48 26H54V32"
            stroke="#2563eb"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="52" cy="28" r="4" fill="#2563eb" />
        </svg>
      </div>
    </GlassPanel>
  );
}

