"use server";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { eq } from "drizzle-orm";

import { db } from "@/db/client";
import { profiles, users } from "@/db/schema";
import type { UserRole } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { validateProfileUpdate } from "@/lib/profile/validation";

export type ProfileData = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  location: string | null;
  bio: string | null;
  role: UserRole;
  account_status: "active" | "disabled";
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

const allowedAvatarTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const maxAvatarSize = 2 * 1024 * 1024;

function mapProfileData(input: {
  user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;
  profile: typeof profiles.$inferSelect;
}): ProfileData {
  return {
    id: input.user.id,
    email: input.user.email,
    full_name: input.profile.fullName,
    avatar_url: input.profile.avatarUrl,
    phone: input.profile.phone,
    location: input.profile.location,
    bio: input.profile.bio,
    role: input.user.role,
    account_status: input.user.status,
    created_at: input.profile.createdAt,
    updated_at: input.profile.updatedAt,
  };
}

async function saveAvatarUpload(file: File, userId: string) {
  if (file.size === 0) {
    return null;
  }

  if (!allowedAvatarTypes.has(file.type)) {
    throw new Error("Upload a JPG, PNG, WebP, or GIF profile picture.");
  }

  if (file.size > maxAvatarSize) {
    throw new Error("Profile picture must be 2 MB or smaller.");
  }

  const extension = path.extname(file.name).toLowerCase() || ".jpg";
  const uploadDirectory = path.join(process.cwd(), "public", "uploads", "avatars", userId);
  const filename = `${crypto.randomUUID()}${extension}`;
  const destination = path.join(uploadDirectory, filename);

  await mkdir(uploadDirectory, { recursive: true });
  await writeFile(destination, Buffer.from(await file.arrayBuffer()));

  return `/uploads/avatars/${userId}/${filename}`;
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
  const avatarUrl = (formData.get("avatar_url") as string)?.trim() || null;
  const avatarFile = formData.get("avatar_file");
  const roleRaw = formData.get("role") as string;

  const validationError = validateProfileUpdate({
    fullName,
    phone,
    location,
    bio,
    avatarUrl,
  });

  if (validationError) {
    return { success: false, error: validationError };
  }

  const updatedAt = new Date().toISOString();
  let nextAvatarUrl = avatarUrl;

  try {
    if (avatarFile instanceof File && avatarFile.size > 0) {
      nextAvatarUrl = await saveAvatarUpload(avatarFile, user.id);
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Could not upload profile picture.",
    };
  }

  db.transaction((tx) => {
    tx.update(profiles)
      .set({
        fullName,
        phone,
        location,
        bio,
        avatarUrl: nextAvatarUrl,
        updatedAt,
      })
      .where(eq(profiles.userId, user.id))
      .run();

    if (user.role !== "admin") {
      const nextRole: Extract<UserRole, "renter" | "owner"> =
        roleRaw === "owner" ? "owner" : "renter";

      tx.update(users)
        .set({
          role: nextRole,
          updatedAt,
        })
        .where(eq(users.id, user.id))
        .run();
    }
  });

  return { success: true };
}
