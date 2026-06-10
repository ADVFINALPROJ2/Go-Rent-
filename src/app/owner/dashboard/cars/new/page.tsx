"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { PageHeading } from "@/components/page-heading";
import { CarForm } from "@/components/cars/car-form";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

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
        onSubmit={async (data) => {
          const supabase = createSupabaseBrowserClient();
          const { error } = await supabase
            .from('cars')
            .insert([{ 
              owner_id: ownerId,
              make: data.make,
              model: data.model,
              year: data.year,
              price_per_day: data.price_per_day,
              location: data.location,
              description: data.description,
              image_url: data.image_url || null,
              status: 'available'
            }]);
          if (error) {
            console.error('Error saving car listing:', error);
            alert('Failed to save car listing. Please try again.');
          } else {
            alert('Car listing saved successfully!');
            router.push('/owner/dashboard');
          }
        }}
        onSuccess={() => router.push("/owner/dashboard/cars")}
      />
    </div>
  );
}
