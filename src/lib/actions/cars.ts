"use server";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { desc, eq } from "drizzle-orm";

import { db } from "@/db/client";
import { cars } from "@/db/schema";
import type { CarStatus } from "@/db/schema";
import { requireUser } from "@/lib/auth/session";
import {
  mapCarToLegacy,
  type LegacyCarInsert,
  type LegacyCarRow,
  type LegacyCarUpdate,
} from "@/lib/cars/mappers";

const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function assertOwner(user: Awaited<ReturnType<typeof requireUser>>) {
  if (!user) {
    throw new Error("You must be logged in.");
  }

  if (user.role !== "owner" && user.role !== "admin") {
    throw new Error("Only owners can manage car listings.");
  }

  return user;
}

function normalizeStatus(status: LegacyCarInsert["status"] | undefined): CarStatus {
  return status ?? "available";
}

function buildCarValues(data: LegacyCarInsert | LegacyCarUpdate) {
  return {
    title: String(data.title ?? "").trim(),
    make: String(data.make ?? "").trim(),
    model: String(data.model ?? "").trim(),
    year: Number(data.year),
    dailyRate: Number(data.daily_rate),
    location: String(data.location ?? "").trim(),
    description: data.description?.trim() || null,
    status: normalizeStatus(data.status),
    imageUrl: data.image_urls?.[0] ?? null,
    seats: typeof data.seats === "number" ? data.seats : null,
    transmission: data.transmission?.trim() || null,
    fuelType: data.fuel_type?.trim() || null,
    updatedAt: new Date().toISOString(),
  };
}

function validateCarValues(values: ReturnType<typeof buildCarValues>) {
  if (!values.title || values.title.length < 3) {
    throw new Error("Title must be at least 3 characters.");
  }

  if (!values.make) {
    throw new Error("Make is required.");
  }

  if (!values.model) {
    throw new Error("Model is required.");
  }

  if (!values.year || values.year < 1980) {
    throw new Error("Enter a valid vehicle year.");
  }

  if (!values.dailyRate || values.dailyRate <= 0) {
    throw new Error("Price per day must be greater than 0.");
  }

  if (!values.location) {
    throw new Error("Location is required.");
  }
}

export async function uploadCarImage(
  file: File,
  userId: string,
): Promise<string> {
  const user = assertOwner(await requireUser());

  if (user.role !== "admin" && user.id !== userId) {
    throw new Error("You can only upload images for your own listings.");
  }

  if (!allowedImageTypes.has(file.type)) {
    throw new Error("Upload a JPG, PNG, WebP, or GIF image.");
  }

  const extension = path.extname(file.name).toLowerCase() || ".jpg";
  const uploadDirectory = path.join(process.cwd(), "public", "uploads", user.id);
  const filename = `${crypto.randomUUID()}${extension}`;
  const destination = path.join(uploadDirectory, filename);

  await mkdir(uploadDirectory, { recursive: true });
  await writeFile(destination, Buffer.from(await file.arrayBuffer()));

  return `/uploads/${user.id}/${filename}`;
}

export async function createCar(data: LegacyCarInsert): Promise<LegacyCarRow> {
  const user = assertOwner(await requireUser());

  if (user.role !== "admin" && data.owner_id !== user.id) {
    throw new Error("You can only create listings for your own account.");
  }

  const values = buildCarValues(data);
  validateCarValues(values);

  const id = data.id ?? crypto.randomUUID();
  db.insert(cars)
    .values({
      id,
      ownerId: data.owner_id,
      ...values,
    })
    .run();

  const car = db.query.cars.findFirst({
    where: eq(cars.id, id),
  });

  if (!car) {
    throw new Error("Failed to create car.");
  }

  return mapCarToLegacy(car);
}

export async function updateCar(
  carId: string,
  data: LegacyCarUpdate,
): Promise<LegacyCarRow> {
  const user = assertOwner(await requireUser());
  const existing = db.query.cars.findFirst({
    where: eq(cars.id, carId),
  });

  if (!existing) {
    throw new Error("Car not found.");
  }

  if (user.role !== "admin" && existing.ownerId !== user.id) {
    throw new Error("You can only update your own listings.");
  }

  const values = buildCarValues(data);
  validateCarValues(values);

  db.update(cars).set(values).where(eq(cars.id, carId)).run();

  const updated = db.query.cars.findFirst({
    where: eq(cars.id, carId),
  });

  if (!updated) {
    throw new Error("Failed to update car.");
  }

  return mapCarToLegacy(updated);
}

export async function getOwnerCars(ownerId: string): Promise<LegacyCarRow[]> {
  const user = assertOwner(await requireUser());

  if (user.role !== "admin" && user.id !== ownerId) {
    throw new Error("You can only view your own listings.");
  }

  const rows = db.query.cars.findMany({
    where: eq(cars.ownerId, ownerId),
    orderBy: desc(cars.createdAt),
  });

  return rows.map(mapCarToLegacy);
}

export async function getCarById(carId: string): Promise<LegacyCarRow | null> {
  const car = db.query.cars.findFirst({
    where: eq(cars.id, carId),
  });

  return car ? mapCarToLegacy(car) : null;
}

export async function toggleCarStatus(
  carId: string,
  currentStatus: string,
): Promise<LegacyCarRow> {
  const newStatus = currentStatus === "available" ? "unavailable" : "available";
  const existing = await getCarById(carId);

  if (!existing) {
    throw new Error("Car not found.");
  }

  return updateCar(carId, {
    ...existing,
    status: newStatus,
  });
}
