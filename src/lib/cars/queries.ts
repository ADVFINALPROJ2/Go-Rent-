"use server";

import { and, desc, eq, gte, inArray, lte, sql } from "drizzle-orm";

import { db } from "@/db/client";
import { cars, profiles, reviews, users } from "@/db/schema";
import {
  mapCarToLegacy,
  mapOwnerToLegacy,
  type LegacyCarRow,
  type LegacyCarWithOwner,
  type LegacyProfileRow,
} from "@/lib/cars/mappers";

export type CarRow = LegacyCarRow & {
  average_rating: number | null;
  review_count: number;
};
export type ProfileRow = LegacyProfileRow;
export type CarWithOwner = LegacyCarWithOwner;

export type BrowseCarFilters = {
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  category?: string;
  transmission?: string;
  fuelType?: string;
  minSeats?: number;
  search?: string;
};

export async function fetchAvailableCars(
  filters: BrowseCarFilters = {},
): Promise<CarRow[]> {
  const conditions = [eq(cars.status, "available")];
  const location = filters.location?.trim().toLowerCase();
  const search = filters.search?.trim().toLowerCase();

  if (location) {
    conditions.push(sql`lower(${cars.location}) = ${location}`);
  }

  if (filters.category) {
    conditions.push(eq(cars.category, filters.category));
  }

  if (filters.transmission) {
    conditions.push(eq(cars.transmission, filters.transmission));
  }

  if (filters.fuelType) {
    conditions.push(eq(cars.fuelType, filters.fuelType));
  }

  if (typeof filters.minSeats === "number") {
    conditions.push(gte(cars.seats, filters.minSeats));
  }

  if (search) {
    conditions.push(
      sql`(
        lower(${cars.make}) like ${`%${search}%`} or
        lower(${cars.model}) like ${`%${search}%`} or
        lower(${cars.title}) like ${`%${search}%`} or
        lower(coalesce(${cars.description}, '')) like ${`%${search}%`}
      )`,
    );
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
  }).sync();

  const carIds = rows.map((car) => car.id);
  const reviewRows = carIds.length
    ? db.query.reviews.findMany({
        where: inArray(reviews.carId, carIds),
      }).sync()
    : [];
  const ratingsByCar = new Map<string, { total: number; count: number }>();

  for (const review of reviewRows) {
    const current = ratingsByCar.get(review.carId) ?? { total: 0, count: 0 };
    ratingsByCar.set(review.carId, {
      total: current.total + review.rating,
      count: current.count + 1,
    });
  }

  return rows.map((row) => {
    const rating = ratingsByCar.get(row.id);

    return {
      ...mapCarToLegacy(row),
      average_rating: rating ? rating.total / rating.count : null,
      review_count: rating?.count ?? 0,
    };
  });
}

export async function fetchAvailableCarById(
  carId: string,
): Promise<CarWithOwner | null> {
  const car = db.query.cars.findFirst({
    where: and(eq(cars.id, carId), eq(cars.status, "available")),
  }).sync();

  if (!car) {
    return null;
  }

  const ownerUser = db.query.users.findFirst({
    where: eq(users.id, car.ownerId),
  }).sync();

  const ownerProfile = db.query.profiles.findFirst({
    where: eq(profiles.userId, car.ownerId),
  }).sync();

  return {
    ...mapCarToLegacy(car),
    owner: ownerUser ? mapOwnerToLegacy(ownerUser, ownerProfile) : null,
  };
}
