"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Save, ArrowLeft, UserRound } from "lucide-react";

import { PageHeading } from "@/components/page-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/select";
import { AlertBanner } from "@/components/ui/alert-banner";
import { getProfile, updateProfile } from "../actions";

export default function EditProfilePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Form fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [role, setRole] = useState<"renter" | "owner">("renter");

  useEffect(() => {
    getProfile().then((result) => {
      if (result.success && result.data) {
        setFullName(result.data.full_name ?? "");
        setPhone(result.data.phone ?? "");
        setLocation(result.data.location ?? "");
        setBio(result.data.bio ?? "");
        setRole(result.data.role === "owner" ? "owner" : "renter");
      } else {
        setMessage({
          type: "error",
          text: result.error ?? "Could not load profile.",
        });
        if (result.error === "NOT_AUTHENTICATED") {
          router.push("/login");
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
      setMessage({ type: "success", text: "Profile updated successfully!" });
      // Redirect to profile after short delay so user sees the success message
      setTimeout(() => router.push("/profile"), 1200);
    } else {
      setMessage({
        type: "error",
        text: result.error ?? "Failed to update profile.",
      });
    }

    setSaving(false);
  }

  /* ---- Loading state ---- */
  if (loading) {
    return (
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_480px] lg:px-8">
        <PageHeading
          eyebrow="Edit Profile"
          title="Loading your details…"
          description="One moment please."
        />
        <Card>
          <CardHeader>
            <div className="flex size-12 items-center justify-center rounded-md bg-accent text-accent-foreground">
              <UserRound className="size-6" aria-hidden="true" />
            </div>
            <CardTitle>Profile details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
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

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_480px] lg:px-8">
      <PageHeading
        eyebrow="Edit Profile"
        title="Update your account details."
        description="Keep your name, contact info, and role up to date so owners and renters can connect with you."
      />

      <Card>
        <CardHeader>
          <div className="flex size-12 items-center justify-center rounded-md bg-accent text-accent-foreground">
            <UserRound className="size-6" aria-hidden="true" />
          </div>
          <CardTitle>Profile details</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Alert banner */}
          {message ? (
            <div className="mb-5">
              <AlertBanner
                variant={message.type}
                message={message.text}
                onDismiss={() => setMessage(null)}
              />
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="grid gap-5">
            {/* Full name */}
            <div className="grid gap-2">
              <Label htmlFor="full_name">Full name</Label>
              <Input
                id="full_name"
                name="full_name"
                placeholder="Alex Johnson"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            {/* Phone */}
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone number</Label>
              <Input
                id="phone"
                name="phone"
                placeholder="+254 700 000 000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            {/* Location */}
            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                placeholder="Nairobi, Kenya"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            {/* Bio */}
            <div className="grid gap-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                placeholder="Tell others a little about yourself…"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                A short description visible on your public profile.
              </p>
            </div>

            {/* Role */}
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
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
                Choose how you primarily use GoRent.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
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
