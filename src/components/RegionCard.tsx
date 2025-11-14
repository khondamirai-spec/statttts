"use client";

import { formatNumber } from "@/lib/utils";
import { motion } from "framer-motion";

type RegionCardProps = {
  title: string;
  value: number;
  valueLabel?: string;
  accent?: "purple" | "orange" | "blue" | "green";
  onClick?: () => void;
};

const accentMap: Record<NonNullable<RegionCardProps["accent"]>, string> = {
  purple: "from-purple-500 to-purple-300",
  orange: "from-orange-500 to-amber-300",
  blue: "from-sky-500 to-cyan-300",
  green: "from-emerald-500 to-lime-300",
};

export default function RegionCard({
  title,
  value,
  valueLabel,
  accent = "purple",
  onClick,
}: RegionCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 260, damping: 16 }}
      className="region-card"
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      <div className={`region-card__icon bg-gradient-to-br ${accentMap[accent]}`} />
      <div>
        <p className="text-sm font-semibold text-slate-500">{title}</p>
        <span className="region-card__value">
          {valueLabel ?? formatNumber(value)}
        </span>
      </div>
    </motion.div>
  );
}

