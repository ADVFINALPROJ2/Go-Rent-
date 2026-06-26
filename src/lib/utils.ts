import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const ADDIS_AREAS = [
  "Bole",
  "Kazanchis",
  "Piassa",
  "Megenagna",
  "Mexico",
  "Sar Bet",
  "CMC",
  "Ayat",
  "Gerji",
  "Summit",
  "Lebu",
  "Kality",
  "Arat Kilo",
  "Lideta",
  "Jemo",
  "Gulele",
  "Merkato",
];

export function formatBirr(amount: number, suffix?: "day" | "ETB") {
  const formatted = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(Number.isFinite(amount) ? Math.round(amount) : 0);

  if (suffix === "day") {
    return `Br ${formatted}/day`;
  }

  if (suffix === "ETB") {
    return `Br ${formatted} ETB`;
  }

  return `Br ${formatted}`;
}
