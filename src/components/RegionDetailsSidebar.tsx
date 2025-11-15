"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Award, Eye, UsersRound, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getDistricts, getVillageSchool } from "@/lib/api";
import { formatNumber, toNumber } from "@/lib/utils";
import type { RegionStat } from "@/hooks/useRegionStats";

type PanelTab = "districts" | "mfy" | "schools";
type NestedTab = "mfy" | "schools";

type MetricEntity = {
  name: string;
  users: number;
  views: number;
  certificates: number;
};

type VillageSchoolMetrics = {
  mfys: MetricEntity[];
  schools: MetricEntity[];
};

const emptyVillageSchool: VillageSchoolMetrics = { mfys: [], schools: [] };

function normalizeDistricts(rows: Awaited<ReturnType<typeof getDistricts>>) {
  if (!rows) return [];
  return rows.map((row, index) => ({
    name: row?.district ?? `Tuman ${index + 1}`,
    users: toNumber(row?.users),
    views: toNumber(row?.views),
    certificates: toNumber(row?.certificates),
  }));
}

function normalizeVillageSchool(
  payload: Awaited<ReturnType<typeof getVillageSchool>>,
): VillageSchoolMetrics {
  const villages =
    payload?.villages?.map((row, index) => ({
      name: row?.neighborhood ?? row?.mfy ?? `MFY ${index + 1}`,
      users: toNumber(row?.users),
      views: toNumber(row?.views),
      certificates: toNumber(row?.certificates),
    })) ?? [];

  const schools =
    payload?.schools?.map((row, index) => ({
      name: row?.organization ?? row?.school ?? `Maktab ${index + 1}`,
      users: toNumber(row?.users),
      views: toNumber(row?.views),
      certificates: toNumber(row?.certificates),
    })) ?? [];

  return { mfys: villages, schools };
}

export type RegionAccent = "purple" | "orange" | "blue" | "green";

export type RegionDetailsRegion = RegionStat & {
  accent?: RegionAccent;
};

type RegionDetailsSidebarProps = {
  region: RegionDetailsRegion | null;
  isOpen: boolean;
  onClose: () => void;
};

const metricBadgeStyles = {
  users: {
    gradient: "from-[#a06bff] via-[#c08dff] to-[#ff7dea]",
    glow: "shadow-[0_10px_25px_rgba(160,107,255,0.25)]",
  },
  views: {
    gradient: "from-[#4cc7ff] via-[#4c8dff] to-[#7dc9ff]",
    glow: "shadow-[0_10px_25px_rgba(76,199,255,0.3)]",
  },
  certificates: {
    gradient: "from-[#70e09a] via-[#9cf3b8] to-[#cfff8c]",
    glow: "shadow-[0_10px_25px_rgba(112,224,154,0.3)]",
  },
};

