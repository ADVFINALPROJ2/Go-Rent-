import Link from "next/link";
import { ArrowLeft, CalendarDays, MapPin, MessageSquare, AlertCircle, Users, Settings, Fuel, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

type CarRow = Database["public"]["Tables"]["cars"]["Row"];

type CarDetailsPageProps = {
  params: Promise<{ id: string }>;
};

// Fallback mock data when Supabase is not configured or is empty
const MOCK_CARS: Partial<CarRow>[] = [
  {
    id: "mock-1",
    make: "Toyota",
    model: "Corolla",
    year: 2022,
    location: "Nairobi West",
    daily_rate: 45.00,
    status: "available",
    image_urls: [],
    description: "Extremely fuel-efficient sedan, perfect for city drives. Easy to park, very clean, and well-maintained. Includes Bluetooth audio and air conditioning.",
    seats: 5,
    transmission: "Automatic",
    fuel_type: "Petrol",
  },
  {
    id: "mock-2",
    make: "Subaru",
    model: "Forester",
    year: 2021,
    location: "Kilimani",
    daily_rate: 70.00,
    status: "available",
    image_urls: [],
    description: "Spacious AWD SUV suitable for upcountry trips and families. High ground clearance, huge boot space, and excellent safety features. Comes clean with a full tank of petrol.",
    seats: 5,
    transmission: "Automatic",
    fuel_type: "Petrol",
  },
  {
    id: "mock-3",
    make: "Nissan",
    model: "Leaf",
    year: 2020,
    location: "Westlands",
    daily_rate: 55.00,
    status: "available",
    image_urls: [],
    description: "Fully electric hatchback, smooth and whisper-quiet. Great for reducing carbon footprint. Charger adapter included, fits standard wall plugs. 250km range on full charge.",
    seats: 5,
    transmission: "Automatic",
    fuel_type: "Electric",
  },
  {
    id: "mock-4",
    make: "Honda",
    model: "Civic",
    year: 2023,
    location: "Mombasa Road",
    daily_rate: 50.00,
    status: "available",
    image_urls: [],
    description: "Sporty sedan with advanced safety features and premium sound. Very responsive engine, low fuel consumption, clean interior.",
    seats: 5,
    transmission: "Automatic",
    fuel_type: "Petrol",
  },
  {
    id: "mock-5",
    make: "Land Rover",
    model: "Defender",
    year: 2022,
    location: "Karen",
    daily_rate: 150.00,
    status: "available",
    image_urls: [],
    description: "Premium luxury off-road SUV. Travel anywhere in ultimate style. Built for durability, fully loaded with infotainment, leather seats, and premium sound system.",
    seats: 7,
    transmission: "Automatic",
    fuel_type: "Diesel",
  }
];

export default async function CarDetailsPage({ params }: CarDetailsPageProps) {
  const { id } = await params;
  const supabase = createSupabaseServerClient();
  let car: Partial<CarRow> | null = null;
  let isMock = false;
  let errorMsg: string | null = null;

  if (!supabase) {
    isMock = true;
    car = MOCK_CARS.find((c) => c.id === id) || null;
  } else {
    try {
      const { data, error } = await supabase
        .from("cars")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        throw error;
      }
      car = data;

      // If database returned no record, check if it matches a mock ID for local demo purposes
      if (!car) {
        car = MOCK_CARS.find((c) => c.id === id) || null;
        if (car) {
          isMock = true;
        }
      }
    } catch (err: unknown) {
      const errorDetails = err as Error;
      console.error("Error fetching car from Supabase:", errorDetails);
      // Fallback to mock data if it matches a mock ID
      car = MOCK_CARS.find((c) => c.id === id) || null;
      if (car) {
        isMock = true;
      } else {
        errorMsg = errorDetails.message || "Failed to load vehicle details.";
      }
    }
  }

  if (errorMsg) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 text-center space-y-4">
        <AlertCircle className="size-12 mx-auto text-destructive" />
        <h2 className="text-2xl font-bold">Failed to load vehicle</h2>
        <p className="text-muted-foreground">{errorMsg}</p>
        <Button asChild variant="outline">
          <Link href="/browse">
            <ArrowLeft className="mr-2 size-4" />
            Back to Browse
          </Link>
        </Button>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 text-center space-y-4">
        <AlertCircle className="size-12 mx-auto text-muted-foreground" />
        <h2 className="text-2xl font-bold">Vehicle Not Found</h2>
        <p className="text-muted-foreground">The vehicle you are looking for does not exist or has been removed.</p>
        <Button asChild variant="outline">
          <Link href="/browse">
            <ArrowLeft className="mr-2 size-4" />
            Back to Browse
          </Link>
        </Button>
      </div>
    );
  }

  const imageUrl = car.image_urls && car.image_urls.length > 0 ? car.image_urls[0] : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      {/* Back to browse navigation */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/browse" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="mr-2 size-4" />
          Back to all vehicles
        </Link>
        {isMock && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800 ring-1 ring-inset ring-amber-600/20">
            <AlertCircle className="size-3.5" />
            Showing Mock Fallback Data
          </span>
        )}
      </div>

      {/* Main details page content */}
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Left Column: Car Photos and Specs */}
        <section className="space-y-8">
          {/* Car Image Banner */}
          <div className="relative aspect-[16/9] w-full rounded-lg border bg-[linear-gradient(135deg,#e7eef4,#f6e7c8_60%,#d8ebe6)] overflow-hidden shadow-sm">
            {imageUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={imageUrl}
                alt={`${car.make} ${car.model}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-[#0ea5a0]/10 text-muted-foreground">
                <span className="text-lg font-medium text-primary/40">{car.make} {car.model} Details</span>
              </div>
            )}
            <div className="absolute left-4 top-4 rounded bg-background/95 px-3 py-1 text-sm font-semibold shadow-sm text-primary">
              {car.year} Model
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              {car.make} {car.model}
            </h1>
            <p className="flex items-center gap-2 text-muted-foreground text-sm">
              <MapPin className="size-4 text-primary shrink-0" aria-hidden="true" />
              {car.location}
            </p>
          </div>

          {/* Specifications Cards Grid */}
          <div className="grid gap-4 grid-cols-3">
            <Card>
              <CardHeader className="p-4 pb-1">
                <CardTitle className="text-xs text-muted-foreground font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <Settings className="size-3.5 text-primary" />
                  Transmission
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-base font-semibold">{car.transmission || "Automatic"}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4 pb-1">
                <CardTitle className="text-xs text-muted-foreground font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="size-3.5 text-primary" />
                  Seats
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-base font-semibold">{car.seats || "5"} Seats</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4 pb-1">
                <CardTitle className="text-xs text-muted-foreground font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <Fuel className="size-3.5 text-primary" />
                  Fuel Type
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-base font-semibold">{car.fuel_type || "Petrol"}</p>
              </CardContent>
            </Card>
          </div>

          {/* Description */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold border-b pb-2">Description</h3>
            <p className="text-muted-foreground leading-relaxed text-sm">
              {car.description || "No description provided for this vehicle listing. Contact the owner for more details."}
            </p>
          </div>

          {/* Guidelines / Trust Badges */}
          <div className="rounded-lg border bg-muted/20 p-4 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <ShieldCheck className="size-4 text-emerald-600" />
              GoRent Safety & Verification
            </h4>
            <ul className="text-xs text-muted-foreground space-y-1.5 list-disc list-inside">
              <li>Verified ownership and clean background checks.</li>
              <li>Fully insured for the duration of every rental agreement.</li>
              <li>Support team available for road assistance 24/7.</li>
            </ul>
          </div>
        </section>

        {/* Right Column: Request Card */}
        <aside className="space-y-4 h-fit lg:sticky lg:top-8">
          <Card className="border shadow-md">
            <CardHeader className="pb-4">
              <div className="flex items-baseline justify-between">
                <CardTitle className="text-2xl font-black">${Number(car.daily_rate)}</CardTitle>
                <span className="text-sm text-muted-foreground"> / day</span>
              </div>
            </CardHeader>
            <CardContent className="grid gap-5">
              <div className="rounded-md bg-muted/40 p-3.5 space-y-3 border">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <CalendarDays className="size-4 text-primary shrink-0" aria-hidden="true" />
                  <div>
                    <p className="font-semibold text-foreground">Rental Dates</p>
                    <p className="text-[11px] mt-0.5">Selectable booking calendar will load here.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground border-t pt-2">
                  <MapPin className="size-4 text-primary shrink-0" aria-hidden="true" />
                  <div>
                    <p className="font-semibold text-foreground">Pickup Location</p>
                    <p className="text-[11px] mt-0.5">{car.location}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="owner-msg" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Message the Owner</label>
                <Textarea 
                  id="owner-msg"
                  placeholder="Introduce yourself, mention your plans, and request dates..." 
                  className="min-h-[100px] resize-none text-sm"
                />
              </div>

              {/* Placeholder button as requested */}
              <Button className="w-full font-semibold shadow-sm" disabled>
                <MessageSquare className="size-4 mr-2" aria-hidden="true" />
                Request Rental
              </Button>
              <p className="text-[10px] text-center text-muted-foreground mt-1 leading-normal">
                You won&apos;t be charged yet. Requesting is a reservation request that the owner must approve.
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
