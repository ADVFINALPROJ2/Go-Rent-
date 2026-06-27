import "server-only";

import { desc, eq } from "drizzle-orm";

import { db } from "@/db/client";
import {
  bookings as bookingsTable,
  cars as carsTable,
  profiles,
  users as usersTable,
} from "@/db/schema";
import type { AccountStatus, BookingStatus, CarStatus, UserRole } from "@/db/schema";

export type AdminUserRecord = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: UserRole;
  account_status: AccountStatus;
  created_at: string;
};

export type AdminListingRecord = {
  id: string;
  owner_id: string;
  title: string;
  make: string;
  model: string;
  location: string;
  daily_rate: number;
  status: CarStatus;
  created_at: string;
  ownerName: string;
};

export type AdminBookingRecord = {
  id: string;
  carTitle: string;
  renterName: string;
  ownerName: string;
  startDate: string;
  endDate: string;
  status: BookingStatus;
  totalPrice: number;
  createdAt: string;
};

export function getAdminDashboardData() {
  const [userRows, profileRows, carRows, bookingRows] = [
    db.query.users.findMany({ orderBy: desc(usersTable.createdAt) }).sync(),
    db.query.profiles.findMany().sync(),
    db.query.cars.findMany({ orderBy: desc(carsTable.createdAt) }).sync(),
    db.query.bookings.findMany({ orderBy: desc(bookingsTable.createdAt) }).sync(),
  ];

  const profileMap = new Map(profileRows.map((profile) => [profile.userId, profile]));
  const users: AdminUserRecord[] = userRows.map((user) => {
    const profile = profileMap.get(user.id);

    return {
      id: user.id,
      full_name: profile?.fullName ?? null,
      email: user.email,
      role: user.role,
      account_status: user.status,
      created_at: user.createdAt,
    };
  });

  const ownerNameMap = new Map(
    profileRows.map((profile) => [profile.userId, profile.fullName || "Unnamed owner"]),
  );
  const renterNameMap = new Map(
    profileRows.map((profile) => [profile.userId, profile.fullName || "Unnamed renter"]),
  );
  const carMap = new Map(carRows.map((car) => [car.id, car]));

  const listings: AdminListingRecord[] = carRows.map((car) => ({
    id: car.id,
    owner_id: car.ownerId,
    title: car.title,
    make: car.make,
    model: car.model,
    location: car.location,
    daily_rate: car.dailyRate,
    status: car.status,
    created_at: car.createdAt,
    ownerName: ownerNameMap.get(car.ownerId) ?? "Unknown owner",
  }));

  const bookings: AdminBookingRecord[] = bookingRows.map((booking) => {
    const car = carMap.get(booking.carId);

    return {
      id: booking.id,
      carTitle: car ? `${car.make} ${car.model}` : "Unknown car",
      renterName: renterNameMap.get(booking.renterId) ?? "Unknown renter",
      ownerName: ownerNameMap.get(booking.ownerId) ?? "Unknown owner",
      startDate: booking.startDate,
      endDate: booking.endDate,
      status: booking.status,
      totalPrice: booking.totalPrice,
      createdAt: booking.createdAt,
    };
  });

  return { users, listings, bookings };
}

export function getAdminUserById(id: string) {
  const user = db.query.users.findFirst({
    where: eq(usersTable.id, id),
  }).sync();

  if (!user) {
    return null;
  }

  const profile = db.query.profiles.findFirst({
    where: eq(profiles.userId, user.id),
  }).sync();

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    account_status: user.status,
    created_at: user.createdAt,
    updated_at: user.updatedAt,
    full_name: profile?.fullName ?? null,
    phone: profile?.phone ?? null,
    location: profile?.location ?? null,
    bio: profile?.bio ?? null,
  };
}
