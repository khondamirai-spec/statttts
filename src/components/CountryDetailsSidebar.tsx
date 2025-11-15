"use client";

import { useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Award, Eye, Globe2, Target, UsersRound } from "lucide-react";
import type { RegionAccent } from "@/components/RegionDetailsSidebar";
import type {
  CountryStat,
  CountryTotals,
} from "@/hooks/useCountryStats";
import { formatNumber } from "@/lib/utils";

export type CountryDetails = CountryStat & { accent?: RegionAccent };

type CountryDetailsSidebarProps = {
  country: CountryDetails | null;
  totals: CountryTotals;
  isOpen: boolean;
  onClose: () => void;
};

const headerGradientMap: Record<RegionAccent, string> = {
  purple: "from-[#5c31ff] via-[#a06bff] to-[#ff7dea]",
  orange: "from-[#ff8c42] via-[#ffb347] to-[#ffd166]",
  blue: "from-[#4c8dff] via-[#4cc7ff] to-[#70e09a]",
  green: "from-[#32d489] via-[#70e09a] to-[#cfff8c]",
};

const contentGradientMap: Record<RegionAccent, string> = {
  purple: "from-[#f8f2ff] via-[#f3f8ff] to-[#f1fff9]",
  orange: "from-[#fff6ed] via-[#f7fbff] to-[#f3fff5]",
  blue: "from-[#f4f8ff] via-[#f0fbff] to-[#f2fff8]",
  green: "from-[#f2fff8] via-[#eff9ff] to-[#f8f2ff]",
};

export default function CountryDetailsSidebar({
  country,
  totals,
  isOpen,
  onClose,
}: CountryDetailsSidebarProps) {
  const accent = country?.accent ?? "purple";

  useEffect(() => {
    if (typeof document === "undefined") return;
    const { body } = document;
    if (isOpen) {
      body.classList.add("region-panel-open");
    } else {
      body.classList.remove("region-panel-open");
    }
    return () => {
      body.classList.remove("region-panel-open");
    };
  }, [isOpen]);

  const metrics = useMemo(() => {
    if (!country) return [];
    return [
      {
        id: "users",
        label: "Foydalanuvchilar",
        value: country.users,
        icon: UsersRound,
        color: "from-[#a06bff] to-[#ff7dea]",
        share: totals.users ? (country.users / totals.users) * 100 : 0,
      },
      {
        id: "views",
        label: "Ko‘rishlar",
        value: country.views,
        icon: Eye,
        color: "from-[#4cc7ff] to-[#7dc9ff]",
        share: totals.views ? (country.views / totals.views) * 100 : 0,
      },
      {
        id: "certificates",
        label: "Sertifikatlar",
        value: country.certificates,
        icon: Award,
        color: "from-[#70e09a] to-[#cfff8c]",
        share: totals.certificates
          ? (country.certificates / totals.certificates) * 100
          : 0,
      },
    ];
  }, [country, totals]);

  return (
    <AnimatePresence>
      {isOpen && country && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-md shadow-2xl"
          >
            <div
              className={`flex h-full flex-col bg-gradient-to-br ${contentGradientMap[accent]} text-slate-900`}
            >
              <div
                className={`relative bg-gradient-to-r ${headerGradientMap[accent]} px-6 pb-6 pt-8 text-white shadow-lg`}
              >
                <p className="text-xs uppercase tracking-[0.3em] text-white/70">
                  Davlat tafsilotlari
                </p>
                <div className="mt-1 flex items-center justify-between">
                  <h2 className="text-3xl font-bold">{country.country}</h2>
                  <button
                    className="rounded-full bg-white/10 px-4 py-1 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-white/20"
                    onClick={onClose}
                  >
                    Yopish
                  </button>
                </div>
                <p className="mt-3 max-w-xs text-sm text-white/80">
                  Davlat bo‘yicha foydalanuvchi faolligi, ko‘rishlar va sertifikatlar
                  ulushi bilan batafsil tanishing.
                </p>
              </div>

              <div className="flex-1 overflow-y-auto px-6 pb-10 pt-6">
                <section className="space-y-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Asosiy ko‘rsatkichlar
                  </p>
                  <div className="grid grid-cols-1 gap-4">
                    {metrics.map((metric) => {
                      const Icon = metric.icon;
                      return (
                        <div
                          key={metric.id}
                          className="rounded-2xl border border-white/60 bg-white/70 p-4 shadow-sm backdrop-blur-sm"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                {metric.label}
                              </p>
                              <p className="text-3xl font-bold text-slate-900">
                                {formatNumber(metric.value)}
                              </p>
                            </div>
                            <span
                              className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${metric.color} text-white shadow-lg`}
                            >
                              <Icon className="h-6 w-6" />
                            </span>
                          </div>
                          <div className="mt-4">
                            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                              <span>Umumiy ulush</span>
                              <span>{metric.share.toFixed(1)}%</span>
                            </div>
                            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200/70">
                              <div
                                className={`h-full rounded-full bg-gradient-to-r ${metric.color}`}
                                style={{
                                  width: `${Math.min(metric.share, 100)}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                <section className="mt-8 space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Strategik ko‘rinish
                  </p>
                  <div className="space-y-3">
                    <InsightCard
                      icon={Globe2}
                      title="Hududiy qamrov"
                      description="Davlat platformadagi global faollikning muhim qismini tashkil qiladi."
                    />
                    <InsightCard
                      icon={Target}
                      title="O‘sish imkoniyati"
                      description="Safarbarlik kampaniyalarini kuchaytirish foydalanuvchi bazasini yanada kengaytirishi mumkin."
                    />
                  </div>
                </section>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

type InsightCardProps = {
  icon: typeof Globe2;
  title: string;
  description: string;
};

function InsightCard({ icon: Icon, title, description }: InsightCardProps) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-white/60 bg-white/80 p-4 shadow-sm backdrop-blur">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900/5 text-slate-700">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="text-sm text-slate-600">{description}</p>
      </div>
    </div>
  );
}


