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
] as const;

export const CAR_CATEGORIES = [
  "Sedan",
  "SUV",
  "Luxury",
  "Electric",
  "Van",
  "Sports",
] as const;

export const TRANSMISSION_OPTIONS = ["Manual", "Automatic"] as const;

export const FUEL_OPTIONS = ["Petrol", "Diesel", "Hybrid", "Electric"] as const;

export const SORT_OPTIONS = [
  "Recommended",
  "Price: Low to High",
  "Price: High to Low",
  "Newest",
  "Rating",
] as const;

export type AddisArea = (typeof ADDIS_AREAS)[number];
export type CarCategory = (typeof CAR_CATEGORIES)[number];
export type TransmissionOption = (typeof TRANSMISSION_OPTIONS)[number];
export type FuelOption = (typeof FUEL_OPTIONS)[number];
export type SortOption = (typeof SORT_OPTIONS)[number];

function isOneOf<T extends readonly string[]>(options: T, value: string): value is T[number] {
  return options.includes(value as T[number]);
}

export function isAddisArea(value: string): value is AddisArea {
  return isOneOf(ADDIS_AREAS, value);
}

export function isCarCategory(value: string): value is CarCategory {
  return isOneOf(CAR_CATEGORIES, value);
}

export function isTransmissionOption(value: string): value is TransmissionOption {
  return isOneOf(TRANSMISSION_OPTIONS, value);
}

export function isFuelOption(value: string): value is FuelOption {
  return isOneOf(FUEL_OPTIONS, value);
}

export function normalizeFuelOption(value: string | null | undefined) {
  const trimmed = value?.trim();

  if (!trimmed) {
    return null;
  }

  if (trimmed.toLowerCase() === "benzene" || trimmed.toLowerCase() === "gasoline") {
    return "Petrol";
  }

  return isFuelOption(trimmed) ? trimmed : null;
}
