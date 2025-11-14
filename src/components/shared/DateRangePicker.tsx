"use client";

import { useRef } from "react";

type DateRangePickerProps = {
  startDate?: Date;
  endDate?: Date;
  min?: Date;
  max?: Date;
  onStartDateChange?: (value?: Date) => void;
  onEndDateChange?: (value?: Date) => void;
  className?: string;
};

type DateInputElement = HTMLInputElement & {
  showPicker?: () => void;
};

function formatInput(date?: Date) {
  if (!date) return "";
  return date.toISOString().split("T")[0];
}

function clampToBounds(raw: Date, min?: Date, max?: Date) {
  let date = raw;
  if (min && raw < min) date = min;
  if (max && raw > max) date = max;
  return date;
}

export default function DateRangePicker({
  startDate,
  endDate,
  min,
  max,
  onStartDateChange,
  onEndDateChange,
  className,
}: DateRangePickerProps) {
  const startInputRef = useRef<DateInputElement>(null);
  const endInputRef = useRef<DateInputElement>(null);

  const openNativePicker = (input: DateInputElement | null) => {
    if (!input) return;
    if (input.showPicker) {
      input.showPicker();
      return;
    }
    input.focus();
    input.click();
  };

  const handleStartChange = (value: string) => {
    const date = value ? clampToBounds(new Date(value), min, max) : undefined;
    onStartDateChange?.(date);
  };

  const handleEndChange = (value: string) => {
    const date = value ? clampToBounds(new Date(value), min, max) : undefined;
    onEndDateChange?.(date);
  };

  return (
    <div className={className}>
      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Sana oralig’i
      </label>
      <div className="mt-1 flex items-center gap-2">
        <button
          type="button"
          onClick={() => openNativePicker(startInputRef.current)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
          aria-label="Boshlanish sanasini tanlash"
        >
          <CalendarIcon className="h-5 w-5" />
        </button>
        <input
          type="date"
          value={formatInput(startDate)}
          max={formatInput(endDate ?? max)}
          min={formatInput(min)}
          onChange={(event) => handleStartChange(event.target.value)}
          className="date-input"
          ref={startInputRef}
          aria-label="Start date"
        />
        <span className="text-sm font-medium text-slate-500">—</span>
        <input
          type="date"
          value={formatInput(endDate)}
          min={formatInput(startDate ?? min)}
          max={formatInput(max)}
          onChange={(event) => handleEndChange(event.target.value)}
          className="date-input"
          ref={endInputRef}
          aria-label="End date"
        />
        <button
          type="button"
          onClick={() => openNativePicker(endInputRef.current)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
          aria-label="Tugash sanasini tanlash"
        >
          <CalendarIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M7.5 2a.75.75 0 0 0-.75.75V4H5.25A2.25 2.25 0 0 0 3 6.25v12.5A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V6.25A2.25 2.25 0 0 0 18.75 4H17.25V2.75a.75.75 0 0 0-1.5 0V4h-7.5V2.75A.75.75 0 0 0 7.5 2ZM4.5 8.5h15v10.25c0 .414-.336.75-.75.75H5.25a.75.75 0 0 1-.75-.75V8.5Zm4 3a.75.75 0 0 0 0 1.5h2a.75.75 0 0 0 0-1.5h-2Zm5 0a.75.75 0 0 0 0 1.5h2a.75.75 0 0 0 0-1.5h-2Zm-5 3a.75.75 0 0 0 0 1.5H11a.75.75 0 0 0 0-1.5H8.5Zm5 0a.75.75 0 0 0 0 1.5h2a.75.75 0 0 0 0-1.5h-2Z" />
    </svg>
  );
}

