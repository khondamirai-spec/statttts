"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";

export type DatePickerHandle = {
  open: () => void;
  close: () => void;
};

type DatePickerProps = {
  value?: Date;
  onChange?: (date: Date) => void;
  disabledDate?: (date: Date) => boolean;
  align?: "left" | "right";
  label?: string;
};

const QUICK_ACTIONS = [
  { label: "Today", offset: 0 },
  { label: "In 3 Days", offset: 3 },
  { label: "Next Week", offset: 7 },
];

const weekdays = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function isSameDay(a?: Date, b?: Date) {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function buildCalendar(base: Date) {
  const firstDay = startOfMonth(base);
  const startOffset = (firstDay.getDay() + 6) % 7; // Monday-first
  const gridStart = addDays(firstDay, -startOffset);
  return Array.from({ length: 42 }, (_, index) => addDays(gridStart, index));
}

const DatePicker = forwardRef<DatePickerHandle, DatePickerProps>(
  ({ value, onChange, disabledDate, align = "left", label }, ref) => {
    const [open, setOpen] = useState(false);
    const [month, setMonth] = useState<Date>(() =>
      startOfMonth(value ?? new Date()),
    );
    const triggerRef = useRef<HTMLButtonElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const monthSyncRef = useRef<number>();

    useImperativeHandle(
      ref,
      () => ({
        open: () => setOpen(true),
        close: () => setOpen(false),
      }),
      [],
    );

    useEffect(() => {
      if (!value) return;
      monthSyncRef.current = requestAnimationFrame(() => {
        setMonth(startOfMonth(value));
      });
      return () => {
        if (monthSyncRef.current) {
          cancelAnimationFrame(monthSyncRef.current);
          monthSyncRef.current = undefined;
        }
      };
    }, [value]);

    const handleOutside = useCallback((event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }, []);

    useEffect(() => {
      if (!open) return;
      document.addEventListener("mousedown", handleOutside);
      const closeOnEscape = (event: KeyboardEvent) => {
        if (event.key === "Escape") setOpen(false);
      };
      const closeOnResize = () => setOpen(false);
      window.addEventListener("keydown", closeOnEscape);
      window.addEventListener("resize", closeOnResize);
      return () => {
        document.removeEventListener("mousedown", handleOutside);
        window.removeEventListener("keydown", closeOnEscape);
        window.removeEventListener("resize", closeOnResize);
      };
    }, [handleOutside, open]);

    const calendarDays = useMemo(() => buildCalendar(month), [month]);

    const selectDate = (date: Date) => {
      if (disabledDate?.(date)) return;
      onChange?.(date);
      setOpen(false);
    };

    const goToMonth = (offset: number) => {
      setMonth(
        (prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1),
      );
    };

    const quickPick = (offset: number) => {
      const target = addDays(new Date(), offset);
      selectDate(target);
      setMonth(startOfMonth(target));
    };

    return (
      <div className="relative inline-block">
        {label && (
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            {label}
          </span>
        )}
        <button
          ref={triggerRef}
          onClick={() => setOpen((prev) => !prev)}
          className="date-picker-trigger"
          aria-haspopup="dialog"
          aria-expanded={open}
          type="button"
        >
          {value
            ? value.toLocaleDateString("uz-UZ", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "Select date"}
        </button>

        {open && (
          <div
            ref={popoverRef}
            role="dialog"
            aria-label="Pick a date"
            className={cn(
              "date-picker-popover",
              align === "right" ? "right-0" : "left-0",
            )}
          >
            <div className="flex items-center justify-between">
              <button
                type="button"
                className="picker-nav"
                aria-label="Previous month"
                onClick={() => goToMonth(-1)}
              >
                ‹
              </button>
              <div className="text-sm font-semibold text-slate-700">
                {month.toLocaleDateString("uz-UZ", {
                  month: "long",
                  year: "numeric",
                })}
              </div>
              <button
                type="button"
                className="picker-nav"
                aria-label="Next month"
                onClick={() => goToMonth(1)}
              >
                ›
              </button>
            </div>
            <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">
              {weekdays.map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>
            <div className="mt-1 grid grid-cols-7 gap-1 text-center text-sm">
              {calendarDays.map((date) => {
                const disabled = disabledDate?.(date) ?? false;
                const isCurrentMonth =
                  date.getMonth() === month.getMonth() &&
                  date.getFullYear() === month.getFullYear();
                const isSelected = isSameDay(date, value);
                return (
                  <button
                    key={date.toISOString()}
                    type="button"
                    disabled={disabled}
                    onClick={() => selectDate(date)}
                    className={cn(
                      "picker-day",
                      !isCurrentMonth && "picker-day--muted",
                      isSelected && "picker-day--selected",
                      disabled && "picker-day--disabled",
                    )}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 flex flex-wrap gap-2 border-t border-white/50 pt-3">
              {QUICK_ACTIONS.map((action) => (
                <button
                  type="button"
                  key={action.label}
                  className="quick-action"
                  onClick={() => quickPick(action.offset)}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  },
);

DatePicker.displayName = "DatePicker";

export default DatePicker;

