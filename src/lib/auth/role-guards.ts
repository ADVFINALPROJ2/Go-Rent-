"use client";

import type { User } from "@supabase/supabase-js";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { ProfileRole } from "@/lib/supabase/types";

type RouterLike = {
  push: (href: string) => void;
};

type SupabaseBrowserClient = NonNullable<
  ReturnType<typeof createSupabaseBrowserClient>
>;

type OwnerSession = {
  supabase: SupabaseBrowserClient;
  user: User;
};

function dashboardForRole(role: ProfileRole | null | undefined) {
  if (role === "admin") {
    return "/admin/dashboard";
  }

  if (role === "owner") {
    return "/owner/dashboard";
  }

  return "/renter/dashboard";
}

export async function requireOwnerSession(
  router: RouterLike,
): Promise<OwnerSession | null> {
  const supabase = createSupabaseBrowserClient();

  if (!supabase) {
    throw new Error(
      "Supabase client is not configured. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, account_status")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    throw new Error(profileError.message);
  }

  if (profile?.role !== "owner" || profile.account_status !== "active") {
    router.push(dashboardForRole(profile?.role));
    return null;
  }

  return { supabase, user };
}
