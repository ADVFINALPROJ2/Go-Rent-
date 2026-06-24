import { and, desc, eq, gte, lte, sql } from "drizzle-orm";

import { db } from "@/db/client";
import { cars, profiles, users } from "@/db/schema";
import {
  mapCarToLegacy,
  mapOwnerToLegacy,
  type LegacyCarRow,
  type LegacyCarWithOwner,
  type LegacyProfileRow,
} from "@/lib/cars/mappers";

export type CarRow = LegacyCarRow;
export type ProfileRow = LegacyProfileRow;
export type CarWithOwner = LegacyCarWithOwner;

export type BrowseCarFilters = {
  location?: string;
  minPrice?: number;
  maxPrice?: number;
};

export async function fetchAvailableCars(
  filters: BrowseCarFilters = {},
): Promise<CarRow[]> {
  const conditions = [eq(cars.status, "available")];
  const location = filters.location?.trim().toLowerCase();

  if (location) {
    conditions.push(sql`lower(${cars.location}) like ${`%${location}%`}`);
  }

  if (typeof filters.minPrice === "number") {
    conditions.push(gte(cars.dailyRate, filters.minPrice));
  }

  if (typeof filters.maxPrice === "number") {
    conditions.push(lte(cars.dailyRate, filters.maxPrice));
  }

  const rows = db.query.cars.findMany({
    where: and(...conditions),
    orderBy: desc(cars.createdAt),
  });

  return rows.map(mapCarToLegacy);
}

export async function fetchAvailableCarById(
  carId: string,
): Promise<CarWithOwner | null> {
  const car = db.query.cars.findFirst({
    where: and(eq(cars.id, carId), eq(cars.status, "available")),
  });

  if (!car) {
    return null;
  }

  const ownerUser = db.query.users.findFirst({
    where: eq(users.id, car.ownerId),
  });

  const ownerProfile = db.query.profiles.findFirst({
    where: eq(profiles.userId, car.ownerId),
  });

  return {
    ...mapCarToLegacy(car),
    owner: ownerUser ? mapOwnerToLegacy(ownerUser, ownerProfile) : null,
  };
}
