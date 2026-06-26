"use client";

import type { SessionUser } from "@/lib/auth/session";

type RouterLike = {
  push: (href: string) => void;
};

type OwnerSession = {
  user: SessionUser;
};

function dashboardForRole(role: SessionUser["role"] | null | undefined) {
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
  const response = await fetch("/api/auth/me", {
    cache: "no-store",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Could not verify your session.");
  }

  const { user } = (await response.json()) as { user: SessionUser | null };

  if (!user) {
    router.push("/login");
    return null;
  }

  if (user.role !== "owner" || user.status !== "active") {
    router.push(dashboardForRole(user.role));
    return null;
  }

  return { user };
}
