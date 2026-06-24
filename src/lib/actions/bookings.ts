"use server";

import { desc, eq, inArray } from "drizzle-orm";

import { db } from "@/db/client";
import { bookings, cars, profiles, users } from "@/db/schema";
import type { BookingStatus } from "@/db/schema";
import { requireUser } from "@/lib/auth/session";

const dayInMilliseconds = 1000 * 60 * 60 * 24;

export type RenterBookingSummary = {
  id: string;
  carId: string;
  renterId: string;
  ownerId: string;
  carTitle: string;
  startDate: string;
  endDate: string;
  status: BookingStatus;
  totalPrice: number;
  message: string | null;
};

export type OwnerBookingSummary = {
  id: string;
  ownerId: string;
  renterId: string;
  carId: string;
  carTitle: string;
  make: string;
  model: string;
  location: string;
  dailyRate: number;
  startDate: string;
  endDate: string;
  status: BookingStatus;
  totalPrice: number;
  message: string | null;
  renterName: string | null;
  renterEmail: string | null;
};

export type OwnerDashboardBookings = {
  bookings: OwnerBookingSummary[];
  activeCarCount: number;
};

export type BookingRequestInput = {
  carId: string;
  ownerId: string;
  startDate: string;
  endDate: string;
  message?: string;
};

function calculateTotalPrice(startDate: string, endDate: string, dailyRate: number) {
  const startTime = new Date(`${startDate}T00:00:00`).getTime();
  const endTime = new Date(`${endDate}T00:00:00`).getTime();
  const rentalDays = Math.floor((endTime - startTime) / dayInMilliseconds) + 1;

  return Math.max(rentalDays, 1) * Number(dailyRate);
}

function validateDates(startDate: string, endDate: string) {
  if (!startDate) {
    throw new Error("Start date is required.");
  }

  if (!endDate) {
    throw new Error("End date is required.");
  }

  if (new Date(endDate) < new Date(startDate)) {
    throw new Error("End date cannot be before the start date.");
  }
}

export async function createBookingRequest(input: BookingRequestInput) {
  const user = await requireUser();

  if (!user) {
    throw new Error("Please log in before requesting this rental.");
  }

  if (user.id === input.ownerId) {
    throw new Error("You cannot request a rental for your own car.");
  }

  validateDates(input.startDate, input.endDate);

  const car = db.query.cars.findFirst({
    where: eq(cars.id, input.carId),
  }).sync();

  if (!car || car.status !== "available") {
    throw new Error("This car is not available for booking.");
  }

  if (car.ownerId !== input.ownerId) {
    throw new Error("Booking owner does not match this listing.");
  }

  db.insert(bookings)
    .values({
      id: crypto.randomUUID(),
      carId: car.id,
      ownerId: car.ownerId,
      renterId: user.id,
      startDate: input.startDate,
      endDate: input.endDate,
      totalPrice: calculateTotalPrice(input.startDate, input.endDate, car.dailyRate),
      message: input.message?.trim() || null,
      status: "pending",
    })
    .run();
}

export async function getRenterBookings(): Promise<RenterBookingSummary[]> {
  const user = await requireUser();

  if (!user) {
    throw new Error("NOT_AUTHENTICATED");
  }

  const rows = db.query.bookings.findMany({
    where: eq(bookings.renterId, user.id),
    orderBy: desc(bookings.createdAt),
  }).sync();

  const carIds = [...new Set(rows.map((booking) => booking.carId))];
  const carRows = carIds.length
    ? db.query.cars.findMany({
        where: inArray(cars.id, carIds),
      }).sync()
    : [];
  const carMap = new Map(carRows.map((car) => [car.id, car]));

  return rows.map((booking) => ({
    id: booking.id,
    carId: booking.carId,
    ownerId: booking.ownerId,
    renterId: booking.renterId,
    carTitle: carMap.get(booking.carId)?.title ?? "Unknown vehicle",
    startDate: booking.startDate,
    endDate: booking.endDate,
    status: booking.status,
    totalPrice: booking.totalPrice,
    message: booking.message,
  }));
}

