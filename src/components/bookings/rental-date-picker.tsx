"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { Popover } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface RentalDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  placeholder?: string;
  minDate?: string; // YYYY-MM-DD
  disabled?: boolean;
  id?: string;
}

function formatDisplayDate(dateStr: string) {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function RentalDatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  minDate,
  disabled = false,
  id,
}: RentalDatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (dateStr: string) => {
    onChange(dateStr);
    setOpen(false);
  };

  const displayValue = value ? formatDisplayDate(value) : "";

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      content={
        <Calendar
          selected={value}
          onSelect={handleSelect}
          minDate={minDate}
        />
      }
      contentClassName="p-0 border border-slate-200 shadow-lg rounded-md dark:border-zinc-800 bg-white dark:bg-zinc-950"
    >
      <button
        id={id}
        type="button"
        disabled={disabled}
        className={cn(
          "flex h-11 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-left cursor-pointer transition-colors hover:bg-slate-50/50 dark:hover:bg-zinc-900/50 border-slate-200 dark:border-zinc-800",
          !value && "text-muted-foreground",
          value && "text-slate-900 dark:text-zinc-100 font-medium"
        )}
      >
        <span>{displayValue || placeholder}</span>
        <CalendarIcon className="size-4 text-slate-400 dark:text-zinc-500 shrink-0" />
      </button>
    </Popover>
  );
}
