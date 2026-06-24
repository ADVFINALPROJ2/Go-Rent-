"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";

import { PageHeading } from "@/components/page-heading";
import { CarForm } from "@/components/cars/car-form";
import { getCarById } from "@/lib/actions/cars";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

type CarRow = Database["public"]["Tables"]["cars"]["Row"];

export default function EditCarPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [userId, setUserId] = React.useState<string | null>(null);
  const [car, setCar] = React.useState<CarRow | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    async function load() {
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

        const carData = await getCarById(params.id);

        if (!carData) {
          setError("Car not found.");
          return;
        }

        if (carData.owner_id !== user.id) {
          setError("You do not have permission to edit this listing.");
          return;
        }

        setCar(carData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load car.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <PageHeading
          eyebrow="Edit car"
          title="Loading…"
          description="Fetching your listing details."
        />
        <div className="h-96 animate-pulse rounded-lg border bg-card" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <PageHeading
          eyebrow="Edit car"
          title="Unable to load listing"
          description="Something went wrong while fetching this car."
        />
        <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
          {error}
        </div>
      </div>
    );
  }

  if (!car || !userId) return null;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-lg border border-sky-100 bg-[linear-gradient(135deg,#ffffff,#eef8ff)] p-5 shadow-xl shadow-sky-950/10 sm:p-7">
        <PageHeading
          eyebrow="Edit car"
          title={`Editing: ${car.title}`}
          description="Update the details below and save your changes."
        />
      </div>
      <CarForm
        mode="edit"
        ownerId={userId}
        defaultValues={car}
        onSuccess={() => router.push("/owner/dashboard/cars")}
      />
    </div>
  );
}
