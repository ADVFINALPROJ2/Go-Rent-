import "server-only";

import { compare, hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";

import { db } from "@/db/client";
import { users } from "@/db/schema";
import type { AccountStatus, UserRole } from "@/db/schema";

const sessionCookieName = "gorent_session";
const sessionMaxAgeSeconds = 60 * 60 * 24 * 7;
const sessionSecret = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "development-only-change-this-secret",
);

export type SessionUser = {
  id: string;
  email: string;
  role: UserRole;
  status: AccountStatus;
};

type SessionPayload = {
  userId: string;
};

export function getRoleRedirect(role: UserRole) {
  if (role === "admin") {
    return "/admin";
  }

  if (role === "owner") {
    return "/owner/dashboard";
  }

  return "/renter/dashboard";
}

export async function hashPassword(password: string) {
  return hash(password, 12);
}

export async function verifyPassword(password: string, passwordHash: string) {
  return compare(password, passwordHash);
}

export async function createSession(userId: string) {
  const token = await new SignJWT({ userId } satisfies SessionPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${sessionMaxAgeSeconds}s`)
    .sign(sessionSecret);

  const cookieStore = await cookies();
  cookieStore.set(sessionCookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: sessionMaxAgeSeconds,
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(sessionCookieName);
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName)?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, sessionSecret);
    const userId = typeof payload.userId === "string" ? payload.userId : null;

    if (!userId) {
      return null;
    }

    const user = db.query.users.findFirst({
      where: eq(users.id, userId),
    }).sync();

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
    };
  } catch {
    return null;
  }
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user || user.status !== "active") {
    return null;
  }

  return user;
}

export async function requireRole(role: UserRole) {
  const user = await requireUser();

  if (!user || user.role !== role) {
    return null;
  }

  return user;
}
