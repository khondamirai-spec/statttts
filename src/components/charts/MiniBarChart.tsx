"use client";

import { cn, formatNumber } from "@/lib/utils";
import type { DailyViewPoint } from "@/hooks/useDailyViews";

type MiniBarChartProps = {
  data: DailyViewPoint[];
  loading?: boolean;
  compact?: boolean;
};

export default function MiniBarChart({
  data,
  loading,
  compact = false,
}: MiniBarChartProps) {
  const displayData = data.slice(-7);
  const maxValue = displayData.reduce(
    (max, point) => Math.max(max, point.value),
    1,
  );

  return (
    <div
      className={cn("mini-bar-chart", compact && "mini-bar-chart--compact")}
      style={{ 
        minHeight: compact 
          ? "min(10vh, 120px)" 
          : "min(12vh, 140px)",
      }}
      aria-live="polite"
      aria-busy={loading}
    >
      {displayData.map((point) => {
        const height = (point.value / maxValue) * 100;
        return (
          <div key={`${point.day}-${point.date}`} className="mini-bar">
            <span className="mini-bar__value">
              {formatNumber(point.value)}
            </span>
            <div
              className={cn(
                "mini-bar__track",
                compact && "mini-bar__track--compact",
              )}
            >
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


