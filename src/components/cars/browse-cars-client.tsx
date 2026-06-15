"use client";

import * as React from "react";
import { AlertCircle, Car, MapPin } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { fetchAvailableCars, type CarRow } from "@/lib/cars/queries";

function formatDailyRate(rate: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(rate));
}

export function BrowseCarsClient() {
  const [cars, setCars] = React.useState<CarRow[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let isCurrent = true;

    async function loadCars() {
      setIsLoading(true);
      setError("");

      try {
        const availableCars = await fetchAvailableCars();

        if (isCurrent) {
          setCars(availableCars);
        }
      } catch (err) {
        if (isCurrent) {
          setError(err instanceof Error ? err.message : "Failed to load cars.");
          setCars([]);
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    loadCars();

    return () => {
      isCurrent = false;
    };
  }, []);

  if (isLoading) {
    return (
      <section className="grid gap-4 md:grid-cols-3" aria-label="Loading cars">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card className="animate-pulse" key={index}>
            <CardHeader>
              <div className="aspect-video rounded-md bg-muted" />
              <div className="h-5 w-2/3 rounded bg-muted" />
              <div className="h-4 w-1/2 rounded bg-muted" />
            </CardHeader>
            <CardContent>
              <div className="h-9 w-full rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </section>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/30 bg-destructive/5">
        <CardContent className="flex items-start gap-3 p-6 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-medium">Unable to load cars.</p>
            <p className="mt-1">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (cars.length === 0) {
    return (
      <Card className="py-12 text-center">
        <CardContent className="flex flex-col items-center gap-4">
          <div className="flex size-14 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <Car className="size-7" aria-hidden="true" />
          </div>
          <div>
            <CardTitle>No available cars found</CardTitle>
            <CardDescription className="mt-2">
              Check back soon for new listings from local owners.
            </CardDescription>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <section className="grid gap-4 md:grid-cols-3">
      {cars.map((car) => (
        <Card key={car.id} className="flex flex-col overflow-hidden">
          <div className="aspect-video bg-muted">
            {car.image_urls.length > 0 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={car.image_urls[0]}
                alt={car.title}
                className="size-full object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center bg-[linear-gradient(135deg,#e7eef4,#d8ebe6)]">
                <Car className="size-10 text-muted-foreground/50" aria-hidden="true" />
              </div>
            )}
          </div>
          <CardHeader className="flex-1">
            <CardTitle>{car.title}</CardTitle>
            <CardDescription>
              {car.make} {car.model} · {car.year}
            </CardDescription>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="size-4" aria-hidden="true" />
              {car.location}
            </p>
          </CardHeader>
          <CardContent className="flex items-center justify-between border-t pt-4">
            <p className="font-semibold">
              {formatDailyRate(car.daily_rate)}
              <span className="text-sm font-normal text-muted-foreground">/day</span>
            </p>
            <Button asChild variant="secondary" size="sm">
              <Link href={`/cars/${car.id}`}>View</Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
