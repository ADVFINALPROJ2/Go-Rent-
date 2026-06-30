"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db/client";
import { cars, users } from "@/db/schema";
import type { AccountStatus, CarStatus } from "@/db/schema";
import { requireUser } from "@/lib/auth/session";

async function requireAdmin() {
  const user = await requireUser();

  if (!user || user.role !== "admin") {
    throw new Error("Admin access is required.");
  }

  return user;
}

function revalidateAdminPages() {
  revalidatePath("/admin");
  revalidatePath("/admin/users");
  revalidatePath("/admin/listings");
  revalidatePath("/admin/listings/available");
  revalidatePath("/admin/listings/disabled");
}

export async function updateAdminUserStatus(userId: string, status: AccountStatus) {
  const admin = await requireAdmin();

  if (admin.id === userId && status === "disabled") {
    throw new Error("You cannot disable your own admin account.");
  }

  db.update(users)
    .set({ status, updatedAt: new Date().toISOString() })
    .where(eq(users.id, userId))
    .run();

  revalidateAdminPages();
  revalidatePath(`/admin/users/${userId}`);
}

export async function deleteAdminUser(userId: string) {
  const admin = await requireAdmin();

  if (admin.id === userId) {
    throw new Error("You cannot delete your own admin account.");
  }

  db.delete(users).where(eq(users.id, userId)).run();
  revalidateAdminPages();
}

export async function updateAdminListingStatus(listingId: string, status: CarStatus) {
  await requireAdmin();

  db.update(cars)
    .set({ status, updatedAt: new Date().toISOString() })
    .where(eq(cars.id, listingId))
    .run();

  revalidateAdminPages();
  revalidatePath(`/cars/${listingId}`);
}

export async function deleteAdminListing(listingId: string) {
  await requireAdmin();

  db.delete(cars).where(eq(cars.id, listingId)).run();
  revalidateAdminPages();
  revalidatePath(`/cars/${listingId}`);
}
