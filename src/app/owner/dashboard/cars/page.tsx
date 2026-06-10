"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Car,
  Eye,
  EyeOff,
  Loader2,
  MapPin,
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
import { getOwnerCars, toggleCarStatus } from "@/lib/actions/cars";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

type CarRow = Database["public"]["Tables"]["cars"]["Row"];

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------

const STATUS_STYLES: Record<CarRow["status"], string> = {
  draft: "bg-secondary text-secondary-foreground",
  available: "bg-emerald-100 text-emerald-800",
  unavailable: "bg-amber-100 text-amber-800",
  archived: "bg-neutral-200 text-neutral-600",
};

function StatusBadge({ status }: { status: CarRow["status"] }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  );
}

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
        const supabase = createSupabaseBrowserClient();
        if (!supabase) throw new Error("Supabase client unavailable.");

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push("/login");
          return;
        }

        const ownerCars = await getOwnerCars(user.id);
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
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
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
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
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

      {/* Error */}
      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Empty state */}
      {cars.length === 0 && !error && (
        <Card className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-accent text-accent-foreground">
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
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cars.map((car) => (
            <Card key={car.id} className="flex flex-col overflow-hidden">
              {/* Image */}
              <div className="relative aspect-video w-full overflow-hidden bg-muted">
                {car.image_urls.length > 0 ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={car.image_urls[0]}
                    alt={car.title}
                    className="size-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center bg-[linear-gradient(135deg,#e7eef4,#d8ebe6)]">
                    <Car className="size-10 text-muted-foreground/40" aria-hidden="true" />
                  </div>
                )}
                <div className="absolute right-2 top-2">
                  <StatusBadge status={car.status} />
                </div>
              </div>

              {/* Details */}
              <CardHeader className="flex-1">
                <CardTitle className="text-lg">{car.title}</CardTitle>
                <CardDescription>
                  {car.make} {car.model} · {car.year}
                </CardDescription>
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="size-3.5" aria-hidden="true" />
                  {car.location}
                </p>
              </CardHeader>

              {/* Footer actions */}
              <CardContent className="flex items-center justify-between border-t pt-4">
                <p className="text-lg font-semibold text-primary">
                  ${Number(car.daily_rate).toFixed(2)}
                  <span className="text-sm font-normal text-muted-foreground">
                    /day
                  </span>
                </p>
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
              </CardContent>
            </Card>
          ))}
        </section>
      )}
    </div>
  );
}
