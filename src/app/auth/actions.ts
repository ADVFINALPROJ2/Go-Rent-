"use server";

import { eq } from "drizzle-orm";

import { db } from "@/db/client";
import { profiles, users } from "@/db/schema";
import type { UserRole } from "@/db/schema";
import {
  clearSession,
  createSession,
  getRoleRedirect,
  hashPassword,
  verifyPassword,
} from "@/lib/auth/session";

type AuthResult = {
  success: boolean;
  error?: string;
  redirectTo?: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function registerLocalUser(input: {
  fullName: string;
  email: string;
  password: string;
  role: Extract<UserRole, "renter" | "owner">;
}): Promise<AuthResult> {
  const fullName = input.fullName.trim();
  const email = normalizeEmail(input.email);

  if (!fullName) {
    return { success: false, error: "Full name is required." };
  }

  if (!emailPattern.test(email)) {
    return { success: false, error: "Enter a valid email address." };
  }

  if (input.password.length < 8) {
    return { success: false, error: "Password must be at least 8 characters." };
  }

  const existingUser = db.query.users.findFirst({
    where: eq(users.email, email),
  }).sync();

  if (existingUser) {
    return { success: false, error: "An account with this email already exists." };
  }

  const userId = crypto.randomUUID();
  const profileId = crypto.randomUUID();
  const passwordHash = await hashPassword(input.password);

  db.transaction((tx) => {
    tx.insert(users).values({
      id: userId,
      email,
      passwordHash,
      role: input.role,
      status: "active",
    }).run();

    tx.insert(profiles).values({
      id: profileId,
      userId,
      fullName,
    }).run();
  });

  await createSession(userId);

  return {
    success: true,
    redirectTo: getRoleRedirect(input.role),
  };
}

export async function loginLocalUser(input: {
  email: string;
  password: string;
}): Promise<AuthResult> {
  const email = normalizeEmail(input.email);

  if (!emailPattern.test(email)) {
    return { success: false, error: "Enter a valid email address." };
  }

  const user = db.query.users.findFirst({
    where: eq(users.email, email),
  }).sync();

  if (!user) {
    return { success: false, error: "Invalid email or password." };
  }

  if (user.status !== "active") {
    return { success: false, error: "This account is disabled." };
  }

  const isValidPassword = await verifyPassword(input.password, user.passwordHash);

  if (!isValidPassword) {
    return { success: false, error: "Invalid email or password." };
  }

  await createSession(user.id);

  return {
    success: true,
    redirectTo: getRoleRedirect(user.role),
  };
}

export async function loginAdminUser(input: {
  email: string;
  password: string;
}): Promise<AuthResult> {
  const email = normalizeEmail(input.email);

  if (!emailPattern.test(email)) {
    return { success: false, error: "Enter a valid email address." };
  }

  const user = db.query.users.findFirst({
    where: eq(users.email, email),
  }).sync();

  if (!user) {
    return { success: false, error: "Invalid email or password." };
  }

  if (user.status !== "active") {
    return { success: false, error: "This account is disabled." };
  }

  const isValidPassword = await verifyPassword(input.password, user.passwordHash);

  if (!isValidPassword) {
    return { success: false, error: "Invalid email or password." };
  }

  if (user.role !== "admin") {
    return { success: false, error: "Admin access only." };
  }

  await createSession(user.id);

  return {
    success: true,
    redirectTo: "/admin",
  };
}

export async function logoutLocalUser(): Promise<AuthResult> {
  await clearSession();
  return { success: true, redirectTo: "/login" };
}
