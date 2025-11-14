"use client";

import AnimatedNumber from "@/components/shared/AnimatedNumber";
import GlassPanel from "@/components/ui/GlassPanel";
import { useMainStats } from "@/hooks/useMainStats";

export default function CertificatesCard() {
  const { data, loading } = useMainStats();

  return (
    <GlassPanel className="stat-card">
      <div className="stat-card__icon stat-card__icon--green" aria-hidden>
        <svg
          width="28"
          height="28"
          viewBox="0 0 32 32"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
        >
          <path
            d="M10 14L14 18L22 10"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            cx="16"
            cy="16"
            r="12"
            stroke="currentColor"
            strokeWidth="2"
            opacity="0.4"
          />
        </svg>
      </div>
      <p className="stat-card__label">Sertifikat olganlar soni</p>
      {loading ? (
        <p className="stat-card__value">Yuklanmoqda…</p>
      ) : (
        <AnimatedNumber value={data.certificates} className="stat-card__value" />
      )}
      <p className="stat-card__hint">So‘nggi 7 kunda 110+ sertifikatlar berildi</p>
    </GlassPanel>
  );
}


