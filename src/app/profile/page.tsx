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
} from "lucide-react";

import { PageHeading } from "@/components/page-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getProfile, type ProfileResult } from "./actions";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function getInitials(name: string | null) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
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

  /* ---- Loading skeleton ---- */
  if (loading) {
    return (
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
        <PageHeading
          eyebrow="Profile"
          title="Loading your profile…"
          description="Hang tight while we fetch your details."
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

  /* ---- Not authenticated ---- */
  if (error || !profile) {
    return (
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
        <PageHeading
          eyebrow="Profile"
          title="Sign in to view your profile."
          description={error ?? "You need to be logged in to access your profile page."}
        />
        <div>
          <Button asChild>
            <Link href="/login">
              <LogIn aria-hidden="true" />
              Go to Login
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const roleBadgeColor =
    profile.role === "owner"
      ? "bg-amber-100 text-amber-800 border-amber-200"
      : "bg-sky-100 text-sky-800 border-sky-200";

  /* ---- Profile display ---- */
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <PageHeading
          eyebrow="Profile"
          title="Your account at a glance."
          description="View and manage your personal information, role, and contact details."
        />
        <Button asChild className="shrink-0 self-start sm:self-auto">
          <Link href="/profile/edit">
            <Pencil aria-hidden="true" />
            Edit Profile
          </Link>
        </Button>
      </div>

      <Card className="overflow-hidden">
        {/* Gradient banner */}
        <div className="h-28 bg-gradient-to-r from-primary/80 via-[#0ea5a0] to-accent" />

        <CardContent className="relative px-6 pb-8 pt-16">
          {/* Avatar */}
          {profile.avatar_url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={profile.avatar_url}
              alt={profile.full_name ?? "Avatar"}
              className="absolute -top-10 left-6 size-20 rounded-full border-4 border-card bg-card object-cover shadow-md"
            />
          ) : (
            <div className="absolute -top-10 left-6 flex size-20 items-center justify-center rounded-full border-4 border-card bg-gradient-to-br from-primary to-[#0ea5a0] text-xl font-bold text-primary-foreground shadow-md">
              {getInitials(profile.full_name)}
            </div>
          )}

          {/* Name + role badge */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">
                {profile.full_name || "Unnamed User"}
              </h2>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
            </div>
            <span
              className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${roleBadgeColor}`}
            >
              <Shield className="size-3" aria-hidden="true" />
              {profile.role}
            </span>
          </div>

          {/* Bio */}
          {profile.bio ? (
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {profile.bio}
            </p>
          ) : null}

          {/* Info grid */}
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-3 rounded-lg border bg-background px-4 py-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
                <Phone className="size-4" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="truncate text-sm font-medium">
                  {profile.phone || "Not provided"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border bg-background px-4 py-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
                <MapPin className="size-4" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Location</p>
                <p className="truncate text-sm font-medium">
                  {profile.location || "Not provided"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border bg-background px-4 py-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
                <Mail className="size-4" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="truncate text-sm font-medium">{profile.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border bg-background px-4 py-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
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
