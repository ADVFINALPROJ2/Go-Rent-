"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { PageHeading } from "@/components/page-heading";
import { CarForm } from "@/components/cars/car-form";
import { requireOwnerSession } from "@/lib/auth/role-guards";

export default function AddCarPage() {
  const router = useRouter();
  const [userId, setUserId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function checkAuth() {
      try {
        const ownerSession = await requireOwnerSession(router);
        if (!ownerSession) {
          return;
        }

        setUserId(ownerSession.user.id);
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
      <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <PageHeading
          eyebrow="Add car"
          title="Loading…"
          description="Verifying your session."
        />
        <div className="h-96 animate-pulse rounded-xl border bg-card" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-sky-100 bg-[linear-gradient(135deg,#ffffff,#eef8ff)] p-5 shadow-xl shadow-sky-950/10 dark:border-zinc-800 dark:bg-[linear-gradient(135deg,#111113,#0f172a)] sm:p-7">
        <PageHeading
          eyebrow="Add car"
          title="List a new vehicle"
          description="Complete the form below to create a polished listing visible to renters on GoRent."
        />
      </div>
      <CarForm
        mode="create"
        ownerId={userId}
        onSuccess={() => router.push("/owner/dashboard/cars")}
      />
    </div>
  );
}
