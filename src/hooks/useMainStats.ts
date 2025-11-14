"use client";

import { useEffect, useState } from "react";
import { getMainStats, type MainStatsResponse } from "@/lib/api";

export type MainStats = {
  users: number;
  lessons: number;
  certificates: number;
  courseViews: number;
};

const fallback: MainStats = {
  users: 3500,
  lessons: 20000,
  certificates: 156,
  courseViews: 0,
};

function normalize(payload?: MainStatsResponse | null): MainStats {
  if (!payload) return fallback;
  const courseViews =
    payload.courseViews ?? payload.course_views ?? payload.views ?? 0;
  return {
    users: Number(payload.users) || fallback.users,
    lessons: Number(payload.lessons) || fallback.lessons,
    certificates: Number(payload.certificates) || fallback.certificates,
    courseViews: Number(courseViews) || fallback.courseViews,
  };
}

export function useMainStats() {
  const [data, setData] = useState<MainStats>(fallback);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const frame = requestAnimationFrame(() => {
      if (isMounted) setLoading(true);
    });
    getMainStats()
      .then((response) => {
        if (!isMounted) return;
        setData(normalize(response));
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
      cancelAnimationFrame(frame);
    };
  }, []);

  return { data, loading };
}

