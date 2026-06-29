"use client";

import * as React from "react";
import {
  AlertCircle,
  Car,
  Grid2X2,
  List,
  RotateCcw,
  Search,
  SlidersHorizontal,
} from "lucide-react";

import { CarCard } from "@/components/cars/car-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/select";
import {
  ADDIS_AREAS,
  CAR_CATEGORIES,
  FUEL_OPTIONS,
  SORT_OPTIONS,
  TRANSMISSION_OPTIONS,
  type SortOption,
} from "@/lib/car-options";
import { fetchAvailableCars, type CarRow } from "@/lib/cars/queries";
import { cn } from "@/lib/utils";

const ALL_VALUE = "all";
const PAGE_SIZE = 6;

type ViewMode = "grid" | "list";

function toOptionalNumber(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return undefined;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function matchesText(car: CarRow, search: string) {
  const needle = search.trim().toLowerCase();

  if (!needle) {
    return true;
  }

  return [car.make, car.model, car.title, car.description ?? ""]
    .join(" ")
    .toLowerCase()
    .includes(needle);
}

function sortCars(cars: CarRow[], sort: SortOption) {
  const sorted = [...cars];

  if (sort === "Price: Low to High") {
    return sorted.sort((a, b) => a.daily_rate - b.daily_rate);
  }

  if (sort === "Price: High to Low") {
    return sorted.sort((a, b) => b.daily_rate - a.daily_rate);
  }

  if (sort === "Newest") {
    return sorted.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }

  if (sort === "Rating") {
    return sorted.sort((a, b) => (b.average_rating ?? -1) - (a.average_rating ?? -1));
  }

  return sorted;
}

export function BrowseCarsClient() {
  const [cars, setCars] = React.useState<CarRow[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [area, setArea] = React.useState(() => {
    if (typeof window === "undefined") {
      return ALL_VALUE;
    }

    const locationParam = new URLSearchParams(window.location.search).get("location");

    return locationParam && ADDIS_AREAS.includes(locationParam as (typeof ADDIS_AREAS)[number])
      ? locationParam
      : ALL_VALUE;
  });
  const [category, setCategory] = React.useState(ALL_VALUE);
  const [minPrice, setMinPrice] = React.useState("");
  const [maxPrice, setMaxPrice] = React.useState("");
  const [transmission, setTransmission] = React.useState(ALL_VALUE);
  const [fuel, setFuel] = React.useState(ALL_VALUE);
  const [minSeats, setMinSeats] = React.useState("");
  const [sort, setSort] = React.useState<SortOption>("Recommended");
  const [viewMode, setViewMode] = React.useState<ViewMode>("grid");
  const [page, setPage] = React.useState(1);

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

  function resetPage() {
    setPage(1);
  }

  const priceError = React.useMemo(() => {
    const nextMinPrice = toOptionalNumber(minPrice);
    const nextMaxPrice = toOptionalNumber(maxPrice);

    if (
      (minPrice.trim() && (nextMinPrice === undefined || nextMinPrice < 0)) ||
      (maxPrice.trim() && (nextMaxPrice === undefined || nextMaxPrice < 0))
    ) {
      return "Enter a valid non-negative price range.";
    }

    if (
      typeof nextMinPrice === "number" &&
      typeof nextMaxPrice === "number" &&
      nextMinPrice > nextMaxPrice
    ) {
      return "Minimum price cannot be greater than maximum price.";
    }

    return "";
  }, [minPrice, maxPrice]);

  const filteredCars = React.useMemo(() => {
    if (priceError) {
      return [];
    }

    const minPriceValue = toOptionalNumber(minPrice);
    const maxPriceValue = toOptionalNumber(maxPrice);
    const minSeatsValue = toOptionalNumber(minSeats);

    return sortCars(
      cars.filter((car) => {
        if (!matchesText(car, search)) return false;
        if (area !== ALL_VALUE && car.location !== area) return false;
        if (category !== ALL_VALUE && car.category !== category) return false;
        if (transmission !== ALL_VALUE && car.transmission !== transmission) return false;
        if (fuel !== ALL_VALUE && car.fuel_type !== fuel) return false;
        if (typeof minPriceValue === "number" && car.daily_rate < minPriceValue) return false;
        if (typeof maxPriceValue === "number" && car.daily_rate > maxPriceValue) return false;
        if (typeof minSeatsValue === "number" && (car.seats ?? 0) < minSeatsValue) return false;

        return true;
      }),
      sort,
    );
  }, [
    cars,
    search,
    area,
    category,
    minPrice,
    maxPrice,
    transmission,
    fuel,
    minSeats,
    sort,
    priceError,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredCars.length / PAGE_SIZE));
  const visibleCars = filteredCars.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const hasActiveFilters = Boolean(
    search ||
      area !== ALL_VALUE ||
      category !== ALL_VALUE ||
      minPrice ||
      maxPrice ||
      transmission !== ALL_VALUE ||
      fuel !== ALL_VALUE ||
      minSeats ||
      sort !== "Recommended",
  );
  const resultsLabel = hasActiveFilters
    ? "No cars match your search"
    : "No available cars found";

  function resetFilters() {
    setSearch("");
    setArea(ALL_VALUE);
    setCategory(ALL_VALUE);
    setMinPrice("");
    setMaxPrice("");
    setTransmission(ALL_VALUE);
    setFuel(ALL_VALUE);
    setMinSeats("");
    setSort("Recommended");
    setPage(1);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr] lg:items-start">
      <Card className="border-sky-100 bg-white shadow-xl shadow-sky-950/10 dark:border-zinc-800 dark:bg-zinc-950 lg:sticky lg:top-24">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <SlidersHorizontal className="size-5 text-primary" aria-hidden="true" />
            Filters
          </CardTitle>
          <CardDescription>Refine Addis listings by area, category, and price.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="car-search">Search</Label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="car-search"
                className="pl-9"
                placeholder="Make or model"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  resetPage();
                }}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="area-filter">Area</Label>
            <NativeSelect
              id="area-filter"
              value={area}
              onChange={(event) => {
                setArea(event.target.value);
                resetPage();
              }}
            >
              <option value={ALL_VALUE}>Any area</option>
              {ADDIS_AREAS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </NativeSelect>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="category-filter">Category</Label>
            <NativeSelect
              id="category-filter"
              value={category}
              onChange={(event) => {
                setCategory(event.target.value);
                resetPage();
              }}
            >
              <option value={ALL_VALUE}>All Categories</option>
              {CAR_CATEGORIES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </NativeSelect>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div className="grid gap-2">
              <Label htmlFor="min-price">Min Br/day</Label>
              <Input
                id="min-price"
                min="0"
                placeholder="1500"
                type="number"
                value={minPrice}
                onChange={(event) => {
                  setMinPrice(event.target.value);
                  resetPage();
                }}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="max-price">Max Br/day</Label>
              <Input
                id="max-price"
                min="0"
                placeholder="7500"
                type="number"
                value={maxPrice}
                onChange={(event) => {
                  setMaxPrice(event.target.value);
                  resetPage();
                }}
              />
            </div>
          </div>

          {priceError ? (
            <p className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              {priceError}
            </p>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div className="grid gap-2">
              <Label htmlFor="transmission-filter">Transmission</Label>
              <NativeSelect
                id="transmission-filter"
                value={transmission}
                onChange={(event) => {
                  setTransmission(event.target.value);
                  resetPage();
                }}
              >
                <option value={ALL_VALUE}>Any</option>
                {TRANSMISSION_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fuel-filter">Fuel</Label>
              <NativeSelect
                id="fuel-filter"
                value={fuel}
                onChange={(event) => {
                  setFuel(event.target.value);
                  resetPage();
                }}
              >
                <option value={ALL_VALUE}>Any</option>
                {FUEL_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </NativeSelect>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="min-seats">Min seats</Label>
            <Input
              id="min-seats"
              min="1"
              placeholder="4"
              type="number"
              value={minSeats}
              onChange={(event) => {
                setMinSeats(event.target.value);
                resetPage();
              }}
            />
          </div>

          <Button type="button" variant="outline" onClick={resetFilters}>
            <RotateCcw className="size-4" aria-hidden="true" />
            Reset filters
          </Button>
        </CardContent>
      </Card>

      <section className="min-w-0 space-y-5">
        <div className="flex flex-col gap-3 rounded-xl border border-sky-100 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-950 dark:text-white">
              {isLoading ? "Loading cars..." : `${filteredCars.length} result${filteredCars.length === 1 ? "" : "s"}`}
            </p>
            <p className="text-sm text-slate-500 dark:text-zinc-400">
              Sorted by {sort.toLowerCase()}.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <NativeSelect
              aria-label="Sort cars"
              className="sm:w-52"
              value={sort}
              onChange={(event) => {
                setSort(event.target.value as SortOption);
                resetPage();
              }}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </NativeSelect>
            <div className="grid grid-cols-2 rounded-md border border-input bg-background p-1">
              <Button
                aria-label="Grid view"
                className={cn("h-8 px-3", viewMode === "grid" && "bg-accent")}
                type="button"
                variant="ghost"
                onClick={() => setViewMode("grid")}
              >
                <Grid2X2 className="size-4" aria-hidden="true" />
                <span className="sr-only">Grid</span>
              </Button>
              <Button
                aria-label="List view"
                className={cn("h-8 px-3", viewMode === "list" && "bg-accent")}
                type="button"
                variant="ghost"
                onClick={() => setViewMode("list")}
              >
                <List className="size-4" aria-hidden="true" />
                <span className="sr-only">List</span>
              </Button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3" aria-label="Loading cars">
            {Array.from({ length: 6 }).map((_, index) => (
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
        ) : visibleCars.length === 0 ? (
          <Card className="border-dashed border-sky-200 py-12 text-center dark:border-zinc-700">
            <CardContent className="flex flex-col items-center gap-4">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                <Car className="size-7" aria-hidden="true" />
              </div>
              <div>
                <CardTitle>{resultsLabel}</CardTitle>
                <CardDescription className="mt-2">
                  {hasActiveFilters
                    ? "Try resetting filters or widening your Birr price range."
                    : "Check back soon for new listings from local owners."}
                </CardDescription>
              </div>
            </CardContent>
          </Card>
        ) : (
          <section
            className={cn(
              viewMode === "grid"
                ? "grid gap-5 md:grid-cols-2 xl:grid-cols-3"
                : "grid gap-5",
            )}
          >
            {visibleCars.map((car) => (
              <CarCard key={car.id} car={car} layout={viewMode} variant="browse" />
            ))}
          </section>
        )}

        {!isLoading && !error && filteredCars.length > 0 ? (
          <div className="flex flex-col items-center justify-between gap-3 rounded-xl border border-sky-100 bg-white p-4 text-sm dark:border-zinc-800 dark:bg-zinc-950 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Previous
            </Button>
            <p className="font-semibold text-slate-600 dark:text-zinc-300">
              Page {page} of {totalPages}
            </p>
            <Button
              type="button"
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            >
              Next
            </Button>
          </div>
        ) : null}
      </section>
    </div>
  );
}
