import type { UserRole } from "@/db/schema";

export const ADDIS_ABABA_AREAS = [
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
] as const;

export type AddisAbabaArea = (typeof ADDIS_ABABA_AREAS)[number];

export const BIO_MAX_LENGTH = 500;

export const ETHIOPIAN_PHONE_HELPER =
  "Format: +251 9XX XXX XXX or 09XX XXX XXX";

export function getDashboardPath(role: UserRole) {
  if (role === "admin") {
    return "/admin/dashboard";
  }

  if (role === "owner") {
    return "/owner/dashboard";
  }

  return "/renter/dashboard";
}

export function formatAddisLocation(area: string | null) {
  if (!area) {
    return null;
  }

  return `${area}, Addis Ababa`;
}

export function getProfileInitials(name: string | null) {
  if (!name) {
    return "?";
  }

  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
