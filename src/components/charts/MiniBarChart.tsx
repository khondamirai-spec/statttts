"use client";

import { cn } from "@/lib/utils";
import type { DailyViewPoint } from "@/hooks/useDailyViews";

type MiniBarChartProps = {
  data: DailyViewPoint[];
  loading?: boolean;
};

export default function MiniBarChart({ data, loading }: MiniBarChartProps) {
  const displayData = data.slice(-7);
  const maxValue = displayData.reduce(
    (max, point) => Math.max(max, point.value),
    1,
  );

  return (
    <div
      className="mini-bar-chart"
      style={{ minHeight: "min(15vh, 180px)" }}
      aria-live="polite"
      aria-busy={loading}
    >
      {displayData.map((point) => {
        const height = (point.value / maxValue) * 100;
        return (
          <div key={`${point.day}-${point.date}`} className="mini-bar">
            <span className="mini-bar__value">
              {point.value.toLocaleString("uz-UZ")}
            </span>
            <div className="mini-bar__track">
              <div
                className={cn(
                  "mini-bar__fill",
                  height === 100 && "mini-bar__fill--peak",
                )}
                style={{ height: `${height}%` }}
              />
            </div>
            <span className="mini-bar__label">
              {point.day}
              <strong>{point.date}</strong>
            </span>
          </div>
        );
      })}
    </div>
  );
}


