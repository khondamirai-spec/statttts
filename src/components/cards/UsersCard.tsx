"use client";

import AnimatedNumber from "@/components/shared/AnimatedNumber";
import GlassPanel from "@/components/ui/GlassPanel";
import { useMainStats } from "@/hooks/useMainStats";

export default function UsersCard() {
  const { data, loading } = useMainStats();

  return (
    <GlassPanel className="stat-card">
      <div className="stat-card__icon stat-card__icon--purple" aria-hidden>
        <svg
          width="28"
          height="28"
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            opacity="0.3"
            d="M14 14C17.866 14 21 10.866 21 7C21 3.13401 17.866 0 14 0C10.134 0 7 3.13401 7 7C7 10.866 10.134 14 14 14Z"
            fill="currentColor"
          />
          <path
            d="M14 16C9.02944 16 0 18.5147 0 23.3333V28H28V23.3333C28 18.5147 18.9706 16 14 16Z"
            fill="currentColor"
          />
        </svg>
      </div>
      <p className="stat-card__label">Foydalanuvchilar</p>
      {loading ? (
        <p className="stat-card__value">Yuklanmoqda…</p>
      ) : (
        <AnimatedNumber
          value={data.users}
          className="stat-card__value"
          suffix=""
        />
      )}
      <p className="stat-card__hint">
        Oxirgi 24 soatda +4.3% o’sish kuzatildi
      </p>
    </GlassPanel>
  );
}

