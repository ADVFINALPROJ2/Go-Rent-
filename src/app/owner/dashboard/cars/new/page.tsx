"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { PageHeading } from "@/components/page-heading";
import { CarForm } from "@/components/cars/car-form";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { createCar } from "@/lib/actions/cars";

export default function AddCarPage() {
  const router = useRouter();
  const [userId, setUserId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function checkAuth() {
      try {
        const supabase = createSupabaseBrowserClient();
        if (!supabase) throw new Error("Supabase client unavailable.");

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push("/login");
          return;
        }

        setUserId(user.id);
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [router]);

  if (loading || !userId) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
        <PageHeading
          eyebrow="Add car"
          title="Loading…"
          description="Verifying your session."
        />
        <div className="h-96 animate-pulse rounded-lg border bg-card" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <PageHeading
        eyebrow="Add car"
        title="List a new vehicle"
        description="Complete the form below to create a new listing visible to renters on GoRent."
      />
      <CarForm
        mode="create"
        ownerId={userId}
        onSuccess={() => router.push("/owner/dashboard/cars")}
      />
    </div>
  );
}
