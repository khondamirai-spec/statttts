"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import AnimatedNumber from "@/components/shared/AnimatedNumber";
import DateRangePicker from "@/components/shared/DateRangePicker";
import GlassPanel from "@/components/ui/GlassPanel";
import { useDailyUsers, type DailyUserPoint } from "@/hooks/useDailyUsers";
import { formatDateISO, formatNumber, toUTCDate } from "@/lib/utils";

const WIDTH = 720;
const HEIGHT = 220;
const PADDING = { top: 24, right: 24, bottom: 36, left: 56 };
const MIN_CHART_HEIGHT = 240;
const HEIGHT_RATIO = 0.45;
const SMALL_SCREEN_BREAKPOINT = 480;
const MEDIUM_SCREEN_BREAKPOINT = 780;
const DATE_RANGE_FORMATTER = new Intl.DateTimeFormat("uz-UZ", {
  day: "2-digit",
  month: "short",
  timeZone: "UTC",
});
const PEAK_DAY_FORMATTER = new Intl.DateTimeFormat("uz-UZ", {
  weekday: "short",
  day: "2-digit",
  month: "short",
  timeZone: "UTC",
});
const AXIS_TICK_FORMATTER = new Intl.DateTimeFormat("uz-UZ", {
  day: "2-digit",
  month: "short",
  timeZone: "UTC",
});
const TOOLTIP_FORMATTER = new Intl.DateTimeFormat("uz-UZ", {
  weekday: "short",
  day: "2-digit",
  month: "short",
  timeZone: "UTC",
});

function initialRange() {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 13);
  return { start, end };
}

function createCurve(points: { x: number; y: number }[]) {
  if (!points.length) return "";
  if (points.length === 1) {
    return `M ${points[0].x},${points[0].y}`;
  }
  const path = [`M ${points[0].x},${points[0].y}`];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    path.push(`C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`);
  }

  return path.join(" ");
}

function getChartHeight(width: number) {
  if (!width || Number.isNaN(width)) return HEIGHT;
  if (width <= SMALL_SCREEN_BREAKPOINT) {
    return Math.max(MIN_CHART_HEIGHT, width * 1.35);
  }
  if (width <= MEDIUM_SCREEN_BREAKPOINT) {
    return Math.max(MIN_CHART_HEIGHT, width * 0.9);
  }
  return Math.max(MIN_CHART_HEIGHT, width * HEIGHT_RATIO);
}

function summarizeRange(
  explicitStart: Date | null,
  explicitEnd: Date | null,
  series: DailyUserPoint[],
) {
  const fallbackStart = series.length ? toUTCDate(series[0].date) : null;
  const fallbackEnd = series.length ? toUTCDate(series.at(-1)!.date) : null;

  let rangeStart = explicitStart ?? fallbackStart;
  let rangeEnd = explicitEnd ?? fallbackEnd;

  if (rangeStart && rangeEnd && rangeStart > rangeEnd) {
    [rangeStart, rangeEnd] = [rangeEnd, rangeStart];
  }

  if (!rangeStart || !rangeEnd) {
    return {
      label: "Oxirgi 14 kun",
      helper: "Avtomatik davr",
    };
  }

  const diffDays =
    Math.max(
      1,
      Math.round(
        (rangeEnd.getTime() - rangeStart.getTime()) / (1000 * 60 * 60 * 24),
      ),
    ) + 1;

  return {
    label: `${DATE_RANGE_FORMATTER.format(rangeStart)} — ${DATE_RANGE_FORMATTER.format(rangeEnd)}`,
    helper: `${diffDays} kunlik kesim`,
  };
}

function findPeakPoint(series: DailyUserPoint[]) {
  return series.reduce<DailyUserPoint | null>((currentPeak, point) => {
    if (!currentPeak || point.count > currentPeak.count) {
      return point;
    }
    return currentPeak;
  }, null);
}

