"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import DateRangePicker from "@/components/shared/DateRangePicker";
import GlassPanel from "@/components/ui/GlassPanel";
import { getCourses, type CourseRow } from "@/lib/api";
import { formatDateISO, formatNumber } from "@/lib/utils";

type EnrichedCourse = CourseRow & {
  cover: string;
  teacher: string;
};

const COURSE_IMAGES: Record<string, string> = {
  "pr/reklama": "/images/PR-Reklama.png",
  "pr-reklama": "/images/PR-Reklama.png",
  "yandex market kursi": "/images/Yandex market kursi kursi.png",
  "yandex market kursi kursi": "/images/Yandex market kursi kursi.png",
  "boshlang'ich dizayn": "/images/Boshlang‘ich dizayn.png",
  "boshlang‘ich dizayn": "/images/Boshlang‘ich dizayn.png",
  "grafik dizayn kursi": "/images/Grafik dizayn kursi.png",
};

const TEACHER_MAP: Record<string, string> = {
  "Grafik dizayn kursi": "Sanjar Isomiddinov",
  "100% lik kodsiz AI agentlar qurish": "Lazizbek Nazarqulov",
  "PR/Reklama": "Malika Rasulova",
  "PR-Reklama": "Malika Rasulova",
  "Yandex market kursi": "Farhod Ruzmatov",
  "Yandex market kursi kursi": "Farhod Ruzmatov",
  "Karyera qurish kursi": "Abror Mashrabov",
  "Ustoz Pro kursi": "Bekzod Alimuhammedov",
};

function normalizeTitle(title: string) {
  return title
    .trim()
    .toLowerCase()
    .replace(/['’‘]/g, "’");
}

function getCourseCover(title: string) {
  const normalized = normalizeTitle(title);
  if (COURSE_IMAGES[normalized]) return COURSE_IMAGES[normalized];
  const safe = title.replace(/%/g, "%25");
  return `/images/${safe}.png`;
}

type DateRange = {
  start: Date;
  end: Date;
};

function initialRange(): DateRange {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 29);
  return { start, end };
}

function enrichCourse(course: CourseRow): EnrichedCourse {
  return {
    ...course,
    cover: getCourseCover(course.title),
    teacher:
      TEACHER_MAP[course.title] ??
      course.title.split(" ").slice(0, 2).join(" ") ??
      "Ustoz AI",
  };
}

export default function CourseCardsCarousel() {
  const [{ start, end }, setRange] = useState<DateRange>(() => initialRange());
  const [courses, setCourses] = useState<EnrichedCourse[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setRange(initialRange());
  }, []);

  useEffect(() => {
    const updateCardsPerView = () => {
      if (typeof window === "undefined") return;
      const width = window.innerWidth;
      if (width >= 1440) {
        setCardsPerView(4);
      } else if (width >= 1024) {
        setCardsPerView(3);
      } else if (width >= 640) {
        setCardsPerView(2);
      } else {
        setCardsPerView(1);
      }
    };
    updateCardsPerView();
    window.addEventListener("resize", updateCardsPerView);
    return () => window.removeEventListener("resize", updateCardsPerView);
  }, []);

  useEffect(() => {
    if (!start || !end) return;
    let active = true;
    const frame = requestAnimationFrame(() => setLoading(true));
    async function fetchCourses() {
      const data = await getCourses(formatDateISO(start), formatDateISO(end));
      if (!active) return;
      const normalized = (data ?? [])
        .map(enrichCourse)
        .sort((a, b) => b.users - a.users);
      setCourses(normalized);
      setActiveIndex(0);
      setLoading(false);
    }
    fetchCourses();
    return () => {
      active = false;
      cancelAnimationFrame(frame);
    };
  }, [start, end]);

  const visibleCourses = useMemo(() => {
    return courses.slice(activeIndex, activeIndex + cardsPerView);
  }, [courses, activeIndex, cardsPerView]);

  const canPrev = activeIndex > 0;
  const canNext = activeIndex + cardsPerView < courses.length;

  return (
    <GlassPanel className="course-carousel">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">
            Eng yaxshi kurslar
          </h3>
          <p className="text-sm text-slate-500">
            Tanlangan sanalar oralig’idagi faol kurslar
          </p>
        </div>
        <DateRangePicker
          startDate={start ?? undefined}
          endDate={end ?? undefined}
          onStartDateChange={(date) =>
            date && setRange(({ end }) => ({ start: date, end }))
          }
          onEndDateChange={(date) =>
            date && setRange(({ start }) => ({ start, end: date }))
          }
        />
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <button
          type="button"
          className="carousel-btn"
          onClick={() =>
            setActiveIndex((prev) => Math.max(prev - cardsPerView, 0))
          }
          disabled={!canPrev}
          aria-label="Previous courses"
        >
          ‹
        </button>
        <div className="relative w-full overflow-hidden">
          <div
            className="grid gap-4"
            style={{
              gridTemplateColumns: `repeat(${cardsPerView}, minmax(0, 1fr))`,
            }}
          >
            <AnimatePresence mode="popLayout">
              {loading ? (
                <div className="course-card empty">Yuklanmoqda...</div>
              ) : visibleCourses.length ? (
                visibleCourses.map((course) => (
                  <motion.article
                    layout
                    key={course.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="course-card"
                  >
                    <div className="course-card__cover">
                      <Image
                        src={course.cover}
                        alt={course.title}
                        fill
                        sizes="(max-width: 640px) 100vw, 20vw"
                        className="object-cover"
                        onError={(event) => {
                          (event.target as HTMLImageElement).src =
                            "/images/Grafik dizayn kursi.png";
                        }}
                      />
                      <span className="course-card__badge">
                        Top {courses.indexOf(course) + 1}
                      </span>
                    </div>
                    <div className="course-card__body">
                      <h4>{course.title}</h4>
                      <p>Ustoz: {course.teacher}</p>
                      <dl>
                        <div>
                          <dt>Foydalanuvchilar</dt>
                          <dd>{formatNumber(course.users)}</dd>
                        </div>
                        <div>
                          <dt>Ko’rishlar</dt>
                          <dd>{formatNumber(course.views)}</dd>
                        </div>
                        <div>
                          <dt>Sertifikatlar</dt>
                          <dd>{formatNumber(course.certificates)}</dd>
                        </div>
                        <div>
                          <dt>Portfoliolar</dt>
                          <dd>{formatNumber(course.portfolios)}</dd>
                        </div>
                      </dl>
                    </div>
                  </motion.article>
                ))
              ) : (
                <div className="course-card empty">
                  Kurslar topilmadi. Boshqa sanani tanlang.
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <button
          type="button"
          className="carousel-btn"
          onClick={() =>
            setActiveIndex((prev) =>
              Math.min(
                prev + cardsPerView,
                Math.max(courses.length - cardsPerView, 0),
              ),
            )
          }
          disabled={!canNext}
          aria-label="Next courses"
        >
          ›
        </button>
      </div>
      <div className="mt-4 flex justify-center gap-2">
        {Array.from({ length: Math.ceil(courses.length / cardsPerView) || 1 }).map(
          (_, index) => {
            const isActive = index === Math.floor(activeIndex / cardsPerView);
            return (
              <span
                key={index}
                className={`carousel-dot ${isActive ? "carousel-dot--active" : ""}`}
              />
            );
          },
        )}
      </div>
    </GlassPanel>
  );
}

