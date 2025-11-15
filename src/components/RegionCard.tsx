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

const LocationIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M12 2.25c-4.004 0-7.25 3.246-7.25 7.25 0 5.617 6.592 12.83 6.874 13.13a.5.5 0 0 0 .752 0c.282-.3 6.874-7.514 6.874-13.13 0-4.004-3.246-7.25-7.25-7.25m0 9.5a2.25 2.25 0 1 1 0-4.5 2.25 2.25 0 0 1 0 4.5"
      clipRule="evenodd"
    />
  </svg>
);

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="currentColor"
      d="M5 12a.75.75 0 0 1 .75-.75h9.19l-2.72-2.72a.75.75 0 1 1 1.06-1.06l4 4a.75.75 0 0 1 0 1.06l-4 4a.75.75 0 1 1-1.06-1.06l2.72-2.72H5.75A.75.75 0 0 1 5 12"
    />
  </svg>
);

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
      className="group region-card"
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      <div className={`region-card__icon bg-gradient-to-br text-white ${accentMap[accent]}`}>
        <LocationIcon />
      </div>
      <div className="min-w-0 region-card__body">
        <p className="text-sm font-semibold text-slate-500">{title}</p>
        <span className="region-card__value">
          {valueLabel ?? formatNumber(value)}
        </span>
      </div>
      <div className="region-card__cta" aria-hidden="true">
        <span>To&apos;liq ma&apos;lumot</span>
        <span className="region-card__cta-arrow">
          <ArrowIcon />
        </span>
      </div>
    </motion.div>
  );
}

