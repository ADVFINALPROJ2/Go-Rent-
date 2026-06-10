"use server";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { ProfileRole } from "@/lib/supabase/types";

export type ProfileData = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  location: string | null;
  bio: string | null;
  role: ProfileRole;
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

/**
 * Fetch the currently authenticated user's profile.
 * Combines auth.getUser() data (email) with the profiles table row.
 * If no profile row exists yet, creates one using the auth metadata.
 */
export async function getProfile(): Promise<ProfileResult> {
  const supabase = createSupabaseBrowserClient();

  if (!supabase) {
    return { success: false, error: "Supabase client not configured." };
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: "NOT_AUTHENTICATED",
    };
  }

  // Try to fetch existing profile
  const { data: existingProfile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  let profile = existingProfile;

  // If profile doesn't exist, create one from auth metadata
  if (profileError && profileError.code === "PGRST116") {
    const fullName =
      user.user_metadata?.full_name ??
      user.email?.split("@")[0] ??
      null;

    const { data: newProfile, error: insertError } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        full_name: fullName,
        avatar_url: user.user_metadata?.avatar_url ?? null,
        role: "renter" as ProfileRole,
      })
      .select("*")
      .single();

    if (insertError) {
      return { success: false, error: insertError.message };
    }

    profile = newProfile;
  } else if (profileError) {
    return { success: false, error: profileError.message };
  }

  if (!profile) {
    return { success: false, error: "Could not load profile." };
  }

  return {
    success: true,
    data: {
      ...profile,
      email: user.email ?? "",
    },
  };
}

/**
 * Update the authenticated user's profile fields.
 * Accepts FormData from the edit form.
 * Validates that full_name is provided.
 */
export async function updateProfile(
  formData: FormData,
): Promise<UpdateProfileResult> {
  const supabase = createSupabaseBrowserClient();

  if (!supabase) {
    return { success: false, error: "Supabase client not configured." };
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: "You must be logged in to update your profile.",
    };
  }

  const full_name = (formData.get("full_name") as string)?.trim() || null;
  const phone = (formData.get("phone") as string)?.trim() || null;
  const location = (formData.get("location") as string)?.trim() || null;
  const bio = (formData.get("bio") as string)?.trim() || null;
  const roleRaw = formData.get("role") as string;

  // --- Validation ---
  if (!full_name) {
    return { success: false, error: "Full name is required." };
  }

  // Validate role
  const validRoles: ProfileRole[] = ["renter", "owner"];
  const role: ProfileRole = validRoles.includes(roleRaw as ProfileRole)
    ? (roleRaw as ProfileRole)
    : "renter";

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ full_name, phone, location, bio, role })
    .eq("id", user.id);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  return { success: true };
}
