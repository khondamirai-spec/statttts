"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Award, Eye, UsersRound, X } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import type { RegionStat } from "@/hooks/useRegionStats";

type PanelTab = "districts" | "mfy" | "schools";
type NestedTab = "mfy" | "schools";

type MetricEntity = {
  name: string;
  users: number;
  views: number;
  certificates: number;
};

export type RegionAccent = "purple" | "orange" | "blue" | "green";

export type RegionDetailsRegion = RegionStat & {
  accent?: RegionAccent;
};

type RegionDetailsSidebarProps = {
  region: RegionDetailsRegion | null;
  isOpen: boolean;
  onClose: () => void;
};

const districtPlaceholders: MetricEntity[] = [
  { name: "Shovot tumani", users: 14155, views: 13776, certificates: 107 },
  { name: "Gurlan tumani", users: 13639, views: 18791, certificates: 71 },
  { name: "Urganch tumani", users: 10767, views: 13916, certificates: 123 },
  { name: "Hazorasp tumani", users: 12440, views: 15032, certificates: 99 },
  { name: "Xiva shahri", users: 16331, views: 21045, certificates: 188 },
];

const mfyOverview: MetricEntity[] = [
  { name: "Nurafshon MFY", users: 4220, views: 6185, certificates: 45 },
  { name: "Yangiobod MFY", users: 3870, views: 5112, certificates: 38 },
  { name: "Bog'ishamol MFY", users: 3511, views: 4899, certificates: 31 },
  { name: "Navbahor MFY", users: 3299, views: 4411, certificates: 28 },
];

const schoolOverview: MetricEntity[] = [
  { name: "62-maktab", users: 980, views: 2440, certificates: 28 },
  { name: "15-maktab", users: 1113, views: 3028, certificates: 35 },
  { name: "27-maktab", users: 874, views: 1985, certificates: 19 },
  { name: "1-ixtisoslashgan maktab", users: 1336, views: 3891, certificates: 44 },
];

const districtNestedDetails: Record<
  string,
  { mfys: MetricEntity[]; schools: MetricEntity[] }
> = {
  "Shovot tumani": {
    mfys: [
      { name: "Gulzor MFY", users: 1595, views: 2143, certificates: 16 },
      { name: "Darvozatau MFY", users: 1322, views: 1890, certificates: 11 },
      { name: "Ibn Sino MFY", users: 1186, views: 1674, certificates: 9 },
    ],
    schools: [
      { name: "4-maktab", users: 402, views: 930, certificates: 11 },
      { name: "18-maktab", users: 511, views: 1124, certificates: 14 },
    ],
  },
  "Gurlan tumani": {
    mfys: [
      { name: "Amudaryo MFY", users: 1484, views: 2331, certificates: 19 },
      { name: "Nukus MFY", users: 1359, views: 2007, certificates: 15 },
    ],
    schools: [
      { name: "7-maktab", users: 366, views: 877, certificates: 9 },
      { name: "22-maktab", users: 498, views: 1084, certificates: 13 },
      { name: "35-maktab", users: 431, views: 967, certificates: 10 },
    ],
  },
  "Urganch tumani": {
    mfys: [
      { name: "Mustaqillik MFY", users: 1204, views: 1766, certificates: 13 },
      { name: "Qorasuv MFY", users: 1090, views: 1595, certificates: 10 },
    ],
    schools: [
      { name: "9-maktab", users: 415, views: 1007, certificates: 12 },
      { name: "33-maktab", users: 386, views: 921, certificates: 8 },
    ],
  },
  "Hazorasp tumani": {
    mfys: [
      { name: "Do'stlik MFY", users: 1430, views: 2054, certificates: 18 },
      { name: "Temiryo'lchi MFY", users: 1182, views: 1569, certificates: 14 },
    ],
    schools: [
      { name: "12-maktab", users: 442, views: 1098, certificates: 13 },
      { name: "28-maktab", users: 523, views: 1266, certificates: 16 },
    ],
  },
  "Xiva shahri": {
    mfys: [
      { name: "Ichan-Qal'a MFY", users: 1755, views: 2898, certificates: 22 },
      { name: "Qiyot MFY", users: 1608, views: 2481, certificates: 19 },
    ],
    schools: [
      { name: "3-ixtisoslashgan maktab", users: 612, views: 1502, certificates: 21 },
      { name: "5-maktab", users: 701, views: 1680, certificates: 17 },
    ],
  },
};

