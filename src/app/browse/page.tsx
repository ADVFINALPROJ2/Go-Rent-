"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { MapPin, SlidersHorizontal, Search, DollarSign, AlertCircle, X, Car } from "lucide-react";

import { PageHeading } from "@/components/page-heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

type CarRow = Database["public"]["Tables"]["cars"]["Row"];

// Fallback mock data when Supabase is not configured or is empty
const MOCK_CARS: CarRow[] = [
  {
    id: "mock-1",
    owner_id: "00000000-0000-0000-0000-000000000000",
    title: "Sleek Toyota Corolla 2022",
    make: "Toyota",
    model: "Corolla",
    year: 2022,
    location: "Nairobi West",
    daily_rate: 45.00,
    status: "available",
    image_urls: [],
    description: "Extremely fuel-efficient sedan, perfect for city drives.",
    seats: 5,
    transmission: "Automatic",
    fuel_type: "Petrol",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "mock-2",
    owner_id: "00000000-0000-0000-0000-000000000000",
    title: "Subaru Forester SUV 2021",
    make: "Subaru",
    model: "Forester",
    year: 2021,
    location: "Kilimani",
    daily_rate: 70.00,
    status: "available",
    image_urls: [],
    description: "Spacious AWD SUV suitable for upcountry trips and families.",
    seats: 5,
    transmission: "Automatic",
    fuel_type: "Petrol",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "mock-3",
    owner_id: "00000000-0000-0000-0000-000000000000",
    title: "Eco-Friendly Nissan Leaf 2020",
    make: "Nissan",
    model: "Leaf",
    year: 2020,
    location: "Westlands",
    daily_rate: 55.00,
    status: "available",
    image_urls: [],
    description: "Fully electric hatchback, smooth and whisper-quiet.",
    seats: 5,
    transmission: "Automatic",
    fuel_type: "Electric",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "mock-4",
    owner_id: "00000000-0000-0000-0000-000000000000",
    title: "Honda Civic Sedan 2023",
    make: "Honda",
    model: "Civic",
    year: 2023,
    location: "Mombasa Road",
    daily_rate: 50.00,
    status: "available",
    image_urls: [],
    description: "Sporty sedan with advanced safety features and premium sound.",
    seats: 5,
    transmission: "Automatic",
    fuel_type: "Petrol",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "mock-5",
    owner_id: "00000000-0000-0000-0000-000000000000",
    title: "Rugged Land Rover Defender 2022",
    make: "Land Rover",
    model: "Defender",
    year: 2022,
    location: "Karen",
    daily_rate: 150.00,
    status: "available",
    image_urls: [],
    description: "Premium luxury off-road SUV. Travel anywhere in ultimate style.",
    seats: 7,
    transmission: "Automatic",
    fuel_type: "Diesel",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

function BrowseCarsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse active filter parameters from URL
  const activeLocation = searchParams.get("location") || "";
  const activeMinPrice = searchParams.get("minPrice") || "";
  const activeMaxPrice = searchParams.get("maxPrice") || "";

  // Form input states (local, not applied until search is submitted)
  const [inputLocation, setInputLocation] = useState(activeLocation);
  const [inputMinPrice, setInputMinPrice] = useState(activeMinPrice);
  const [inputMaxPrice, setInputMaxPrice] = useState(activeMaxPrice);

  // Sync inputs with active URL params on navigation/history change via render-pass state adjusting
  const [prevParams, setPrevParams] = useState({
    activeLocation,
    activeMinPrice,
    activeMaxPrice,
  });

  if (
    prevParams.activeLocation !== activeLocation ||
    prevParams.activeMinPrice !== activeMinPrice ||
    prevParams.activeMaxPrice !== activeMaxPrice
  ) {
    setPrevParams({ activeLocation, activeMinPrice, activeMaxPrice });
    setInputLocation(activeLocation);
    setInputMinPrice(activeMinPrice);
    setInputMaxPrice(activeMaxPrice);
  }

  // Data fetching state
  const [cars, setCars] = useState<CarRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [supabaseUnconfigured, setSupabaseUnconfigured] = useState(false);
  const [usingMockFallback, setUsingMockFallback] = useState(false);

  // Local helper to filter mock data
  const applyLocalMockFilters = (loc: string, min: string, max: string) => {
    let filtered = [...MOCK_CARS];

    if (loc.trim()) {
      const search = loc.toLowerCase();
      filtered = filtered.filter(car => car.location.toLowerCase().includes(search));
    }

    if (min) {
      const minVal = parseFloat(min);
      if (!isNaN(minVal)) {
        filtered = filtered.filter(car => Number(car.daily_rate) >= minVal);
      }
    }

    if (max) {
      const maxVal = parseFloat(max);
      if (!isNaN(maxVal)) {
        filtered = filtered.filter(car => Number(car.daily_rate) <= maxVal);
      }
    }

    setCars(filtered);
  };

  // Fetch cars from Supabase or Mock fallback based on active URL filters
  useEffect(() => {
    async function fetchCars() {
      setLoading(true);
      setError(null);

      const supabase = createSupabaseBrowserClient();

      if (!supabase) {
        // Supabase keys are not set up in environment variables
        setSupabaseUnconfigured(true);
        setUsingMockFallback(true);
        // Apply filters locally on mock data
        applyLocalMockFilters(activeLocation, activeMinPrice, activeMaxPrice);
        setLoading(false);
        return;
      }

      try {
        let query = supabase
          .from("cars")
          .select("*")
          .eq("status", "available");

        if (activeLocation.trim()) {
          query = query.ilike("location", `%${activeLocation}%`);
        }

        if (activeMinPrice) {
          const minVal = parseFloat(activeMinPrice);
          if (!isNaN(minVal)) {
            query = query.gte("daily_rate", minVal);
          }
        }

        if (activeMaxPrice) {
          const maxVal = parseFloat(activeMaxPrice);
          if (!isNaN(maxVal)) {
            query = query.lte("daily_rate", maxVal);
          }
        }

        const { data, error: fetchError } = await query;

        if (fetchError) {
          throw fetchError;
        }

        // If data fetched successfully but it's empty, and no filters are set, we might be in an empty DB,
        // but let's just show whatever the DB returns (empty or not)
        setCars(data || []);
        setUsingMockFallback(false);
        setSupabaseUnconfigured(false);
      } catch (err: unknown) {
        const errorDetails = err as Error;
        console.error("Error fetching cars from Supabase:", errorDetails);
        setError(errorDetails.message || "Failed to load vehicles from Supabase.");
        // If there's an error, allow toggling mock fallback
        setUsingMockFallback(true);
        applyLocalMockFilters(activeLocation, activeMinPrice, activeMaxPrice);
      } finally {
        setLoading(false);
      }
    }

    fetchCars();
  }, [activeLocation, activeMinPrice, activeMaxPrice]);

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams();
    if (inputLocation.trim()) params.set("location", inputLocation.trim());
    if (inputMinPrice.trim()) params.set("minPrice", inputMinPrice.trim());
    if (inputMaxPrice.trim()) params.set("maxPrice", inputMaxPrice.trim());

    router.push(`/browse?${params.toString()}`);
  };

  const handleClearFilters = () => {
    setInputLocation("");
    setInputMinPrice("");
    setInputMaxPrice("");
    router.push("/browse");
  };

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
      {/* Header section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <PageHeading
          eyebrow="Browse cars"
          title="Available vehicles"
          description="Find and book the perfect vehicle from our trusted local community."
        />
        {usingMockFallback && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800 ring-1 ring-inset ring-amber-600/20">
            <AlertCircle className="size-3.5" />
            Showing Mock Data (Supabase disconnected)
          </span>
        )}
      </div>

      {/* Warning Alert if Supabase is unconfigured */}
      {supabaseUnconfigured && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 size-5 text-amber-600 shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-amber-800">Supabase Connection Missing</h3>
              <p className="mt-1 text-xs text-amber-700 leading-relaxed">
                Environment variables <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> are not set in your <code>.env.local</code> file.
                The app is currently falling back to offline demo mode using sample data.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main content grid */}
      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        
        {/* Search & Filters Sidebar */}
        <aside className="h-fit rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <SlidersHorizontal className="size-4 text-primary" />
              Filters
            </h2>
            {(activeLocation || activeMinPrice || activeMaxPrice) && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleClearFilters}
                className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                Clear
                <X className="ml-1 size-3.5" />
              </Button>
            )}
          </div>

          <form onSubmit={handleApplyFilters} className="mt-4 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="location" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Location</Label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="location"
                  placeholder="e.g. Nairobi, Karen..."
                  value={inputLocation}
                  onChange={(e) => setInputLocation(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Daily Budget</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <DollarSign className="absolute left-2 top-2.5 size-3.5 text-muted-foreground pointer-events-none" />
                  <Input
                    id="minPrice"
                    type="number"
                    placeholder="Min"
                    value={inputMinPrice}
                    onChange={(e) => setInputMinPrice(e.target.value)}
                    className="pl-7"
                    min="0"
                  />
                </div>
                <div className="relative">
                  <DollarSign className="absolute left-2 top-2.5 size-3.5 text-muted-foreground pointer-events-none" />
                  <Input
                    id="maxPrice"
                    type="number"
                    placeholder="Max"
                    value={inputMaxPrice}
                    onChange={(e) => setInputMaxPrice(e.target.value)}
                    className="pl-7"
                    min="0"
                  />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full mt-2">
              Apply Filters
            </Button>
          </form>
        </aside>

        {/* Cars List Section */}
        <section className="space-y-6">
          {error && !usingMockFallback && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive flex gap-3 items-center">
              <AlertCircle className="size-5 shrink-0" />
              <div className="flex-1">
                <p className="font-medium">Error loading vehicles</p>
                <p className="text-xs text-muted-foreground">{error}</p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden animate-pulse">
                  <div className="aspect-video bg-muted" />
                  <CardHeader className="space-y-2">
                    <div className="h-5 w-2/3 bg-muted rounded" />
                    <div className="h-4 w-1/2 bg-muted rounded" />
                  </CardHeader>
                  <CardContent className="flex justify-between items-center pt-2">
                    <div className="h-5 w-1/4 bg-muted rounded" />
                    <div className="h-8 w-1/4 bg-muted rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : cars.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Car className="size-7" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">No cars available</h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                No vehicles match your current location or price filters. Try broadening your search.
              </p>
              {(activeLocation || activeMinPrice || activeMaxPrice) && (
                <Button variant="outline" onClick={handleClearFilters} className="mt-4">
                  Clear All Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {cars.map((car) => {
                const imageUrl = car.image_urls && car.image_urls.length > 0 ? car.image_urls[0] : null;

                return (
                  <Card key={car.id} className="overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                    {/* Image or gradient placeholder */}
                    <div className="relative aspect-video w-full bg-[linear-gradient(135deg,#e7eef4,#d8ebe6)] shrink-0 overflow-hidden">
                      {imageUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img 
                          src={imageUrl} 
                          alt={`${car.make} ${car.model}`}
                          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-[#0ea5a0]/10 text-muted-foreground">
                          <Car className="size-10 text-primary/40" />
                        </div>
                      )}
                      <div className="absolute right-3 top-3 rounded bg-background/95 px-2 py-0.5 text-xs font-semibold shadow-sm text-primary">
                        {car.year}
                      </div>
                    </div>

                    <CardHeader className="flex-1 pb-2">
                      <CardTitle className="text-lg font-bold truncate line-clamp-1">
                        {car.make} {car.model}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1.5 text-sm">
                        <MapPin className="size-3.5 text-primary shrink-0" />
                        <span className="truncate">{car.location}</span>
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="flex items-center justify-between pt-2 border-t mt-auto bg-muted/30">
                      <div>
                        <span className="text-lg font-bold text-foreground">${Number(car.daily_rate)}</span>
                        <span className="text-xs text-muted-foreground"> / day</span>
                      </div>
                      <Button asChild size="sm">
                        <Link href={`/cars/${car.id}`}>Details</Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default function BrowseCarsPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
        <PageHeading eyebrow="Browse cars" title="Loading..." description="Preparing available vehicles list." />
      </div>
    }>
      <BrowseCarsContent />
    </Suspense>
  );
}