export default function WeeklyMonthlyYearlyCard() {
  const [{ start, end }, setRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>(() => ({ start: null, end: null }));
  const startISO = start ? formatDateISO(start) : undefined;
  const endISO = end ? formatDateISO(end) : undefined;
  const { data, total, dailyAvg, peakDay, growth, loading } = useDailyUsers(
    startISO,
    endISO,
  );
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [chartSize, setChartSize] = useState({
    width: WIDTH,
    height: Math.max(HEIGHT, MIN_CHART_HEIGHT),
  });

  useEffect(() => {
    setRange(initialRange());
  }, []);

  useLayoutEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const syncSize = (rawWidth?: number) => {
      const fallbackWidth =
        rawWidth && rawWidth > 0
          ? rawWidth
          : node.getBoundingClientRect().width ||
            node.clientWidth ||
            node.parentElement?.clientWidth ||
            WIDTH;
      if (!fallbackWidth) return;
      const nextHeight = getChartHeight(fallbackWidth);
      setChartSize((prev) => {
        if (
          Math.abs(prev.width - fallbackWidth) < 0.5 &&
          Math.abs(prev.height - nextHeight) < 0.5
        ) {
          return prev;
        }
        return {
          width: fallbackWidth,
          height: nextHeight,
        };
      });
    };

    syncSize();

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver((entries) => {
        entries.forEach((entry) => {
          syncSize(entry.contentRect.width);
        });
      });
      observer.observe(node);
      return () => observer.disconnect();
    }

    const handleResize = () => syncSize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const chartWidth = Math.max(chartSize.width, 1);
  const chartHeight = Math.max(chartSize.height, MIN_CHART_HEIGHT);

  const chartData = useMemo(() => {
    const values = data.map((point) => point.count);
    const maxValue = values.length ? Math.max(...values) : 1;
    const plotWidth = chartWidth - PADDING.left - PADDING.right;
    const plotHeight = chartHeight - PADDING.top - PADDING.bottom;

    const points = data.map((point, index) => {
      const x =
        PADDING.left +
        (plotWidth * (values.length > 1 ? index / (values.length - 1) : 0));
      const y =
        PADDING.top + (1 - point.count / maxValue) * plotHeight;
      return { x, y, raw: point };
    });

    const line = createCurve(points);
    const closingLine = points.length
      ? `${line} L ${points.at(-1)?.x ?? PADDING.left},${
          chartHeight - PADDING.bottom
        } L ${PADDING.left},${chartHeight - PADDING.bottom} Z`
      : "";

    const yAxisValues = Array.from({ length: 4 }, (_, idx) => {
      const factor = 1 - idx / 3;
      return {
        value: Math.round(maxValue * factor),
        y: PADDING.top + (1 - factor) * plotHeight,
      };
    });

    const xAxisIndices = Array.from(
      new Set(
        [0, Math.floor((data.length - 1) / 2), data.length - 1].filter(
          (index) => index >= 0,
        ),
      ),
    );

    const xAxisValues = xAxisIndices
      .map((index) => {
        const point = data[index];
        const coords = points[index];
        if (!point || !coords) return null;
        return {
          x: coords.x,
          label: AXIS_TICK_FORMATTER.format(toUTCDate(point.date)),
          date: point.date,
        };
      })
      .filter(Boolean) as {
      x: number;
      label: string;
      date: string;
    }[];

    return {
      points,
      line,
      area: closingLine,
      yAxisValues,
      xAxisValues,
    };
  }, [data, chartWidth, chartHeight]);

  const todaySummary = useMemo(() => {
    if (!data.length) return null;
    const todayISO = new Date().toLocaleDateString("en-CA");
    const exactPoint = data.find((point) => point.date === todayISO);
    const fallbackPoint = data.at(-1) ?? null;
    const resolvedPoint = exactPoint ?? fallbackPoint;
    if (!resolvedPoint) return null;
    return {
      ...resolvedPoint,
      isExact: Boolean(exactPoint),
    };
  }, [data]);

  const activePoint =
    chartData.points[hoverIndex ?? chartData.points.length - 1];
  const peakPoint = useMemo(() => findPeakPoint(data), [data]);
  const rangeSummary = useMemo(
    () => summarizeRange(start, end, data),
    [start, end, data],
  );

  const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!chartData.points.length) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    if (!bounds.width) return;
    const relativeX =
      ((event.clientX - bounds.left) / bounds.width) * chartWidth;
    const nearestIndex = chartData.points.reduce(
      (acc, point, index) => {
        const distance = Math.abs(point.x - relativeX);
        if (distance < acc.distance) {
          return { distance, index };
        }
        return acc;
      },
      { distance: Number.POSITIVE_INFINITY, index: 0 },
    ).index;
    setHoverIndex(nearestIndex);
  };

  return (
    <GlassPanel className="activity-card activity-card--modern" delay={0.05}>
      <div className="activity-card__top">
        <div className="activity-card__intro">
          <div className="activity-card__title-row">
            <h3>Kunlik yangi foydalanuvchilar</h3>
          </div>
        </div>
        <div className="activity-card__top-actions">
          <DateRangePicker
            startDate={start ?? undefined}
            endDate={end ?? undefined}
            onStartDateChange={(value) =>
              value && setRange(({ end }) => ({ start: value, end }))
            }
            onEndDateChange={(value) =>
              value && setRange(({ start }) => ({ start, end: value }))
            }
            className="activity-card__date-picker"
          />
        </div>
      </div>

      <div className="activity-card__summary">
        <div className="summary-tile summary-tile--primary">
          <p className="summary-tile__label">Total New Users</p>
          <AnimatedNumber
            value={total}
            className="summary-tile__value summary-tile__value--xl"
          />
        </div>
        <div className="summary-tile">
          <p className="summary-tile__label">Peak Day</p>
          <p className="summary-tile__value">{formatNumber(peakDay)}</p>
        </div>
      </div>

      <div className="activity-card__chart-shell">
        <div
          className="activity-chart"
          ref={containerRef}
          style={{ minHeight: chartHeight }}
        >
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            width="100%"
            height={chartHeight}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseMove}
            onMouseLeave={() => setHoverIndex(null)}
            role="img"
            aria-label="Daily users line chart"
          >
            <defs>
              <linearGradient
                id="users-stroke"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
              <linearGradient id="users-fill" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(99,102,241,0.35)" />
                <stop offset="80%" stopColor="rgba(255,255,255,0)" />
              </linearGradient>
            </defs>

            {/* grid */}
            {chartData.yAxisValues.map((tick, index) => (
              <g key={index}>
                <line
                  x1={PADDING.left}
                x2={chartWidth - PADDING.right}
                  y1={tick.y}
                  y2={tick.y}
                  stroke="rgba(226,232,240,0.5)"
                  strokeDasharray="4 6"
                />
                <text
                  x={PADDING.left - 10}
                  y={tick.y + 4}
                  textAnchor="end"
                  className="axis-label"
                >
                  {formatNumber(tick.value)}
                </text>
              </g>
            ))}

            <line
              x1={PADDING.left}
            x2={chartWidth - PADDING.right}
            y1={chartHeight - PADDING.bottom}
            y2={chartHeight - PADDING.bottom}
              stroke="rgba(148,163,184,0.6)"
            />

            {chartData.xAxisValues.map((tick, index) => (
              <g key={`${tick.date}-${index}`}>
                <line
                  x1={tick.x}
                  x2={tick.x}
                y1={chartHeight - PADDING.bottom}
                y2={chartHeight - PADDING.bottom + 6}
                  stroke="rgba(148,163,184,0.8)"
                />
                <text
                  x={tick.x}
                y={chartHeight - PADDING.bottom + 22}
                  textAnchor="middle"
                  className="axis-label"
                >
                  {tick.label}
                </text>
              </g>
            ))}

            {chartData.area && (
              <path d={chartData.area} fill="url(#users-fill)" opacity={0.8} />
            )}
            {chartData.line && (
              <path
                d={chartData.line}
                fill="none"
                stroke="url(#users-stroke)"
                strokeWidth={4}
              />
            )}

            {activePoint && (
              <>
                <line
                  x1={activePoint.x}
                  x2={activePoint.x}
                  y1={PADDING.top}
                y2={chartHeight - PADDING.bottom}
                  stroke="rgba(59,130,246,0.4)"
                  strokeDasharray="4 6"
                />
                <circle
                  cx={activePoint.x}
                  cy={activePoint.y}
                  r={6}
                  fill="white"
                  stroke="#2563eb"
                  strokeWidth={3}
                />
              </>
            )}
          </svg>
          {activePoint && (
            <div
              className="chart-tooltip"
              style={{
              left: `${(activePoint.x / chartWidth) * 100}%`,
              top: `${(activePoint.y / chartHeight) * 100}%`,
              }}
            >
              <p className="text-xs font-medium text-slate-500">
                {TOOLTIP_FORMATTER.format(toUTCDate(activePoint.raw.date))}
              </p>
              <p className="text-lg font-semibold text-slate-800">
                {formatNumber(activePoint.raw.count)}
              </p>
            </div>
          )}
        </div>
      </div>

    </GlassPanel>
  );
}