const defaultNested = {
  mfys: [
    { name: "Yuksalish MFY", users: 980, views: 1440, certificates: 12 },
    { name: "Kamolot MFY", users: 845, views: 1315, certificates: 10 },
  ],
  schools: [
    { name: "10-maktab", users: 350, views: 780, certificates: 8 },
    { name: "44-maktab", users: 298, views: 655, certificates: 6 },
  ],
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

  useEffect(() => {
    if (!isOpen) {
      setSelectedDistrict(null);
      setActiveTab("districts");
      setContentLoading(false);
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
    if (activeTab !== "districts") {
      setSelectedDistrict(null);
    }
  }, [activeTab]);

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

  const handleTabChange = (tab: PanelTab) => {
    if (tab === activeTab) return;
    setContentLoading(true);
    setActiveTab(tab);
    if (loadingTimer.current) clearTimeout(loadingTimer.current);
    loadingTimer.current = setTimeout(() => setContentLoading(false), 420);
  };
  const contentGradient =
    (region && contentGradientMap[region.accent]) ?? contentGradientMap.purple;

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
                          data={districtPlaceholders}
                          loading={contentLoading}
                          onSelect={setSelectedDistrict}
                        />
                      )}
                      {activeTab === "mfy" && (
                        <MfyList data={mfyOverview} loading={contentLoading} />
                      )}
                      {activeTab === "schools" && (
                        <SchoolList data={schoolOverview} loading={contentLoading} />
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
            <div className="flex flex-wrap items-center gap-2">
              {stats.map((stat) => (
                <span
                  key={stat.id}
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.35em] text-white/70 shadow-[0_8px_20px_rgba(255,255,255,0.12)] transition-all duration-200 hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/20 hover:text-white"
                >
                  {stat.label}
                  <span className="text-base tracking-tight text-white transition-colors duration-200">
                    {formatNumber(stat.value)}
                  </span>
                </span>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          <p className="text-lg font-semibold tracking-tight">{title}</p>
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
        </>
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

function DistrictList({ data, loading, onSelect }: DistrictListProps) {
  return (
    <ListSection title="Tumanlar">
      {loading ? (
        <SkeletonList rows={3} />
      ) : (
        data.map((district, index) => (
          <DistrictCard
            key={district.name}
            district={district}
            delay={index * 0.05}
            onSelect={onSelect}
          />
        ))
      )}
    </ListSection>
  );
}

type DistrictCardProps = {
  district: MetricEntity;
  onSelect?: (district: MetricEntity) => void;
  delay?: number;
};

function DistrictCard({ district, onSelect, delay = 0 }: DistrictCardProps) {
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
      className="group relative w-full rounded-3xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a06bff]/40"
    >
      <span className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-r from-[#a06bff]/35 via-[#4cc7ff]/25 to-[#70e09a]/35 opacity-50 transition-opacity duration-300 group-hover:opacity-90" />
      <span className="pointer-events-none absolute inset-[1px] rounded-[30px] bg-white/85" />
      <div className="relative flex items-center justify-between gap-3 rounded-[28px] border border-white/70 px-4 py-3 shadow-[0_12px_30px_rgba(34,48,94,0.12)] transition-all duration-300 group-hover:shadow-[0_18px_40px_rgba(160,107,255,0.12),0_30px_70px_rgba(76,199,255,0.22)]">
        <div className="min-w-0">
          <p className="text-[9px] font-semibold uppercase tracking-[0.45em] text-slate-400">Tuman</p>
          <p className="mt-1 truncate text-sm font-semibold text-slate-900">{district.name}</p>
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
            className="absolute left-1/2 top-10 z-10 w-32 -translate-x-1/2 rounded-2xl bg-white/95 px-3 py-2 text-center text-[11px] font-semibold text-slate-700 shadow-[0_12px_30px_rgba(34,48,94,0.2)]"
          >
            <span className="block text-[9px] uppercase tracking-[0.35em] text-slate-400">
              {metric.label}
            </span>
            <span className="text-base font-bold text-slate-900">{formatNumber(metric.value)}</span>
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
};

function MfyList({ data, loading }: EntityListProps) {
  return (
    <ListSection title="MFYlar">
      {loading ? (
        <SkeletonList rows={3} />
      ) : (
        data.map((entity, index) => (
          <EntityCard key={entity.name} entity={entity} accent="pink" delay={index * 0.04} />
        ))
      )}
    </ListSection>
  );
}

function SchoolList({ data, loading }: EntityListProps) {
  return (
    <ListSection title="Maktablar">
      {loading ? (
        <SkeletonList rows={3} />
      ) : (
        data.map((entity, index) => (
          <EntityCard key={entity.name} entity={entity} accent="blue" delay={index * 0.04} />
        ))
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
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: "easeOut" }}
      className="group relative overflow-hidden rounded-[30px] border border-white/70 bg-white/85 px-5 py-4 text-slate-900 shadow-[0_10px_24px_rgba(80,41,198,0.08),0_25px_55px_rgba(76,199,255,0.12),0_40px_85px_rgba(112,224,154,0.18)] backdrop-blur-2xl transition-all duration-300 hover:shadow-[0_18px_40px_rgba(160,107,255,0.12),0_32px_70px_rgba(76,199,255,0.2),0_50px_100px_rgba(112,224,154,0.28)]"
    >
      <span
        className={`pointer-events-none absolute inset-0 rounded-[30px] bg-gradient-to-r ${
          accent === "pink"
            ? "from-[#ff7dea]/15 via-[#a06bff]/8 to-transparent"
            : "from-[#4cc7ff]/20 via-[#4c8dff]/10 to-transparent"
        }`}
      />
      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-base font-semibold leading-tight">{entity.name}</p>
          <p className="text-[10px] font-semibold uppercase tracking-[0.45em] text-slate-500">
            {accent === "pink" ? "MFY" : "Maktab"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-[11px]">
          <MetricBadge label="Users" value={entity.users} color="users" />
          <MetricBadge label="Views" value={entity.views} color="views" />
          <MetricBadge label="Certs" value={entity.certificates} color="certificates" />
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

type NestedPanelProps = {
  district: MetricEntity | null;
  onClose: () => void;
};

function NestedPanel({ district, onClose }: NestedPanelProps) {
  const [activeTab, setActiveTab] = useState<NestedTab>("mfy");
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!district) {
      setActiveTab("mfy");
      setLoading(false);
    }
  }, [district]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const nestedData = district
    ? districtNestedDetails[district.name] ?? defaultNested
    : defaultNested;

  const handleChange = (tab: NestedTab) => {
    if (tab === activeTab) return;
    setLoading(true);
    setActiveTab(tab);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setLoading(false), 320);
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
            <RegionHeader title={district.name} onClose={onClose} variant="nested" />
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
                      <MfyList data={nestedData.mfys} loading={loading} />
                    ) : (
                      <SchoolList data={nestedData.schools} loading={loading} />
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

