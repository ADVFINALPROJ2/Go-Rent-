"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalendarProps {
  selected?: string; // YYYY-MM-DD
  onSelect?: (dateStr: string) => void;
  minDate?: string; // YYYY-MM-DD
  className?: string;
}

export function Calendar({
  selected,
  onSelect,
  minDate,
  className,
}: CalendarProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [currentMonth, setCurrentMonth] = React.useState(() => {
    if (selected) {
      const parts = selected.split("-");
      if (parts.length === 3) {
        return new Date(Number(parts[0]), Number(parts[1]) - 1, 1);
      }
    }
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const weekdayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const formatDateStr = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const days = [];
  for (let i = 0; i < firstDayIndex; i++) {
    days.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(new Date(year, month, d));
  }

  const handleDayClick = (date: Date) => {
    if (onSelect) {
      onSelect(formatDateStr(date));
    }
  };

  const isSelected = (date: Date) => {
    if (!selected) return false;
    return formatDateStr(date) === selected;
  };

  const isDisabled = (date: Date) => {
    if (minDate) {
      return formatDateStr(date) < minDate;
    }
    return false;
  };

  const isToday = (date: Date) => {
    return formatDateStr(date) === formatDateStr(today);
  };

  return (
    <div className={cn("w-full max-w-[280px] p-3 bg-white dark:bg-zinc-950", className)}>
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400 transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="size-4" />
        </button>
        <span className="text-sm font-semibold text-slate-800 dark:text-zinc-200">
          {monthNames[month]} {year}
        </span>
        <button
          type="button"
          onClick={handleNextMonth}
          className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400 transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-400 dark:text-zinc-500 mb-2">
        {weekdayNames.map((day) => (
          <div key={day} className="h-6 flex items-center justify-center">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {days.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="h-8" />;
          }

          const disabled = isDisabled(date);
          const selectedState = isSelected(date);
          const todayState = isToday(date);

          return (
            <button
              key={date.toISOString()}
              type="button"
              disabled={disabled}
              onClick={() => handleDayClick(date)}
              className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center text-xs transition-all relative font-medium",
                disabled && "text-slate-300 dark:text-zinc-700 cursor-not-allowed",
                !disabled && !selectedState && "text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800",
                selectedState && "bg-primary text-primary-foreground shadow-md shadow-sky-950/20",
                todayState && !selectedState && "border border-primary text-primary font-bold"
              )}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
