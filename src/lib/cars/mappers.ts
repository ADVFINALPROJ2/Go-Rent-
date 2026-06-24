import type { Car, Profile, User } from "@/db/schema";
import type { Database } from "@/lib/local-types";

export type LegacyCarRow = Database["public"]["Tables"]["cars"]["Row"];
export type LegacyCarInsert = Database["public"]["Tables"]["cars"]["Insert"];
export type LegacyCarUpdate = Database["public"]["Tables"]["cars"]["Update"];
export type LegacyProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

export type LegacyCarWithOwner = LegacyCarRow & {
  owner?: Pick<LegacyProfileRow, "id" | "full_name" | "avatar_url" | "location"> | null;
};

export function mapCarToLegacy(row: Car): LegacyCarRow {
  return {
    id: row.id,
    owner_id: row.ownerId,
    title: row.title,
    description: row.description,
    make: row.make,
    model: row.model,
    year: row.year,
    location: row.location,
    daily_rate: row.dailyRate,
    status: row.status,
    image_urls: row.imageUrl ? [row.imageUrl] : [],
    seats: row.seats,
    transmission: row.transmission,
    fuel_type: row.fuelType,
    created_at: row.createdAt,
    updated_at: row.updatedAt,
  };
}

export function mapOwnerToLegacy(
  user: Pick<User, "id">,
  profile: Pick<Profile, "fullName" | "location"> | null | undefined,
): Pick<LegacyProfileRow, "id" | "full_name" | "avatar_url" | "location"> {
  return {
    id: user.id,
    full_name: profile?.fullName ?? null,
    avatar_url: null,
    location: profile?.location ?? null,
  };
}

