"use client";

import * as React from "react";
import { AlertCircle, Car, MapPin, Search, SlidersHorizontal } from "lucide-react";
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

type AppliedFilters = {
  location: string;
  minPrice: string;
  maxPrice: string;
};

function formatDailyRate(rate: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(rate));
}

function toOptionalPrice(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return undefined;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function BrowseCarsClient() {
  const [cars, setCars] = React.useState<CarRow[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [minPrice, setMinPrice] = React.useState("");
  const [maxPrice, setMaxPrice] = React.useState("");
  const [appliedFilters, setAppliedFilters] = React.useState<AppliedFilters>({
    location: "",
    minPrice: "",
    maxPrice: "",
  });

  React.useEffect(() => {
    let isCurrent = true;

    async function loadCars() {
      setIsLoading(true);
      setError("");

      try {
        const availableCars = await fetchAvailableCars({
          location: appliedFilters.location,
          minPrice: toOptionalPrice(appliedFilters.minPrice),
          maxPrice: toOptionalPrice(appliedFilters.maxPrice),
        });

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
  }, [appliedFilters]);

  function handleFilterSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAppliedFilters({ location, minPrice, maxPrice });
  }

  function handleClearFilters() {
    setLocation("");
    setMinPrice("");
    setMaxPrice("");
    setAppliedFilters({ location: "", minPrice: "", maxPrice: "" });
  }

  const hasActiveFilters = Boolean(
    appliedFilters.location || appliedFilters.minPrice || appliedFilters.maxPrice,
  );

  const resultsLabel = hasActiveFilters
    ? "No cars match your search"
    : "No available cars found";

  return (
    <div className="space-y-6">
      <form
        className="grid gap-3 rounded-lg border bg-card p-4 sm:grid-cols-[1fr_160px_160px_auto]"
        onSubmit={handleFilterSubmit}
      >
        <label className="grid gap-2 text-sm font-medium" htmlFor="location-search">
          Location
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              id="location-search"
              className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Search by city or area"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
            />
          </div>
        </label>

        <label className="grid gap-2 text-sm font-medium" htmlFor="min-price">
          Min price
          <input
            id="min-price"
            className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            min="0"
            placeholder="0"
            type="number"
            value={minPrice}
            onChange={(event) => setMinPrice(event.target.value)}
          />
        </label>

        <label className="grid gap-2 text-sm font-medium" htmlFor="max-price">
          Max price
          <input
            id="max-price"
            className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            min="0"
            placeholder="150"
            type="number"
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value)}
          />
        </label>

        <div className="flex items-end gap-2">
          <Button className="w-full sm:w-auto" type="submit">
            <SlidersHorizontal aria-hidden="true" />
            Apply
          </Button>
          {hasActiveFilters ? (
            <Button
              className="w-full sm:w-auto"
              type="button"
              variant="outline"
              onClick={handleClearFilters}
            >
              Clear
            </Button>
          ) : null}
        </div>
      </form>

      {isLoading ? (
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
      ) : error ? (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex items-start gap-3 p-6 text-sm text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <div>
              <p className="font-medium">Unable to load cars.</p>
              <p className="mt-1">{error}</p>
            </div>
          </CardContent>
        </Card>
      ) : cars.length === 0 ? (
        <Card className="py-12 text-center">
          <CardContent className="flex flex-col items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <Car className="size-7" aria-hidden="true" />
            </div>
            <div>
              <CardTitle>{resultsLabel}</CardTitle>
              <CardDescription className="mt-2">
                {hasActiveFilters
                  ? "Try a different location or price range."
                  : "Check back soon for new listings from local owners."}
              </CardDescription>
            </div>
          </CardContent>
        </Card>
      ) : (
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
                    <Car
                      className="size-10 text-muted-foreground/50"
                      aria-hidden="true"
                    />
                  </div>
                )}
              </div>
              <CardHeader className="flex-1">
                <CardTitle>{car.title}</CardTitle>
                <CardDescription>
                  {car.make} {car.model} - {car.year}
                </CardDescription>
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="size-4" aria-hidden="true" />
                  {car.location}
                </p>
              </CardHeader>
              <CardContent className="flex items-center justify-between border-t pt-4">
                <p className="font-semibold">
                  {formatDailyRate(car.daily_rate)}
                  <span className="text-sm font-normal text-muted-foreground">
                    /day
                  </span>
                </p>
                <Button asChild variant="secondary" size="sm">
                  <Link href={`/cars/${car.id}`}>View</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </section>
      )}
    </div>
  );
}
