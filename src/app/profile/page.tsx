"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Phone,
  Mail,
  Calendar,
  Pencil,
  Shield,
  LogIn,
  LayoutDashboard,
  UserRound,
} from "lucide-react";

import { ProfileAvatar } from "@/components/profile/profile-avatar";
import { PageHeading } from "@/components/page-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  formatAddisLocation,
  getDashboardPath,
} from "@/lib/profile/constants";
import type { UserRole } from "@/db/schema";
import { getProfile, type ProfileResult } from "./actions";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-ET", {
    month: "long",
    year: "numeric",
  });
}

function roleBadgeClass(role: UserRole) {
  if (role === "admin") {
    return "border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-900 dark:bg-violet-950 dark:text-violet-200";
  }

  if (role === "owner") {
    return "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200";
  }

  return "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-200";
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileResult["data"]>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getProfile().then((result) => {
      if (result.success && result.data) {
        setProfile(result.data);
      } else {
        setError(result.error ?? "Failed to load profile.");
        if (result.error === "NOT_AUTHENTICATED") {
          router.push("/login");
        }
      }
      setLoading(false);
    });
  }, [router]);

  if (loading) {
    return (
      <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <PageHeading
          eyebrow="Profile"
          title="Loading your GoRent profile…"
          description="Fetching your marketplace details in Addis Ababa."
        />
        <Card className="overflow-hidden">
          <div className="h-28 animate-pulse bg-gradient-to-r from-primary/20 via-accent to-primary/10" />
          <CardContent className="relative px-6 pb-8 pt-16">
            <div className="absolute -top-10 left-6 size-20 animate-pulse rounded-full bg-muted" />
            <div className="mt-4 space-y-3">
              <div className="h-5 w-48 animate-pulse rounded bg-muted" />
              <div className="h-4 w-32 animate-pulse rounded bg-muted" />
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-12 animate-pulse rounded-md bg-muted" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <PageHeading
          eyebrow="Profile"
          title="Sign in to view your profile."
          description={error ?? "Log in to manage your GoRent account across Addis Ababa."}
        />
        <Button asChild>
          <Link href="/login">
            <LogIn aria-hidden="true" />
            Go to Login
          </Link>
        </Button>
      </div>
    );
  }

  const dashboardPath = getDashboardPath(profile.role);
  const formattedLocation = formatAddisLocation(profile.location);
  const dashboardLabel =
    profile.role === "admin"
      ? "Admin Dashboard"
      : profile.role === "owner"
        ? "Owner Dashboard"
        : "Renter Dashboard";

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-sky-100 bg-[linear-gradient(135deg,#ffffff,#eef8ff)] p-5 shadow-xl shadow-sky-950/10 dark:border-zinc-800 dark:bg-[linear-gradient(135deg,#111113,#0f172a)] sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <PageHeading
            eyebrow="Profile"
            title="Your GoRent marketplace profile."
            description="Manage how renters and owners see you across Addis Ababa."
          />
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href={dashboardPath}>
                <LayoutDashboard aria-hidden="true" />
                {dashboardLabel}
              </Link>
            </Button>
            <Button asChild className="shrink-0">
              <Link href="/profile/edit">
                <Pencil aria-hidden="true" />
                Edit Profile
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <Card className="overflow-hidden border-sky-100 bg-card shadow-xl shadow-sky-950/10 dark:border-zinc-800">
        <div className="h-36 bg-[linear-gradient(120deg,#0369a1,#38bdf8_48%,#e0f2fe)] dark:bg-[linear-gradient(120deg,#082f49,#075985_52%,#18181b)]" />

        <CardContent className="relative px-4 pb-8 pt-20 sm:px-6">
          <ProfileAvatar
            name={profile.full_name}
            avatarUrl={profile.avatar_url}
            size="xl"
            className="absolute -top-16 left-4 sm:left-6"
          />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 pt-2 sm:pt-0">
              <h2 className="truncate text-3xl font-semibold text-foreground">
                {profile.full_name || "Unnamed user"}
              </h2>
              <p className="mt-1 truncate text-sm text-muted-foreground">{profile.email}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span
                className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${roleBadgeClass(profile.role)}`}
              >
                <Shield className="size-3" aria-hidden="true" />
                {profile.role}
              </span>
              <Badge
                variant={profile.account_status === "active" ? "success" : "destructive"}
                className="gap-1 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide"
              >
                <UserRound className="size-3" aria-hidden="true" />
                {profile.account_status}
              </Badge>
            </div>
          </div>

          {profile.bio ? (
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {profile.bio}
            </p>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              Add a short bio so other GoRent members know what kind of trips or listings you prefer.
            </p>
          )}

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="flex min-w-0 items-center gap-3 rounded-xl border bg-background px-4 py-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <Phone className="size-4" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="truncate text-sm font-medium">
                  {profile.phone || "Not provided"}
                </p>
              </div>
            </div>

            <div className="flex min-w-0 items-center gap-3 rounded-xl border bg-background px-4 py-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <MapPin className="size-4" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Addis Ababa area</p>
                <p className="truncate text-sm font-medium">
                  {formattedLocation || "Not provided"}
                </p>
              </div>
            </div>

            <div className="flex min-w-0 items-center gap-3 rounded-xl border bg-background px-4 py-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <Mail className="size-4" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="truncate text-sm font-medium">{profile.email}</p>
              </div>
            </div>

            <div className="flex min-w-0 items-center gap-3 rounded-xl border bg-background px-4 py-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <Calendar className="size-4" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Member since</p>
                <p className="truncate text-sm font-medium">
                  {formatDate(profile.created_at)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
