"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Car,
  Eye,
  EyeOff,
  Loader2,
  Pencil,
  Plus,
} from "lucide-react";

import { PageHeading } from "@/components/page-heading";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CarCard } from "@/components/cars/car-card";
import { getOwnerCars, toggleCarStatus } from "@/lib/actions/cars";
import { requireOwnerSession } from "@/lib/auth/role-guards";
import type { Database } from "@/lib/local-types";

type CarRow = Database["public"]["Tables"]["cars"]["Row"];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function OwnerCarsPage() {
  const router = useRouter();
  const [cars, setCars] = React.useState<CarRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [togglingId, setTogglingId] = React.useState<string | null>(null);
  const [error, setError] = React.useState("");

  // Fetch cars on mount
  React.useEffect(() => {
    async function load() {
      try {
        const ownerSession = await requireOwnerSession(router);
        if (!ownerSession) {
          return;
        }

        const ownerCars = await getOwnerCars(ownerSession.user.id);
        setCars(ownerCars);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load cars.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [router]);

  async function handleToggle(car: CarRow) {
    setTogglingId(car.id);
    try {
      const updated = await toggleCarStatus(car.id, car.status);
      setCars((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Toggle failed.");
    } finally {
      setTogglingId(null);
    }
  }

  // ----- Loading skeleton -----
  if (loading) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <PageHeading
          eyebrow="My cars"
          title="Loading your listings…"
          description="Please wait while we fetch your vehicles."
        />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="aspect-video rounded-md bg-muted" />
                <div className="mt-3 h-5 w-3/4 rounded bg-muted" />
              </CardHeader>
              <CardContent>
                <div className="h-4 w-1/2 rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="rounded-2xl border border-sky-100 bg-[linear-gradient(135deg,#ffffff,#eef8ff)] p-5 shadow-xl shadow-sky-950/10 dark:border-zinc-800 dark:bg-[linear-gradient(135deg,#111113,#0f172a)] sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <PageHeading
            eyebrow="My cars"
            title="Your vehicle listings"
            description="Create, edit, and manage the visibility of your car listings."
          />
          <Button asChild>
            <Link href="/owner/dashboard/cars/new">
              <Plus aria-hidden="true" />
              Add car
            </Link>
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Empty state */}
      {cars.length === 0 && !error && (
        <Card className="flex flex-col items-center justify-center border-dashed border-sky-200 bg-sky-50/40 py-16 text-center dark:border-zinc-700 dark:bg-zinc-900/50">
          <div className="flex size-14 items-center justify-center rounded-xl bg-white text-primary shadow-sm dark:bg-zinc-950">
            <Car className="size-7" aria-hidden="true" />
          </div>
          <CardHeader>
            <CardTitle>No cars yet</CardTitle>
            <CardDescription>
              List your first vehicle to start earning on GoRent.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/owner/dashboard/cars/new">
                <Plus aria-hidden="true" />
                Add your first car
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Car grid */}
      {cars.length > 0 && (
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {cars.map((car) => (
            <CarCard
              key={car.id}
              car={car}
              variant="dashboard"
              showStatus
              actions={
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggle(car)}
                    disabled={togglingId === car.id}
                    title={
                      car.status === "available"
                        ? "Hide from marketplace"
                        : "Make available"
                    }
                  >
                    {togglingId === car.id ? (
                      <Loader2 className="animate-spin" aria-hidden="true" />
                    ) : car.status === "available" ? (
                      <EyeOff aria-hidden="true" />
                    ) : (
                      <Eye aria-hidden="true" />
                    )}
                  </Button>
                  <Button variant="secondary" size="sm" asChild>
                    <Link href={`/owner/dashboard/cars/${car.id}/edit`}>
                      <Pencil aria-hidden="true" />
                      Edit
                    </Link>
                  </Button>
                </div>
              }
            />
          ))}
        </section>
      )}
    </div>
  );
}

