"use client";

import { useEffect, useRef, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import GlassPanel from "./ui/GlassPanel";

const GRADIENTS = [
  ["#7c3aed", "#a78bfa"],
  ["#06b6d4", "#67e8f9"],
  ["#f97316", "#fdba74"],
  ["#10b981", "#6ee7b7"],
  ["#f43f5e", "#fda4af"],
  ["#6366f1", "#a5b4fc"],
  ["#0ea5e9", "#7dd3fc"],
  ["#facc15", "#fef08a"],
];

const RADIAN = Math.PI / 180;

function renderLabel({
  cx,
  cy,
  midAngle,
  outerRadius,
  percent,
  name,
}) {
  if (!percent || percent * 100 < 2) return null;
  const radius = outerRadius + 12;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#0f172a"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      className="text-[0.85rem] font-semibold drop-shadow"
    >
      {name}: {(percent * 100).toFixed(1)}%
    </text>
  );
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const data = payload[0];
  return (
    <div className="rounded-xl bg-white/70 px-3 py-2 text-sm font-medium text-slate-700 shadow-lg backdrop-blur">
      {data.name}: {data.value}%
    </div>
  );
};

export default function ChartCard({ title, data }) {
  const wrapperRef = useRef(null);
  const bodyRef = useRef(null);
  const [hasSize, setHasSize] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = wrapperRef.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const node = bodyRef.current;
    if (!node) return;

    const updateSize = ({ width, height }) => {
      const next = width > 0 && height > 0;
      setHasSize((prev) => (prev === next ? prev : next));
    };

    const measure = () => {
      const rect = node.getBoundingClientRect();
      updateSize(rect);
    };

    measure();

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver((entries) => {
        entries.forEach((entry) => updateSize(entry.contentRect));
      });
      observer.observe(node);
      return () => observer.disconnect();
    }

    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  return (
    <div ref={wrapperRef}>
      <GlassPanel className="chart-card">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
        <span className="rounded-full bg-white/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
          % ulushi
        </span>
      </div>
      <div className="chart-card__body" ref={bodyRef}>
        {hasSize && isVisible ? (
          <ResponsiveContainer
            width="100%"
            height="100%"
            minWidth={120}
            minHeight={120}
          >
            <PieChart>
              <defs>
                {GRADIENTS.map(([start, end], index) => (
                  <linearGradient
                    key={index}
                    id={`chart-slice-${index}`}
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor={start} />
                    <stop offset="100%" stopColor={end} />
                  </linearGradient>
                ))}
              </defs>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius="45%"
                outerRadius="70%"
                paddingAngle={2}
                labelLine={false}
                label={renderLabel}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`slice-${entry.name}`}
                    fill={`url(#chart-slice-${index % GRADIENTS.length})`}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="chart-card__placeholder shimmer" aria-hidden="true" />
        )}
      </div>
    </GlassPanel>
    </div>
  );
}