const nestedStatGradients: Record<"users" | "views" | "certificates", string> = {
  users: "from-[#b770ff] via-[#d48cff] to-[#ff9bd8]",
  views: "from-[#6cb8ff] via-[#4cc7ff] to-[#7de2ff]",
  certificates: "from-[#52dcb1] via-[#70e09a] to-[#a9f7c6]",
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

export default function RegionDetailsSidebar({
  region,
  isOpen,
  onClose,
}: RegionDetailsSidebarProps) {
  const [activeTab, setActiveTab] = useState<PanelTab>("districts");
  const [selectedDistrict, setSelectedDistrict] = useState<MetricEntity | null>(null);
  const [contentLoading, setContentLoading] = useState(false);
  const loadingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [districts, setDistricts] = useState<MetricEntity[]>([]);
  const [districtsLoading, setDistrictsLoading] = useState(false);
  const [districtsError, setDistrictsError] = useState<string | null>(null);
  const [regionVillageData, setRegionVillageData] = useState<VillageSchoolMetrics | null>(null);
  const [regionVillageLoading, setRegionVillageLoading] = useState(false);
  const [regionVillageError, setRegionVillageError] = useState<string | null>(null);
  const [districtVillageData, setDistrictVillageData] = useState<VillageSchoolMetrics | null>(null);
  const [districtVillageLoading, setDistrictVillageLoading] = useState(false);
  const [districtVillageError, setDistrictVillageError] = useState<string | null>(null);

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

  useEffect(() => {
    if (!isOpen) {
      setSelectedDistrict(null);
      setActiveTab("districts");
      setContentLoading(false);
      setRegionVillageData(null);
      setRegionVillageError(null);
      setRegionVillageLoading(false);
      setDistrictVillageData(null);
      setDistrictVillageError(null);
      setDistrictVillageLoading(false);
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (loadingTimer.current) {
        clearTimeout(loadingTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!region?.region || !isOpen) {
      setDistricts([]);
      setSelectedDistrict(null);
      setDistrictsError(null);
      setDistrictsLoading(false);
      return;
    }

    let active = true;
    setDistrictsLoading(true);
    setDistrictsError(null);

    getDistricts(region.region)
      .then((rows) => {
        if (!active) return;
        const normalized = normalizeDistricts(rows);
        if (!rows) {
          setDistrictsError("Ma’lumotlarni yuklab bo‘lmadi. Qayta urinib ko‘ring.");
        }
        setDistricts(normalized);
      })
      .catch(() => {
        if (!active) return;
        setDistrictsError("Ma’lumotlarni yuklab bo‘lmadi. Qayta urinib ko‘ring.");
        setDistricts([]);
      })
      .finally(() => {
        if (active) {
          setDistrictsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [region?.region, isOpen]);

  useEffect(() => {
    if (!isOpen || !region?.region) {
      setRegionVillageData(null);
      setRegionVillageError(null);
      setRegionVillageLoading(false);
      return;
    }

    let active = true;
    setRegionVillageLoading(true);
    setRegionVillageError(null);

    getVillageSchool(region.region)
      .then((payload) => {
        if (!active) return;
        if (!payload) {
          setRegionVillageError("MFY va maktab ma’lumotlarini yuklab bo‘lmadi.");
          setRegionVillageData(null);
          return;
        }
        setRegionVillageData(normalizeVillageSchool(payload));
      })
      .catch(() => {
        if (!active) return;
        setRegionVillageError("MFY va maktab ma’lumotlarini yuklab bo‘lmadi.");
        setRegionVillageData(null);
      })
      .finally(() => {
        if (active) {
          setRegionVillageLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [isOpen, region?.region]);

  useEffect(() => {
    if (!region?.region || !selectedDistrict) {
      setDistrictVillageData(null);
      setDistrictVillageError(null);
      setDistrictVillageLoading(false);
      return;
    }

    let active = true;
    setDistrictVillageLoading(true);
    setDistrictVillageError(null);
    setDistrictVillageData(null);

    getVillageSchool(region.region, selectedDistrict.name)
      .then((payload) => {
        if (!active) return;
        if (!payload) {
          setDistrictVillageError("Ma’lumotlarni yuklab bo‘lmadi. Qayta urinib ko‘ring.");
          setDistrictVillageData(null);
          return;
        }
        setDistrictVillageData(normalizeVillageSchool(payload));
      })
      .catch(() => {
        if (!active) return;
        setDistrictVillageError("Ma’lumotlarni yuklab bo‘lmadi. Qayta urinib ko‘ring.");
        setDistrictVillageData(null);
      })
      .finally(() => {
        if (active) {
          setDistrictVillageLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [region?.region, selectedDistrict]);

  const stats = useMemo(
    () => [
      {
        id: "users",
        value: region?.users ?? 0,
        label: "Foydalanuvchilar",
      },
      {
        id: "views",
        value: region?.views ?? 0,
        label: "Ko‘rishlar",
      },
      {
        id: "certificates",
        value: region?.certificates ?? 0,
        label: "Sertifikatlar",
      },
    ],
    [region],
  );
  const hasDistrictSelection = Boolean(selectedDistrict);
  const combinedVillageData = hasDistrictSelection ? districtVillageData : regionVillageData;
  const combinedVillageLoading = hasDistrictSelection
    ? districtVillageLoading
    : regionVillageLoading;
  const combinedVillageError = hasDistrictSelection
    ? districtVillageError
    : regionVillageError;

  const handleTabChange = (tab: PanelTab) => {
    if (tab === activeTab) return;
    setContentLoading(true);
    setActiveTab(tab);
    if (loadingTimer.current) clearTimeout(loadingTimer.current);
    loadingTimer.current = setTimeout(() => setContentLoading(false), 420);
  };
  const accent: RegionAccent = region?.accent ?? "purple";
  const contentGradient = contentGradientMap[accent];

  return (
    <AnimatePresence>
      {isOpen && region && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[2px]"
            onClick={onClose}
          />
          <RightPanel>
            <div className="flex h-full flex-col">
              <RegionHeader
                title={region.region}
                onClose={onClose}
                accent={region.accent}
                stats={stats}
              />
              <div
                className={`relative flex-1 overflow-y-auto bg-gradient-to-br ${contentGradient} text-slate-900`}
              >
                <div
                  className="pointer-events-none absolute inset-0 opacity-40"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 25% 20%, rgba(160,107,255,0.18), transparent 45%), radial-gradient(circle at 75% 0%, rgba(76,199,255,0.12), transparent 35%), radial-gradient(circle at 50% 80%, rgba(112,224,154,0.2), transparent 45%)",
                  }}
                />
                <div className="relative space-y-6 px-5 pb-9 pt-6">
                  <TabGroup<PanelTab>
                    tabs={[
                      { id: "districts", label: "Tuman/Shahar" },
                      { id: "mfy", label: "MFY" },
                      { id: "schools", label: "Maktab" },
                    ]}
                    activeTab={activeTab}
                    onChange={handleTabChange}
                  />

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${activeTab}-${contentLoading ? "loading" : "ready"}`}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 12 }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                      className="space-y-4"
                    >
                      {activeTab === "districts" && (
                        <DistrictList
                          data={districts}
                          loading={contentLoading || districtsLoading}
                          error={districtsError}
                          onSelect={setSelectedDistrict}
                          activeName={selectedDistrict?.name}
                        />
                      )}
                      {activeTab === "mfy" && (
                        <MfyList
                          data={combinedVillageData?.mfys ?? []}
                          loading={contentLoading || combinedVillageLoading}
                          error={combinedVillageError}
                          emptyMessage={
                            hasDistrictSelection
                              ? "MFY ma’lumotlari topilmadi."
                              : "Hudud bo‘yicha MFY ma’lumotlari topilmadi."
                          }
                        />
                      )}
                      {activeTab === "schools" && (
                        <SchoolList
                          data={combinedVillageData?.schools ?? []}
                          loading={contentLoading || combinedVillageLoading}
                          error={combinedVillageError}
                          emptyMessage={
                            hasDistrictSelection
                              ? "Maktab ma’lumotlari topilmadi."
                              : "Hudud bo‘yicha maktab ma’lumotlari topilmadi."
                          }
                        />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </RightPanel>

          <NestedPanel
            district={selectedDistrict}
            onClose={() => setSelectedDistrict(null)}
            data={districtVillageData}
            loading={districtVillageLoading}
            error={districtVillageError}
          />
        </>
      )}
    </AnimatePresence>
  );
}

type RightPanelProps = {
  children: ReactNode;
};

function RightPanel({ children }: RightPanelProps) {
  return (
    <motion.section
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="fixed right-0 top-0 z-50 h-full w-full max-w-[430px] overflow-hidden border-l border-white/50 bg-white/85 shadow-[0_20px_60px_rgba(34,48,94,0.25)] backdrop-blur-[28px]"
    >
      {children}
    </motion.section>
  );
}

type HeaderStat = {
  id: string;
  label: string;
  value: number;
};

type RegionHeaderProps = {
  title: string;
  onClose: () => void;
  variant?: "primary" | "nested";
  accent?: RegionAccent;
  stats?: HeaderStat[];
};

function RegionHeader({
  title,
  onClose,
  variant = "primary",
  accent = "purple",
  stats = [],
}: RegionHeaderProps) {
  const isPrimary = variant === "primary";
  const headerGradient = headerGradientMap[accent] ?? headerGradientMap.purple;
  const statIconMap: Record<string, LucideIcon> = {
    users: UsersRound,
    views: Eye,
    certificates: Award,
  };
  return (
    <div
      className={`sticky top-0 z-20 px-7 ${
        isPrimary
          ? `overflow-hidden border-b border-white/15 bg-gradient-to-br ${headerGradient} pb-7 pt-8 text-white shadow-[0_18px_40px_rgba(30,41,99,0.45)] backdrop-blur-3xl`
          : "flex items-center justify-between border-b border-white/20 bg-gradient-to-br from-[#a06bff] via-[#4cc7ff] to-[#70e09a] pb-4 pt-5 text-white backdrop-blur-2xl"
      }`}
    >
      {isPrimary ? (
        <div className="space-y-5">
          <div className="flex items-start justify-between gap-6">
            <div className="relative space-y-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.4em] text-white/70">
                <span className="h-1.5 w-1.5 rounded-full bg-[#70e09a]" />
                Region
              </span>
              <div>
                <p className="text-3xl font-bold tracking-tight">{title}</p>
                <p className="text-sm text-white/70">Yangilangan statistikalar</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              aria-label="Close panel"
              className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-900 shadow-[0_10px_35px_rgba(255,255,255,0.45)] transition-all duration-200 hover:shadow-[0_18px_45px_rgba(255,255,255,0.6)]"
            >
              <X className="h-5 w-5" />
              <span className="absolute inset-0 rounded-full bg-gradient-to-br from-white to-transparent opacity-70 blur-[1px]" />
            </motion.button>
          </div>
          {!!stats.length && (
            <div className="flex flex-nowrap items-center gap-2">
              {stats.map((stat) => {
                const Icon = statIconMap[stat.id] ?? UsersRound;
                return (
                  <span
                    key={stat.id}
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.35em] text-white/70 shadow-[0_8px_20px_rgba(255,255,255,0.12)] transition-all duration-200 hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/20 hover:text-white"
                  >
                    <Icon className="h-3.5 w-3.5 text-white" aria-hidden="true" />
                    <span className="text-base tracking-tight text-white transition-colors duration-200">
                      {formatNumber(stat.value)}
                    </span>
                    <span className="sr-only">{stat.label}</span>
                  </span>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="flex w-full flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/70">Tuman</p>
              <p className="text-lg font-semibold tracking-tight">{title}</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              aria-label="Close panel"
              className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-900 shadow-[0_10px_25px_rgba(255,255,255,0.5)] transition-all duration-200"
            >
              <X className="h-5 w-5" />
              <span className="absolute inset-0 rounded-full bg-gradient-to-br from-white to-transparent opacity-70" />
            </motion.button>
          </div>
          {!!stats.length && (
            <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap">
              {stats.map((stat) => {
                const Icon = statIconMap[stat.id] ?? UsersRound;
                const gradient =
                  nestedStatGradients[stat.id as keyof typeof nestedStatGradients] ?? nestedStatGradients.users;
                return (
                  <span
                    key={stat.id}
                    className={`inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-gradient-to-r ${gradient} px-2.5 py-1 text-xs font-semibold text-white shadow-[0_10px_25px_rgba(30,41,99,0.35)]`}
                  >
                    <Icon className="h-3.5 w-3.5 text-white" aria-hidden="true" />
                    <span className="text-sm font-bold text-white">{formatNumber(stat.value)}</span>
                  </span>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

type TabGroupProps<T extends string> = {
  tabs: Array<{ id: T; label: string }>;
  activeTab: T;
  onChange: (tab: T) => void;
  variant?: "primary" | "compact";
};

function TabGroup<T extends string>({
  tabs,
  activeTab,
  onChange,
  variant = "primary",
}: TabGroupProps<T>) {
  const layoutId = variant === "primary" ? "panelTabs" : "nestedTabs";
  const containerClass =
    variant === "primary"
      ? "rounded-[26px] border border-white/60 bg-white/30 p-1.5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.35)]"
      : "rounded-[22px] border border-white/50 bg-white/20 p-1 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)]";
  return (
    <div
      className={`flex items-center gap-2 ${containerClass} backdrop-blur-2xl ${
        variant === "primary" ? "text-sm" : "text-xs"
      }`}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`relative flex-1 overflow-hidden rounded-[22px] border px-3 py-1.5 font-semibold transition-all duration-300 ${
              isActive
                ? "border-transparent text-white drop-shadow-[0_10px_25px_rgba(112,224,154,0.35)]"
                : "border-white/50 text-slate-400"
            } ${variant === "primary" ? "py-2" : "py-1.5 text-xs"}`}
            type="button"
            role="tab"
            aria-pressed={isActive}
          >
            {isActive && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-[22px] bg-gradient-to-r from-[#a06bff] via-[#4cc7ff] to-[#70e09a] shadow-[0_15px_35px_rgba(76,199,255,0.35)]"
                transition={{ type: "spring", stiffness: 320, damping: 28 }}
              />
            )}
            {!isActive && (
              <span className="absolute inset-0 rounded-[22px] bg-white/5 backdrop-blur-sm" />
            )}
            <span
              className={`relative z-10 transition-transform duration-200 ${
                isActive ? "scale-[1.03]" : "scale-[0.96]"
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

type DistrictListProps = {
  data: MetricEntity[];
  loading?: boolean;
  onSelect?: (district: MetricEntity) => void;
  error?: string | null;
  activeName?: string;
};

type ListSectionProps = {
  title: string;
  children: ReactNode;
};

function ListSection({ title, children }: ListSectionProps) {
  return (
    <section className="rounded-[32px] border border-white/70 bg-white/85 px-5 py-6 shadow-[0_12px_35px_rgba(37,30,77,0.12),0_25px_55px_rgba(112,224,154,0.12)] backdrop-blur-2xl">
      <div className="flex items-center gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.45em] text-slate-500">
          {title}
        </p>
        <span className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      </div>
      <div className="mt-4 flex flex-col gap-4">{children}</div>
    </section>
  );
}

function DistrictList({ data, loading, onSelect, error, activeName }: DistrictListProps) {
  return (
    <ListSection title="Tumanlar">
      {loading ? (
        <SkeletonList rows={3} />
      ) : error ? (
        <ErrorNotice message={error} />
      ) : data.length ? (
        data.map((district, index) => (
          <DistrictCard
            key={`${district.name}-${index}`}
            district={district}
            delay={index * 0.05}
            onSelect={onSelect}
            isActive={district.name === activeName}
          />
        ))
      ) : (
        <EmptyStateNotice message="Tuman/shahar ma’lumotlari topilmadi." />
      )}
    </ListSection>
  );
}

type DistrictCardProps = {
  district: MetricEntity;
  onSelect?: (district: MetricEntity) => void;
  delay?: number;
  isActive?: boolean;
};

function DistrictCard({ district, onSelect, delay = 0, isActive }: DistrictCardProps) {
  const miniMetrics: MiniMetric[] = [
    {
      label: miniMetricConfig.users.label,
      value: district.users,
      icon: miniMetricConfig.users.icon,
      tone: miniMetricConfig.users.tone,
    },
    {
      label: miniMetricConfig.views.label,
      value: district.views,
      icon: miniMetricConfig.views.icon,
      tone: miniMetricConfig.views.tone,
    },
    {
      label: miniMetricConfig.certificates.label,
      value: district.certificates,
      icon: miniMetricConfig.certificates.icon,
      tone: miniMetricConfig.certificates.tone,
    },
  ];
  return (
    <motion.button
      type="button"
      onClick={() => onSelect?.(district)}
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.99 }}
      transition={{ delay, duration: 0.25, ease: "easeOut" }}
      className={`group relative w-full rounded-3xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a06bff]/40 ${
        isActive ? "ring-2 ring-[#a06bff]/50" : ""
      }`}
    >
      <span className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-r from-[#a06bff]/35 via-[#4cc7ff]/25 to-[#70e09a]/35 opacity-50 transition-opacity duration-300 group-hover:opacity-90" />
      <span className="pointer-events-none absolute inset-[1px] rounded-[30px] bg-white/85" />
      <div className="relative flex items-center justify-between gap-3 rounded-[28px] border border-white/70 px-4 py-3 shadow-[0_12px_30px_rgba(34,48,94,0.12)] transition-all duration-300 group-hover:shadow-[0_18px_40px_rgba(160,107,255,0.12),0_30px_70px_rgba(76,199,255,0.22)]">
        <div className="min-w-0">
          <p className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            <span>Ko'proq ma'lumot</span>
            <motion.span
              aria-hidden="true"
              animate={{ x: [0, 3, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
              className="inline-flex items-center"
            >
              <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
            </motion.span>
          </p>
          <p className="mt-1 break-words text-sm font-semibold text-slate-900">{district.name}</p>
        </div>
        <div className="flex items-center gap-1.5">
          {miniMetrics.map((metric) => (
            <MiniMetricBubble key={metric.label} metric={metric} />
          ))}
        </div>
      </div>
    </motion.button>
  );
}

type MiniMetricBubbleProps = {
  metric: MiniMetric;
};

function MiniMetricBubble({ metric }: MiniMetricBubbleProps) {
  const [hovered, setHovered] = useState(false);
  const Icon = metric.icon;
  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-2xl bg-gradient-to-br ${miniMetricPalette[metric.tone]} text-white shadow-[0_8px_20px_rgba(34,48,94,0.15)]`}
      >
        <Icon className="h-3.5 w-3.5" />
      </div>
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute left-1/2 top-10 z-10 w-32 -translate-x-1/2 rounded-2xl bg-white px-3 py-2 text-center text-[11px] font-semibold text-black shadow-[0_12px_30px_rgba(34,48,94,0.25)]"
          >
            <span className="block text-[8px] font-semibold uppercase tracking-[0.2em] text-black">
              {metric.label}
            </span>
            <span className="text-lg font-black text-black">{formatNumber(metric.value)}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

type MetricBadgeProps = {
  label: string;
  value: number;
  color: keyof typeof metricBadgeStyles;
};

type MiniMetric = {
  label: string;
  value: number;
  icon: LucideIcon;
  tone: "purple" | "blue" | "green";
};

const miniMetricConfig: Record<
  "users" | "views" | "certificates",
  { icon: LucideIcon; tone: MiniMetric["tone"]; label: string }
> = {
  users: { icon: UsersRound, tone: "purple", label: "Foydalanuvchilar" },
  views: { icon: Eye, tone: "blue", label: "Ko‘rishlar" },
  certificates: { icon: Award, tone: "green", label: "Sertifikatlar" },
};

const miniMetricPalette: Record<MiniMetric["tone"], string> = {
  purple: "from-[#a06bff] via-[#c08dff] to-[#ff7dea]",
  blue: "from-[#4cc7ff] via-[#4c8dff] to-[#7de2ff]",
  green: "from-[#70e09a] via-[#9cf3b8] to-[#cfff8c]",
};

function MetricBadge({ label, value, color }: MetricBadgeProps) {
  const style = metricBadgeStyles[color];
  return (
    <span
      className={`relative inline-flex items-center gap-1.5 rounded-[999px] border border-white/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.35em] text-white ${style.glow}`}
    >
      <span
        className={`pointer-events-none absolute inset-0 rounded-[999px] bg-gradient-to-r ${style.gradient} opacity-95`}
      />
      <span className="relative text-white/80">{label}</span>
      <span className="relative text-sm font-bold tracking-tight text-white">
        {formatNumber(value)}
      </span>
    </span>
  );
}

type EntityListProps = {
  data: MetricEntity[];
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
};

function MfyList({ data, loading, error, emptyMessage }: EntityListProps) {
  return (
    <ListSection title="MFYlar">
      {loading ? (
        <SkeletonList rows={3} />
      ) : error ? (
        <ErrorNotice message={error} />
      ) : data.length ? (
        data.map((entity, index) => (
          <EntityCard key={`${entity.name}-${index}`} entity={entity} accent="pink" delay={index * 0.04} />
        ))
      ) : (
        <EmptyStateNotice message={emptyMessage ?? "MFY ma’lumotlari topilmadi."} />
      )}
    </ListSection>
  );
}

function SchoolList({ data, loading, error, emptyMessage }: EntityListProps) {
  return (
    <ListSection title="Maktablar">
      {loading ? (
        <SkeletonList rows={3} />
      ) : error ? (
        <ErrorNotice message={error} />
      ) : data.length ? (
        data.map((entity, index) => (
          <EntityCard key={`${entity.name}-${index}`} entity={entity} accent="blue" delay={index * 0.04} />
        ))
      ) : (
        <EmptyStateNotice message={emptyMessage ?? "Maktab ma’lumotlari topilmadi."} />
      )}
    </ListSection>
  );
}

type EntityCardProps = {
  entity: MetricEntity;
  accent: "pink" | "blue";
  delay?: number;
};

function EntityCard({ entity, accent, delay = 0 }: EntityCardProps) {
  const accentGradient =
    accent === "pink"
      ? "from-[#ff7dea]/30 via-[#a06bff]/15 to-[#4cc7ff]/10"
      : "from-[#4cc7ff]/35 via-[#4c8dff]/15 to-[#70e09a]/10";

  const entityMetrics: MiniMetric[] = [
    {
      label: miniMetricConfig.users.label,
      value: entity.users,
      icon: miniMetricConfig.users.icon,
      tone: miniMetricConfig.users.tone,
    },
    {
      label: miniMetricConfig.views.label,
      value: entity.views,
      icon: miniMetricConfig.views.icon,
      tone: miniMetricConfig.views.tone,
    },
    {
      label: miniMetricConfig.certificates.label,
      value: entity.certificates,
      icon: miniMetricConfig.certificates.icon,
      tone: miniMetricConfig.certificates.tone,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: "easeOut" }}
      className="group relative w-full rounded-3xl text-left"
    >
      <span
        className={`pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-r ${accentGradient} opacity-60 transition-opacity duration-300 group-hover:opacity-90`}
      />
      <span className="pointer-events-none absolute inset-[1px] rounded-[30px] bg-white/85" />
      <div className="relative flex items-center justify-between gap-3 rounded-[28px] border border-white/70 px-4 py-3 text-slate-900 shadow-[0_12px_30px_rgba(34,48,94,0.12)] transition-all duration-300 group-hover:shadow-[0_18px_40px_rgba(160,107,255,0.12),0_30px_70px_rgba(76,199,255,0.22)]">
        <div className="min-w-0">
          <p className="break-words text-sm font-semibold text-slate-900">{entity.name}</p>
        </div>
        <div className="flex items-center gap-1.5">
          {entityMetrics.map((metric) => (
            <MiniMetricBubble key={`${entity.name}-${metric.label}`} metric={metric} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

type SkeletonListProps = {
  rows?: number;
};

function SkeletonList({ rows = 3 }: SkeletonListProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-[30px] border border-white/70 bg-white/75 px-5 py-4 shadow-[0_12px_35px_rgba(37,30,77,0.12)] backdrop-blur-xl"
        >
          <div className="h-4 w-1/3 rounded-full bg-slate-200/70 animate-pulse" />
          <div className="mt-4 flex flex-wrap gap-2">
            <div className="h-7 w-20 rounded-full bg-slate-200/60 animate-pulse" />
            <div className="h-7 w-20 rounded-full bg-slate-200/60 animate-pulse" />
            <div className="h-7 w-20 rounded-full bg-slate-200/60 animate-pulse" />
          </div>
        </div>
      ))}
    </>
  );
}

type NoticeProps = {
  message: string;
};

function ErrorNotice({ message }: NoticeProps) {
  return (
    <p className="rounded-3xl bg-red-50 px-4 py-3 text-center text-sm font-semibold text-red-600">
      {message}
    </p>
  );
}

function EmptyStateNotice({ message }: NoticeProps) {
  return (
    <p className="rounded-3xl border border-dashed border-slate-200/80 bg-white/60 px-4 py-5 text-center text-sm font-semibold text-slate-500">
      {message}
    </p>
  );
}

type NestedPanelProps = {
  district: MetricEntity | null;
  onClose: () => void;
  data: VillageSchoolMetrics | null;
  loading: boolean;
  error: string | null;
};

function NestedPanel({ district, onClose, data, loading, error }: NestedPanelProps) {
  const [activeTab, setActiveTab] = useState<NestedTab>("mfy");
  const [tabTransitionLoading, setTabTransitionLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!district) {
      setActiveTab("mfy");
      setTabTransitionLoading(false);
    }
  }, [district]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleChange = (tab: NestedTab) => {
    if (tab === activeTab) return;
    setTabTransitionLoading(true);
    setActiveTab(tab);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setTabTransitionLoading(false), 320);
  };

  return (
    <AnimatePresence>
      {district && (
        <motion.section
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.26, ease: "easeOut" }}
          className="fixed right-0 top-0 z-[60] h-full w-full max-w-[340px] overflow-hidden border-l border-white/50 bg-white/90 shadow-[0_15px_45px_rgba(34,48,94,0.28)] backdrop-blur-[26px]"
        >
          <div className="flex h-full flex-col">
            <RegionHeader
              title={district.name}
              onClose={onClose}
              variant="nested"
              stats={[
                { id: "users", label: miniMetricConfig.users.label, value: district.users },
                { id: "views", label: miniMetricConfig.views.label, value: district.views },
                { id: "certificates", label: miniMetricConfig.certificates.label, value: district.certificates },
              ]}
            />
            <div className="relative flex-1 overflow-y-auto bg-gradient-to-b from-[#f7f3ff] via-[#f5fbff] to-[#f1fff7] px-5 pb-8 pt-5 text-slate-900">
              <div
                className="pointer-events-none absolute inset-0 opacity-30"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 20% 10%, rgba(160,107,255,0.2), transparent 45%), radial-gradient(circle at 80% 15%, rgba(76,199,255,0.15), transparent 40%)",
                }}
              />
              <div className="relative space-y-5">
                <TabGroup<NestedTab>
                  tabs={[
                    { id: "mfy", label: "MFY" },
                    { id: "schools", label: "Maktab" },
                  ]}
                  activeTab={activeTab}
                  onChange={handleChange}
                  variant="compact"
                />
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${activeTab}-${loading ? "loading" : "ready"}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 12 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    {activeTab === "mfy" ? (
                      <MfyList
                        data={data?.mfys ?? []}
                        loading={loading || tabTransitionLoading}
                        error={error}
                        emptyMessage={
                          district
                            ? "MFY ma’lumotlari topilmadi."
                            : "Tuman tanlanmagan."
                        }
                      />
                    ) : (
                      <SchoolList
                        data={data?.schools ?? []}
                        loading={loading || tabTransitionLoading}
                        error={error}
                        emptyMessage={
                          district
                            ? "Maktab ma’lumotlari topilmadi."
                            : "Tuman tanlanmagan."
                        }
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}

