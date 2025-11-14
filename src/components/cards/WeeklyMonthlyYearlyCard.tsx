"use client";

import { useMemo, useRef, useState } from "react";
import AnimatedNumber from "@/components/shared/AnimatedNumber";
import DateRangePicker from "@/components/shared/DateRangePicker";
import GlassPanel from "@/components/ui/GlassPanel";
import { useDailyUsers } from "@/hooks/useDailyUsers";
import { formatDateISO } from "@/lib/utils";

const WIDTH = 720;
const HEIGHT = 260;
const PADDING = { top: 24, right: 24, bottom: 36, left: 56 };

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

export default function WeeklyMonthlyYearlyCard() {
  const [{ start, end }, setRange] = useState(initialRange);
  const startISO = formatDateISO(start);
  const endISO = formatDateISO(end);
  const { data, total, dailyAvg, peakDay, growth, loading } = useDailyUsers(
    startISO,
    endISO,
  );
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const chartData = useMemo(() => {
    const values = data.map((point) => point.count);
    const maxValue = values.length ? Math.max(...values) : 1;
    const plotWidth = WIDTH - PADDING.left - PADDING.right;
    const plotHeight = HEIGHT - PADDING.top - PADDING.bottom;

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
          HEIGHT - PADDING.bottom
        } L ${PADDING.left},${HEIGHT - PADDING.bottom} Z`
      : "";

    const yAxisValues = Array.from({ length: 4 }, (_, idx) => {
      const factor = 1 - idx / 3;
      return {
        value: Math.round(maxValue * factor),
        y: PADDING.top + (1 - factor) * plotHeight,
      };
    });

    const xAxisIndices = [
      0,
      Math.floor((data.length - 1) / 2),
      data.length - 1,
    ].filter((index) => index >= 0);

    const xAxisValues = xAxisIndices.map((index) => {
      const point = data[index];
      const coords = points[index];
      return {
        x: coords?.x ?? PADDING.left,
        label: new Date(point.date).toLocaleDateString("uz-UZ", {
          day: "2-digit",
          month: "short",
        }),
      };
    });

    return {
      points,
      line,
      area: closingLine,
      yAxisValues,
      xAxisValues,
    };
  }, [data]);

  const activePoint =
    chartData.points[hoverIndex ?? chartData.points.length - 1];

  const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const relativeX = ((event.clientX - bounds.left) / bounds.width) * WIDTH;
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
    <GlassPanel className="activity-card" delay={0.05}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Daily Lesson Activity
          </p>
          <p className="text-xs text-slate-400">
            New Users Registration Overview
          </p>
        </div>
        <DateRangePicker
          startDate={start}
          endDate={end}
          onStartDateChange={(value) =>
            value && setRange(({ end }) => ({ start: value, end }))
          }
          onEndDateChange={(value) =>
            value && setRange(({ start }) => ({ start, end: value }))
          }
          className="w-full max-w-xs"
        />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Total New Users
          </p>
          <AnimatedNumber
            value={total}
            className="text-3xl font-black text-slate-900"
          />
          <span
            className={`change-pill ${growth < 0 ? "change-pill--down" : "change-pill--up"}`}
          >
            {growth >= 0 ? "+" : "−"}
            {Math.abs(growth).toFixed(1)}%
          </span>
        </div>
        <div>
          <p className="metric-label">Daily Average</p>
          <p className="metric-value">
            {dailyAvg.toLocaleString("uz-UZ")}
          </p>
        </div>
        <div>
          <p className="metric-label">Peak Day</p>
          <p className="metric-value">{peakDay.toLocaleString("uz-UZ")}</p>
        </div>
      </div>

      <div className="activity-chart" ref={containerRef}>
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          width="100%"
          height="260"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverIndex(null)}
          role="img"
          aria-label="Daily users line chart"
        >
          <defs>
            <linearGradient id="users-stroke" x1="0%" y1="0%" x2="100%" y2="0%">
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
                x2={WIDTH - PADDING.right}
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
                {tick.value.toLocaleString("uz-UZ")}
              </text>
            </g>
          ))}

          <line
            x1={PADDING.left}
            x2={WIDTH - PADDING.right}
            y1={HEIGHT - PADDING.bottom}
            y2={HEIGHT - PADDING.bottom}
            stroke="rgba(148,163,184,0.6)"
          />

          {chartData.xAxisValues.map((tick, index) => (
            <g key={index}>
              <line
                x1={tick.x}
                x2={tick.x}
                y1={HEIGHT - PADDING.bottom}
                y2={HEIGHT - PADDING.bottom + 6}
                stroke="rgba(148,163,184,0.8)"
              />
              <text
                x={tick.x}
                y={HEIGHT - PADDING.bottom + 22}
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
                y2={HEIGHT - PADDING.bottom}
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
              left: `${(activePoint.x / WIDTH) * 100}%`,
              top: `${(activePoint.y / HEIGHT) * 100}%`,
            }}
          >
            <p className="text-xs font-medium text-slate-500">
              {new Date(activePoint.raw.date).toLocaleDateString("uz-UZ", {
                weekday: "short",
                day: "2-digit",
                month: "short",
              })}
            </p>
            <p className="text-lg font-semibold text-slate-800">
              {activePoint.raw.count.toLocaleString("uz-UZ")}
            </p>
          </div>
        )}
      </div>

      <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        Data yangilanishi: {loading ? "yuklanmoqda…" : "real vaqt rejimida"}
      </div>
    </GlassPanel>
  );
}

