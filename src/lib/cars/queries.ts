import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/types";

export type CarRow = Database["public"]["Tables"]["cars"]["Row"];
export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

export type CarWithOwner = CarRow & {
  owner?: Pick<ProfileRow, "id" | "full_name" | "avatar_url" | "location"> | null;
};

export type BrowseCarFilters = {
  location?: string;
  minPrice?: number;
  maxPrice?: number;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function createPublicSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey);
}

export async function fetchAvailableCars(
  filters: BrowseCarFilters = {},
  client: SupabaseClient<Database> | null = createPublicSupabaseClient(),
): Promise<CarRow[]> {
  if (!client) {
    throw new Error(
      "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  let query = client
    .from("cars")
    .select("*")
    .eq("status", "available")
    .order("created_at", { ascending: false });

  const location = filters.location?.trim();
  if (location) {
    query = query.ilike("location", `%${location}%`);
  }

  if (typeof filters.minPrice === "number") {
    query = query.gte("daily_rate", filters.minPrice);
  }

  if (typeof filters.maxPrice === "number") {
    query = query.lte("daily_rate", filters.maxPrice);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch cars: ${error.message}`);
  }

  return data ?? [];
}

export async function fetchAvailableCarById(
  carId: string,
  client: SupabaseClient<Database> | null = createPublicSupabaseClient(),
): Promise<CarWithOwner | null> {
  if (!client) {
    throw new Error(
      "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  const { data: car, error } = await client
    .from("cars")
    .select("*")
    .eq("id", carId)
    .eq("status", "available")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch car details: ${error.message}`);
  }

  if (!car) {
    return null;
  }

  const { data: owner, error: ownerError } = await client
    .from("profiles")
    .select("id, full_name, avatar_url, location")
    .eq("id", car.owner_id)
    .maybeSingle();

  if (ownerError) {
    throw new Error(`Failed to fetch owner details: ${ownerError.message}`);
  }

  return {
    ...car,
    owner: owner ?? null,
  };
}
