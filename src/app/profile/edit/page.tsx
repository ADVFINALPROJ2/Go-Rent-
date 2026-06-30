"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ImageUp, Loader2, LogIn, Save, UserRound } from "lucide-react";

import { ProfileAvatar } from "@/components/profile/profile-avatar";
import { PageHeading } from "@/components/page-heading";
import { AlertBanner } from "@/components/ui/alert-banner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  ADDIS_ABABA_AREAS,
  BIO_MAX_LENGTH,
  ETHIOPIAN_PHONE_HELPER,
} from "@/lib/profile/constants";
import { getProfile, updateProfile } from "../actions";

export default function EditProfilePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarFilePreview, setAvatarFilePreview] = useState<string | null>(null);
  const [role, setRole] = useState<"renter" | "owner" | "admin">("renter");

  const previewAvatarUrl = useMemo(
    () => avatarFilePreview || avatarUrl.trim() || null,
    [avatarFilePreview, avatarUrl],
  );

  useEffect(() => {
    return () => {
      if (avatarFilePreview) {
        URL.revokeObjectURL(avatarFilePreview);
      }
    };
  }, [avatarFilePreview]);

  useEffect(() => {
    getProfile().then((result) => {
      if (result.success && result.data) {
        setFullName(result.data.full_name ?? "");
        setPhone(result.data.phone ?? "");
        setLocation(result.data.location ?? "");
        setBio(result.data.bio ?? "");
        setAvatarUrl(result.data.avatar_url ?? "");
        setRole(result.data.role);
      } else {
        const errorMessage = result.error ?? "Could not load profile.";
        setLoadError(errorMessage);
        setMessage({
          type: "error",
          text: errorMessage,
        });
        if (result.error === "NOT_AUTHENTICATED") {
          router.replace("/login");
        }
      }
      setLoading(false);
    });
  }, [router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const result = await updateProfile(formData);

    if (result.success) {
      setMessage({ type: "success", text: "Profile updated successfully." });
      setTimeout(() => router.push("/profile"), 1200);
    } else {
      setMessage({
        type: "error",
        text: result.error ?? "Failed to update profile.",
      });
    }

    setSaving(false);
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) {
      setAvatarFilePreview(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: "Choose an image file for your profile picture." });
      e.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: "error", text: "Profile picture must be 2 MB or smaller." });
      e.target.value = "";
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setAvatarFilePreview((current) => {
      if (current) {
        URL.revokeObjectURL(current);
      }
      return objectUrl;
    });
    setMessage(null);
  }

  if (loading) {
    return (
      <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <PageHeading
          eyebrow="Edit Profile"
          title="Loading your details…"
          description="One moment while we prepare your Addis Ababa profile."
        />
        <Card>
          <CardHeader>
            <div className="flex size-12 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <UserRound className="size-6" aria-hidden="true" />
            </div>
            <CardTitle>Profile details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                <div className="h-10 animate-pulse rounded-md bg-muted" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loadError) {
    const needsLogin = loadError === "NOT_AUTHENTICATED";

    return (
      <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <PageHeading
          eyebrow="Edit Profile"
          title={needsLogin ? "Sign in to edit your profile." : "Unable to load profile."}
          description={
            needsLogin
              ? "You need to be logged in before changing profile details."
              : loadError
          }
        />
        <Card>
          <CardContent className="flex flex-col gap-4 p-6 sm:flex-row">
            <Button asChild>
              <Link href="/login">
                <LogIn aria-hidden="true" />
                Go to Login
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/profile">
                <ArrowLeft aria-hidden="true" />
                Back to Profile
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-sky-100 bg-[linear-gradient(135deg,#ffffff,#eef8ff)] p-5 shadow-xl shadow-sky-950/10 dark:border-zinc-800 dark:bg-[linear-gradient(135deg,#111113,#0f172a)] sm:p-7">
        <PageHeading
          eyebrow="Edit Profile"
          title="Update your GoRent profile."
          description="Keep your contact details and Addis Ababa area current for smoother car sharing."
        />
      </div>

      <Card className="border-sky-100 bg-card shadow-xl shadow-sky-950/10 dark:border-zinc-800">
        <CardHeader>
          <div className="flex size-12 items-center justify-center rounded-xl bg-sky-50 text-primary dark:bg-sky-950">
            <UserRound className="size-6" aria-hidden="true" />
          </div>
          <CardTitle>Profile details</CardTitle>
        </CardHeader>
        <CardContent>
          {message ? (
            <div className="mb-5">
              <AlertBanner
                variant={message.type}
                message={message.text}
                onDismiss={() => setMessage(null)}
              />
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="grid gap-6">
            <div className="flex flex-col gap-4 rounded-xl border bg-background p-4 sm:flex-row sm:items-center">
              <ProfileAvatar
                name={fullName || null}
                avatarUrl={previewAvatarUrl}
                size="lg"
                className="mx-auto shrink-0 sm:mx-0"
              />
              <div className="grid w-full gap-2">
                <Label htmlFor="avatar_file">Profile picture</Label>
                <label
                  htmlFor="avatar_file"
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-primary transition-colors hover:bg-sky-100 dark:border-sky-900 dark:bg-sky-950/30"
                >
                  <ImageUp className="size-4" aria-hidden="true" />
                  Upload a profile picture
                </label>
                <Input
                  id="avatar_file"
                  name="avatar_file"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleAvatarChange}
                />
                <p className="text-xs text-muted-foreground">
                  JPG, PNG, WebP, or GIF. Maximum file size: 2 MB.
                </p>
                <Label htmlFor="avatar_url" className="pt-2 text-xs text-muted-foreground">
                  Or paste an image URL
                </Label>
                <Input
                  id="avatar_url"
                  name="avatar_url"
                  type="url"
                  inputMode="url"
                  placeholder="https://example.com/avatar.jpg"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Leave both fields blank to use your initials avatar.
                </p>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="full_name">Full name</Label>
              <Input
                id="full_name"
                name="full_name"
                required
                placeholder="Dagi Tesfaye"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">Phone number</Label>
              <Input
                id="phone"
                name="phone"
                placeholder="+251 911 234 567"
                pattern="(\+251\s?9[0-9]{2}\s?[0-9]{3}\s?[0-9]{3}|09[0-9]{8})"
                title={ETHIOPIAN_PHONE_HELPER}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">{ETHIOPIAN_PHONE_HELPER}</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="location">Addis Ababa area</Label>
              <NativeSelect
                id="location"
                name="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              >
                <option value="">Select your area</option>
                {ADDIS_ABABA_AREAS.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </NativeSelect>
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="bio">Bio</Label>
                <span className="text-xs text-muted-foreground">
                  {bio.length}/{BIO_MAX_LENGTH}
                </span>
              </div>
              <Textarea
                id="bio"
                name="bio"
                placeholder="Tell renters or owners a little about how you use GoRent in Addis Ababa…"
                rows={4}
                maxLength={BIO_MAX_LENGTH}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              {role === "admin" ? (
                <>
                  <Input id="role" name="role" value="admin" readOnly disabled />
                  <p className="text-xs text-muted-foreground">
                    Admin role is managed by the platform and cannot be changed here.
                  </p>
                </>
              ) : (
                <>
                  <NativeSelect
                    id="role"
                    name="role"
                    value={role}
                    onChange={(e) =>
                      setRole(e.target.value as "renter" | "owner")
                    }
                  >
                    <option value="renter">Renter — I want to rent cars</option>
                    <option value="owner">Owner — I list cars for rent</option>
                  </NativeSelect>
                  <p className="text-xs text-muted-foreground">
                    Choose how you primarily use GoRent in Addis Ababa.
                  </p>
                </>
              )}
            </div>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <Loader2 className="animate-spin" aria-hidden="true" />
                ) : (
                  <Save aria-hidden="true" />
                )}
                {saving ? "Saving…" : "Save profile"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/profile">
                  <ArrowLeft aria-hidden="true" />
                  Cancel
                </Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