export async function cancelRenterBooking(bookingId: string) {
  const user = await requireUser();

  if (!user) {
    throw new Error("You must be logged in.");
  }

  const booking = db.query.bookings.findFirst({
    where: eq(bookings.id, bookingId),
  }).sync();

  if (!booking || booking.renterId !== user.id) {
    throw new Error("Booking not found.");
  }

  if (booking.status !== "pending") {
    throw new Error("Only pending bookings can be cancelled.");
  }

  db.update(bookings)
    .set({ status: "cancelled", updatedAt: new Date().toISOString() })
    .where(eq(bookings.id, bookingId))
    .run();
}

export async function getOwnerDashboardBookings(): Promise<OwnerDashboardBookings> {
  const user = await requireUser();

  if (!user) {
    throw new Error("NOT_AUTHENTICATED");
  }

  if (user.role !== "owner" && user.role !== "admin") {
    throw new Error("Only owners can view booking requests.");
  }

  const ownerBookings = db.query.bookings.findMany({
    where: eq(bookings.ownerId, user.id),
    orderBy: desc(bookings.createdAt),
  }).sync();
  const ownerCars = db.query.cars.findMany({
    where: eq(cars.ownerId, user.id),
  }).sync();
  const renterIds = [...new Set(ownerBookings.map((booking) => booking.renterId))];
  const renterProfiles = renterIds.length
    ? db.query.profiles.findMany({
        where: inArray(profiles.userId, renterIds),
      }).sync()
    : [];
  const renterUsers = renterIds.length
    ? db.query.users.findMany({
        where: inArray(users.id, renterIds),
      }).sync()
    : [];

  const carMap = new Map(ownerCars.map((car) => [car.id, car]));
  const profileMap = new Map(renterProfiles.map((profile) => [profile.userId, profile]));
  const userMap = new Map(renterUsers.map((renter) => [renter.id, renter]));

  return {
    activeCarCount: ownerCars.length,
    bookings: ownerBookings.map((booking) => {
      const car = carMap.get(booking.carId);
      const profile = profileMap.get(booking.renterId);
      const renter = userMap.get(booking.renterId);

      return {
        id: booking.id,
        ownerId: booking.ownerId,
        renterId: booking.renterId,
        carId: booking.carId,
        carTitle: car?.title ?? "Unknown vehicle",
        make: car?.make ?? "Unknown",
        model: car?.model ?? "Unknown",
        location: car?.location ?? "Location pending",
        dailyRate: car?.dailyRate ?? 0,
        startDate: booking.startDate,
        endDate: booking.endDate,
        status: booking.status,
        totalPrice: booking.totalPrice,
        message: booking.message,
        renterName: profile?.fullName ?? null,
        renterEmail: renter?.email ?? null,
      };
    }),
  };
}

export async function updateOwnerBookingStatus(
  bookingId: string,
  nextStatus: Extract<BookingStatus, "approved" | "declined" | "completed">,
) {
  const user = await requireUser();

  if (!user) {
    throw new Error("You must be logged in.");
  }

  if (user.role !== "owner" && user.role !== "admin") {
    throw new Error("Only owners can update booking requests.");
  }

  const booking = db.query.bookings.findFirst({
    where: eq(bookings.id, bookingId),
  }).sync();

  if (!booking || booking.ownerId !== user.id) {
    throw new Error("Booking not found.");
  }

  if (nextStatus === "completed") {
    if (booking.status !== "approved") {
      throw new Error("Only approved bookings can be marked as completed.");
    }
  } else if (booking.status !== "pending") {
    throw new Error("Only pending requests can be approved or declined.");
  }

  db.update(bookings)
    .set({ status: nextStatus, updatedAt: new Date().toISOString() })
    .where(eq(bookings.id, bookingId))
    .run();
}
