"use client";

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
  return (
    <GlassPanel className="chart-card">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
        <span className="rounded-full bg-white/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
          % ulushi
        </span>
      </div>
      <div className="chart-card__body">
        <ResponsiveContainer width="100%" height="100%">
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
      </div>
    </GlassPanel>
  );
}



