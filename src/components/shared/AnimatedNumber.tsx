"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { formatNumber } from "@/lib/utils";

type AnimatedNumberProps = {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
};

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export default function AnimatedNumber({
  value,
  duration = 800,
  decimals = 0,
  prefix = "",
  suffix = "",
  className,
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const frame = useRef<number | null>(null);
  const start = useRef<number | null>(null);
  const initialValue = useRef(value);
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    const startValue = initialValue.current;
    const diff = value - startValue;

    function cleanup() {
      if (frame.current !== null) {
        cancelAnimationFrame(frame.current);
        frame.current = null;
      }
    }

    if (prefersReducedMotion) {
      frame.current = requestAnimationFrame(() => {
        setDisplayValue(value);
        initialValue.current = value;
      });
      return cleanup;
    }

    function step(timestamp: number) {
      if (start.current === null) start.current = timestamp;
      const progress = Math.min((timestamp - start.current) / duration, 1);
      const eased = easeOutCubic(progress);
      setDisplayValue(startValue + diff * eased);
      if (progress < 1) {
        frame.current = requestAnimationFrame(step);
      } else {
        initialValue.current = value;
        start.current = null;
        cleanup();
      }
    }

    frame.current = requestAnimationFrame(step);

    return cleanup;
  }, [value, duration, prefersReducedMotion]);

  const formatted = useMemo(() => {
    const number = formatNumber(displayValue, { decimals });
    return `${prefix}${number}${suffix}`;
  }, [displayValue, decimals, prefix, suffix]);

  return <span className={className}>{formatted}</span>;
}

