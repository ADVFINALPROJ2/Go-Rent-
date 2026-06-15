import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type CarInsert = Database["public"]["Tables"]["cars"]["Insert"];
type CarUpdate = Database["public"]["Tables"]["cars"]["Update"];
type CarRow = Database["public"]["Tables"]["cars"]["Row"];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getClient(): SupabaseClient<Database> {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) {
    throw new Error(
      "Supabase client could not be created. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }
  return supabase;
}

// ---------------------------------------------------------------------------
// Image upload
// ---------------------------------------------------------------------------

/**
 * Uploads a car image to the `car-images` storage bucket.
 * Files are stored under `{userId}/{uuid}-{filename}` to satisfy the RLS
 * policy that scopes writes to the owner's folder.
 *
 * @returns The public URL of the uploaded image.
 */
export async function uploadCarImage(
  file: File,
  userId: string,
): Promise<string> {
  const supabase = getClient();
  const fileExt = file.name.split(".").pop();
  const fileName = `${userId}/${crypto.randomUUID()}.${fileExt}`;

  const { error } = await supabase.storage
    .from("car-images")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(`Image upload failed: ${error.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("car-images").getPublicUrl(fileName);

  return publicUrl;
}

// ---------------------------------------------------------------------------
// CRUD
// ---------------------------------------------------------------------------

/** Insert a new car listing. */
export async function createCar(
  data: CarInsert,
): Promise<CarRow> {
  const supabase = getClient();

  const { data: car, error } = await supabase
    .from("cars")
    .insert(data)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create car: ${error.message}`);
  }

  return car;
}

/** Update an existing car listing. */
export async function updateCar(
  carId: string,
  data: CarUpdate,
): Promise<CarRow> {
  const supabase = getClient();

  const { data: car, error } = await supabase
    .from("cars")
    .update(data)
    .eq("id", carId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update car: ${error.message}`);
  }

  return car;
}

/** Fetch all cars belonging to a specific owner, newest first. */
export async function getOwnerCars(ownerId: string): Promise<CarRow[]> {
  const supabase = getClient();

  const { data, error } = await supabase
    .from("cars")
    .select("*")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch owner cars: ${error.message}`);
  }

  return data;
}

/** Fetch a single car by its ID. */
export async function getCarById(carId: string): Promise<CarRow | null> {
  const supabase = getClient();

  const { data, error } = await supabase
    .from("cars")
    .select("*")
    .eq("id", carId)
    .single();

  if (error) {
    // PGRST116 = "no rows returned" — not really an error for us.
    if (error.code === "PGRST116") return null;
    throw new Error(`Failed to fetch car: ${error.message}`);
  }

  return data;
}

/** Toggle a car's status between available and unavailable. */
export async function toggleCarStatus(
  carId: string,
  currentStatus: string,
): Promise<CarRow> {
  const newStatus = currentStatus === "available" ? "unavailable" : "available";
  return updateCar(carId, { status: newStatus as CarRow["status"] });
}
