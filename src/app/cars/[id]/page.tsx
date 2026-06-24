import { ShieldCheck, Fuel, Compass, Sparkles, MapPin, CarFront } from "lucide-react";
import { notFound } from "next/navigation";

import { PageHeading } from "@/components/page-heading";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BookingRequestForm } from "@/components/bookings/booking-request-form";
import { ReviewsSection } from "@/components/reviews/reviews-section";
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

  const carImageUrl = car.image_urls?.[0] ?? null;

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_390px] lg:px-8">
      <section className="space-y-8">
        {/* Car Image Area */}
        <div className="group relative aspect-[16/9] w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-100 shadow-xl shadow-sky-950/10">
          {carImageUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={carImageUrl}
              alt={car.title}
              className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <>
              <div className="absolute inset-0 bg-[linear-gradient(135deg,#e0f2fe,#f8fafc_60%,#dbeafe)]" />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <CarFront className="mb-3 size-16 text-primary/45" aria-hidden="true" />
                <h3 className="text-lg font-bold text-slate-800">{car.make} {car.model}</h3>
                <p className="mt-1 max-w-md text-sm text-slate-500">
                  Vehicle image gallery will load here once photos are uploaded.
                </p>
              </div>
            </>
          )}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/75 to-transparent p-5 text-white">
            <p className="text-sm font-medium text-sky-100">Available rental</p>
            <h2 className="mt-1 text-2xl font-bold">{car.make} {car.model}</h2>
          </div>
        </div>

        {/* Header/Title Info */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/50 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
              <ShieldCheck className="size-3.5" />
              Verified Listing
            </span>
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold capitalize text-slate-700">
              {car.status}
            </span>
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
              Year {car.year}
            </span>
          </div>
          <PageHeading
            eyebrow={`Daily rate: ${formatCurrency(car.daily_rate)}`}
            title={car.title}
            description={car.description || "No description provided."}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <MapPin className="size-5 text-primary" aria-hidden="true" />
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">Pickup area</p>
                <p className="text-sm font-bold text-slate-950">{car.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <Sparkles className="size-5 text-primary" aria-hidden="true" />
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">Price per day</p>
                <p className="text-sm font-bold text-slate-950">{formatCurrency(car.daily_rate)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Specifications Grid */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-950">Vehicle Specifications</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="border border-slate-200/60 bg-white shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-1.5 text-sm font-semibold text-slate-500">
                  <Compass className="size-4 text-blue-500" />
                  Transmission
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base font-bold text-slate-800">{car.transmission || "Automatic"}</p>
              </CardContent>
            </Card>

            <Card className="border border-slate-200/60 bg-white shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-1.5 text-sm font-semibold text-slate-500">
                  <ShieldCheck className="size-4 text-blue-500" />
                  Seats Capacity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base font-bold text-slate-800">{car.seats ? `${car.seats} Seats` : "5 Seats"}</p>
              </CardContent>
            </Card>

            <Card className="border border-slate-200/60 bg-white shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-1.5 text-sm font-semibold text-slate-500">
                  <Fuel className="size-4 text-blue-500" />
                  Fuel Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base font-bold text-slate-800">{car.fuel_type || "Gasoline"}</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Host Info */}
        {car.owner && (
          <Card className="border border-sky-100 bg-sky-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Hosted by {car.owner.full_name}</CardTitle>
              <CardDescription>Based in {car.owner.location || "Unknown location"}</CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* Reviews Section */}
        <hr className="border-slate-200" />
        <ReviewsSection
          carId={car.id}
          reviewForm={{
            bookingId,
            renterId: renterId || (user ? user.id : ""),
            ownerId,
            disabled: reviewDisabled,
            disabledReason: reviewDisabledReason,
          }}
        />
      </section>

      {/* Sidebar - Request Booking Form */}
      <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
        <Card className="border-sky-100 bg-white shadow-xl shadow-sky-950/10">
          <CardHeader>
            <CardTitle className="text-3xl text-primary">
              {formatCurrency(car.daily_rate)}
              <span className="text-sm font-medium text-slate-500">/day</span>
            </CardTitle>
            <CardDescription>
              Request your dates and the owner can approve or decline the booking.
            </CardDescription>
          </CardHeader>
        </Card>
        {isSupabaseConfigured ? (
          <BookingRequestForm
            carId={car.id}
            ownerId={car.owner_id}
            dailyRate={Number(car.daily_rate)}
          />
        ) : (
          <Card className="border-amber-200 bg-amber-50/20">
            <CardHeader>
              <CardTitle className="text-base">Rental Booking (Demo Mode)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-slate-500">
                Booking forms and database transactions require Supabase.
              </p>
              <div className="rounded-lg border border-dashed border-amber-300 bg-amber-50/50 p-3 text-xs text-amber-800">
                Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env file to enable live booking.
              </div>
            </CardContent>
          </Card>
        )}
      </aside>
    </div>
  );
}
