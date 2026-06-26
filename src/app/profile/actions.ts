"use server";

import { eq } from "drizzle-orm";

import { db } from "@/db/client";
import { profiles, users } from "@/db/schema";
import type { UserRole } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";

export type ProfileData = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  location: string | null;
  bio: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
};

export type ProfileResult = {
  success: boolean;
  data?: ProfileData | null;
  error?: string;
};

export type UpdateProfileResult = {
  success: boolean;
  error?: string;
};

function mapProfileData(input: {
  user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;
  profile: typeof profiles.$inferSelect;
}): ProfileData {
  return {
    id: input.user.id,
    email: input.user.email,
    full_name: input.profile.fullName,
    avatar_url: null,
    phone: input.profile.phone,
    location: input.profile.location,
    bio: input.profile.bio,
    role: input.user.role,
    created_at: input.profile.createdAt,
    updated_at: input.profile.updatedAt,
  };
}

export async function getProfile(): Promise<ProfileResult> {
  const user = await getCurrentUser();

  if (!user || user.status !== "active") {
    return {
      success: false,
      error: "NOT_AUTHENTICATED",
    };
  }

  let profile = db.query.profiles.findFirst({
    where: eq(profiles.userId, user.id),
  }).sync();

  if (!profile) {
    const profileId = crypto.randomUUID();
    const fallbackName = user.email.split("@")[0] ?? null;

    db.insert(profiles).values({
      id: profileId,
      userId: user.id,
      fullName: fallbackName,
    }).run();

    profile = db.query.profiles.findFirst({
      where: eq(profiles.userId, user.id),
    }).sync();
  }

  if (!profile) {
    return { success: false, error: "Could not load profile." };
  }

  return {
    success: true,
    data: mapProfileData({ user, profile }),
  };
}

export async function updateProfile(
  formData: FormData,
): Promise<UpdateProfileResult> {
  const user = await getCurrentUser();

  if (!user || user.status !== "active") {
    return {
      success: false,
      error: "You must be logged in to update your profile.",
    };
  }

  const fullName = (formData.get("full_name") as string)?.trim() || null;
  const phone = (formData.get("phone") as string)?.trim() || null;
  const location = (formData.get("location") as string)?.trim() || null;
  const bio = (formData.get("bio") as string)?.trim() || null;
  const roleRaw = formData.get("role") as string;

  if (!fullName) {
    return { success: false, error: "Full name is required." };
  }

  const role: Extract<UserRole, "renter" | "owner"> =
    roleRaw === "owner" ? "owner" : "renter";
  const updatedAt = new Date().toISOString();

  db.transaction((tx) => {
    tx.update(profiles)
      .set({
        fullName,
        phone,
        location,
        bio,
        updatedAt,
      })
      .where(eq(profiles.userId, user.id))
      .run();

    tx.update(users)
      .set({
        role,
        updatedAt,
      })
      .where(eq(users.id, user.id))
      .run();
  });

  return { success: true };
}
