"use client";

import AnimatedNumber from "@/components/shared/AnimatedNumber";
import GlassPanel from "@/components/ui/GlassPanel";
import { useMainStats } from "@/hooks/useMainStats";

export default function LessonsCard() {
  const { data, loading } = useMainStats();

  return (
    <GlassPanel className="stat-card">
      <div className="stat-card__icon stat-card__icon--blue" aria-hidden>
        <svg
          width="28"
          height="28"
          viewBox="0 0 32 32"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
        >
          <rect
            x="2"
            y="8"
            width="28"
            height="16"
            rx="4"
            fill="currentColor"
            opacity="0.3"
          />
          <path
            d="M4 20H16V24H4V20Z"
            fill="currentColor"
          />
        </svg>
      </div>
      <p className="stat-card__label">Video darslar soni</p>
      {loading ? (
        <p className="stat-card__value">Yuklanmoqda…</p>
      ) : (
        <AnimatedNumber value={data.lessons} className="stat-card__value" />
      )}
      <p className="stat-card__hint">So’nggi oyda +18 ta yangi kurs qo’shildi</p>
    </GlassPanel>
  );
}

