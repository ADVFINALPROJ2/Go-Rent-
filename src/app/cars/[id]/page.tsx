import { ShieldCheck, Fuel, Compass, Sparkles } from "lucide-react";
import { notFound } from "next/navigation";

import { PageHeading } from "@/components/page-heading";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BookingRequestForm } from "@/components/bookings/booking-request-form";
import { ReviewForm } from "@/components/reviews/review-form";
import { fetchAvailableCarById } from "@/lib/cars/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type CarDetailsPageProps = {
  params: Promise<{ id: string }>;
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export default async function CarDetailsPage({ params }: CarDetailsPageProps) {
  const { id } = await params;

  let car = null;
  let isSupabaseConfigured = true;

  try {
    car = await fetchAvailableCarById(id);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("Supabase is not configured")) {
      isSupabaseConfigured = false;
    }
  }

  // Fallback demo data if Supabase is not configured (to allow UI rendering and testing)
  if (!isSupabaseConfigured) {
    car = {
      id: id,
      owner_id: "demo-owner-123",
      title: "Tesla Model 3 (Demo)",
      description: "A premium electric sedan with excellent range and autopilot capabilities. This is a local demo preview because Supabase keys are not set.",
      make: "Tesla",
      model: "Model 3",
      year: 2023,
      location: "San Francisco, CA",
      daily_rate: 99,
      status: "available",
      image_urls: [],
      seats: 5,
      transmission: "Automatic",
      fuel_type: "Electric",
      owner: {
        id: "demo-owner-123",
        full_name: "Alex Johnson (Demo Host)",
        avatar_url: null,
        location: "San Francisco, CA",
      },
    };
  }

  if (!car) {
    return notFound();
  }

  // Fetch current user and booking info to check if they can leave a review
  let user = null;
  let hasCompletedBooking = false;
  let bookingId = "";
  let renterId = "";
  let ownerId = car.owner_id;

  const supabase = await createSupabaseServerClient();
  if (supabase) {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    user = authUser;

    if (user) {
      // Check if user has a completed booking for this car
      const { data: bookings } = await supabase
        .from("bookings")
        .select("id, renter_id, owner_id")
        .eq("car_id", id)
        .eq("renter_id", user.id)
        .eq("status", "completed")
        .limit(1);

      if (bookings && bookings.length > 0) {
        hasCompletedBooking = true;
        bookingId = bookings[0].id;
        renterId = bookings[0].renter_id;
        ownerId = bookings[0].owner_id;
      }
    }
  }

  // Setup disabled variables for ReviewForm
  let reviewDisabled = false;
  let reviewDisabledReason = "";

  if (!isSupabaseConfigured) {
    // If Supabase is not configured, run ReviewForm in demo mode with preview IDs
    reviewDisabled = false;
    bookingId = "preview-booking-id";
    renterId = "preview-renter-id";
  } else if (!user) {
    reviewDisabled = true;
    reviewDisabledReason = "Please log in to submit a review for this vehicle.";
  } else if (user.id === car.owner_id) {
    reviewDisabled = true;
    reviewDisabledReason = "You cannot review your own vehicle.";
  } else if (!hasCompletedBooking) {
    reviewDisabled = true;
    reviewDisabledReason = "Only renters who have completed a booking for this vehicle can leave a review.";
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_380px] lg:px-8">
      <section className="space-y-8">
        {/* Car Image Area */}
        <div className="group relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-md dark:border-slate-800 dark:bg-slate-900">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,#e2e8f0,#f8fafc_60%,#f1f5f9)] dark:bg-[linear-gradient(135deg,#0f172a,#1e293b_60%,#0f172a)]" />
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <Sparkles className="size-12 text-blue-500 animate-pulse mb-3" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{car.make} {car.model}</h3>
            <p className="text-sm text-slate-500 max-w-md mt-1">Vehicle image gallery will load here once photos are uploaded.</p>
          </div>
        </div>

        {/* Header/Title Info */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-200/50 dark:border-blue-900/30">
              <ShieldCheck className="size-3.5" />
              Verified Listing
            </span>
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              Year {car.year}
            </span>
          </div>
          <PageHeading
            eyebrow={`Daily rate: ${formatCurrency(car.daily_rate)}`}
            title={car.title}
            description={car.description || "No description provided."}
          />
        </div>

        {/* Specifications Grid */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold tracking-tight text-slate-950 dark:text-slate-50">Vehicle Specifications</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="border border-slate-200/60 bg-white/60 shadow-sm dark:border-slate-800/60 dark:bg-slate-950/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Compass className="size-4 text-blue-500" />
                  Transmission
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base font-bold text-slate-800 dark:text-slate-200">{car.transmission || "Automatic"}</p>
              </CardContent>
            </Card>

            <Card className="border border-slate-200/60 bg-white/60 shadow-sm dark:border-slate-800/60 dark:bg-slate-950/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="size-4 text-blue-500" />
                  Seats Capacity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base font-bold text-slate-800 dark:text-slate-200">{car.seats ? `${car.seats} Seats` : "5 Seats"}</p>
              </CardContent>
            </Card>

            <Card className="border border-slate-200/60 bg-white/60 shadow-sm dark:border-slate-800/60 dark:bg-slate-950/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Fuel className="size-4 text-blue-500" />
                  Fuel Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base font-bold text-slate-800 dark:text-slate-200">{car.fuel_type || "Gasoline"}</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Host Info */}
        {car.owner && (
          <Card className="border border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Hosted by {car.owner.full_name}</CardTitle>
              <CardDescription>Based in {car.owner.location || "Unknown location"}</CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* Reviews Section */}
        <hr className="border-slate-200 dark:border-slate-800" />
        <div id="reviews-section" className="space-y-6">
          <div className="space-y-1">
            <h3 className="text-xl font-bold tracking-tight text-slate-950 dark:text-slate-50">Reviews & Ratings</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Read feedback from previous renters or submit your own.
            </p>
          </div>

          {/* Render Review Form */}
          <ReviewForm
            bookingId={bookingId}
            carId={car.id}
            renterId={renterId || (user ? user.id : "")}
            ownerId={ownerId}
            disabled={reviewDisabled}
            disabledReason={reviewDisabledReason}
          />
        </div>
      </section>

      {/* Sidebar - Request Booking Form */}
      <aside className="space-y-4">
        {isSupabaseConfigured ? (
          <BookingRequestForm
            carId={car.id}
            ownerId={car.owner_id}
            dailyRate={Number(car.daily_rate)}
          />
        ) : (
          <Card className="border-amber-200 bg-amber-50/20 dark:border-amber-900/30">
            <CardHeader>
              <CardTitle className="text-base">Rental Booking (Demo Mode)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-slate-500">
                Booking forms and database transactions require Supabase.
              </p>
              <div className="rounded-lg border border-dashed border-amber-300 p-3 bg-amber-50/50 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-400">
                Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env file to enable live booking.
              </div>
            </CardContent>
          </Card>
        )}
      </aside>
    </div>
  );
}
