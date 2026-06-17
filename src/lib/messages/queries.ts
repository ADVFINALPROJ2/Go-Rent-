import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

type MessageRow = Database["public"]["Tables"]["messages"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

export type MessageWithProfiles = MessageRow & {
  sender_profile?: Pick<ProfileRow, "id" | "full_name" | "avatar_url"> | null;
  receiver_profile?: Pick<ProfileRow, "id" | "full_name" | "avatar_url"> | null;
};

export type ProfileSummary = Pick<ProfileRow, "id" | "full_name" | "avatar_url">;

function getSupabaseClient() {
  const supabase = createSupabaseBrowserClient();

  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  return supabase;
}

export async function fetchUserMessages(userId: string): Promise<MessageRow[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function fetchProfilesByIds(
  ids: string[],
): Promise<Record<string, ProfileSummary>> {
  const uniqueIds = Array.from(new Set(ids.filter(Boolean)));

  if (uniqueIds.length === 0) {
    return {};
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url")
    .in("id", uniqueIds);

  if (error) {
    throw new Error(error.message);
  }

  return Object.fromEntries(
    (data ?? []).map((profile) => [profile.id, profile]),
  ) as Record<string, ProfileSummary>;
}

export async function sendMessage(payload: {
  sender_id: string;
  receiver_id: string;
  body: string;
  booking_id?: string | null;
}) {
  const supabase = getSupabaseClient();

  const { error } = await supabase.from("messages").insert({
    sender_id: payload.sender_id,
    receiver_id: payload.receiver_id,
    booking_id: payload.booking_id ?? null,
    body: payload.body,
  });

  if (error) {
    throw new Error(error.message);
  }
}
