"use client";

import * as React from "react";
import { AlertCircle, Car, Search, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CarCard } from "@/components/cars/car-card";
import { fetchAvailableCars, type CarRow } from "@/lib/cars/queries";

type AppliedFilters = {
  location: string;
  minPrice: string;
  maxPrice: string;
};

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
  const [filterError, setFilterError] = React.useState("");
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

    const nextMinPrice = toOptionalPrice(minPrice);
    const nextMaxPrice = toOptionalPrice(maxPrice);

    if (
      (minPrice.trim() && (nextMinPrice === undefined || nextMinPrice < 0)) ||
      (maxPrice.trim() && (nextMaxPrice === undefined || nextMaxPrice < 0))
    ) {
      setFilterError("Enter a valid non-negative price range.");
      return;
    }

    if (
      typeof nextMinPrice === "number" &&
      typeof nextMaxPrice === "number" &&
      nextMinPrice > nextMaxPrice
    ) {
      setFilterError("Minimum price cannot be greater than maximum price.");
      return;
    }

    setFilterError("");
    setAppliedFilters({ location, minPrice, maxPrice });
  }

  function handleClearFilters() {
    setLocation("");
    setMinPrice("");
    setMaxPrice("");
    setFilterError("");
    setAppliedFilters({ location: "", minPrice: "", maxPrice: "" });
  }

  const hasActiveFilters = Boolean(
    appliedFilters.location || appliedFilters.minPrice || appliedFilters.maxPrice,
  );

  const resultsLabel = hasActiveFilters
    ? "No cars match your search"
    : "No available cars found";

  return (
    <div className="space-y-8">
      <Card className="border-sky-100 bg-white shadow-xl shadow-sky-950/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="size-5 text-primary" aria-hidden="true" />
            Find a car
          </CardTitle>
          <CardDescription>
            Filter available listings by location and daily price range.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-3 lg:grid-cols-[1fr_160px_160px_auto]"
            onSubmit={handleFilterSubmit}
          >
            <label className="grid gap-2 text-sm font-medium" htmlFor="location-search">
              Location
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  id="location-search"
                  className="h-11 pl-9"
                  placeholder="Search by city or area"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                />
              </div>
            </label>

            <label className="grid gap-2 text-sm font-medium" htmlFor="min-price">
              Min price
              <Input
                id="min-price"
                className="h-11"
                min="0"
                placeholder="0"
                type="number"
                value={minPrice}
                onChange={(event) => setMinPrice(event.target.value)}
              />
            </label>

            <label className="grid gap-2 text-sm font-medium" htmlFor="max-price">
              Max price
              <Input
                id="max-price"
                className="h-11"
                min="0"
                placeholder="150"
                type="number"
                value={maxPrice}
                onChange={(event) => setMaxPrice(event.target.value)}
              />
            </label>

            <div className="flex flex-col items-stretch gap-2 sm:flex-row lg:items-end">
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
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-950">Available listings</h2>
          <p className="text-sm text-slate-500">
            Browse cars from local owners and open a card to view details.
          </p>
        </div>
        {!isLoading && !error ? (
          <p className="w-fit rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-sm font-semibold text-primary">
            {cars.length} {cars.length === 1 ? "car" : "cars"} shown
          </p>
        ) : null}
      </div>

      {filterError ? (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex items-start gap-3 p-4 text-sm text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <p>{filterError}</p>
          </CardContent>
        </Card>
      ) : null}

      {isLoading ? (
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3" aria-label="Loading cars">
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
        <Card className="border-dashed border-sky-200 py-12 text-center">
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
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {cars.map((car) => (
            <CarCard key={car.id} car={car} variant="browse" />
          ))}
        </section>
      )}
    </div>
  );
}
