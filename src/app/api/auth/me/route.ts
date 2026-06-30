import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/db/client";
import { profiles } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ user: null });
  }

  const profile = db.query.profiles.findFirst({
    where: eq(profiles.userId, user.id),
  }).sync();

  return NextResponse.json({
    user: {
      ...user,
      fullName: profile?.fullName ?? null,
      avatarUrl: profile?.avatarUrl ?? null,
    },
  });
}
