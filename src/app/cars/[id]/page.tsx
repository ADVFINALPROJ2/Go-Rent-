import { AlertCircle, CalendarDays, Car, MapPin, UserRound } from "lucide-react";

import { BookingRequestForm } from "@/components/bookings/booking-request-form";
import { AvailabilityDisplay } from "@/components/cars/availability-display";
import { PageHeading } from "@/components/page-heading";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { fetchAvailableCarById, type CarWithOwner } from "@/lib/cars/queries";

type CarDetailsPageProps = {
  params: Promise<{ id?: string }>;
};

function formatDailyRate(rate: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(rate));
}

function DetailItem({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}

function NotFoundState() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12 sm:px-6 lg:px-8">
      <PageHeading
        eyebrow="Car details"
        title="Car not found"
        description="This listing may not exist, may have been removed, or may not currently be available."
      />
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12 sm:px-6 lg:px-8">
      <PageHeading
        eyebrow="Car details"
        title="Unable to load car details"
        description="There was a problem loading this listing from Supabase."
      />
      <Card className="border-destructive/30 bg-destructive/5">
        <CardContent className="flex items-start gap-3 p-6 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p>{message}</p>
        </CardContent>
      </Card>
    </div>
  );
}

function OwnerCard({ car }: { car: CarWithOwner }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Owner</CardTitle>
        <CardDescription>Basic owner information for this listing.</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center gap-3">
        {car.owner?.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={car.owner.avatar_url}
            alt={car.owner.full_name ?? "Owner avatar"}
            className="size-11 rounded-full object-cover"
          />
        ) : (
          <div className="flex size-11 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <UserRound className="size-5" aria-hidden="true" />
          </div>
        )}
        <div>
          <p className="font-medium">{car.owner?.full_name ?? "GoRent owner"}</p>
          <p className="text-sm text-muted-foreground">
            {car.owner?.location ?? "Location not provided"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function CarDetailsPage({ params }: CarDetailsPageProps) {
  const { id } = await params;

  if (!id) {
    return <NotFoundState />;
  }

  let car: CarWithOwner | null = null;

  try {
    car = await fetchAvailableCarById(id);
  } catch (err) {
    return (
      <ErrorState
        message={err instanceof Error ? err.message : "Failed to load car details."}
      />
    );
  }

  if (!car) {
    return <NotFoundState />;
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
      <section className="space-y-6">
        <div className="overflow-hidden rounded-lg border bg-muted">
          {car.image_urls.length > 0 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={car.image_urls[0]}
              alt={car.title}
              className="aspect-[16/9] w-full object-cover"
            />
          ) : (
            <div className="flex aspect-[16/9] items-center justify-center bg-[linear-gradient(135deg,#e7eef4,#f6e7c8_60%,#d8ebe6)]">
              <Car className="size-16 text-muted-foreground/50" aria-hidden="true" />
            </div>
          )}
        </div>

        <PageHeading
          eyebrow={car.status}
          title={car.title}
          description={`${car.make} ${car.model} - ${car.year}`}
        />

        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-6 text-muted-foreground">
              {car.description ?? "No description has been provided for this car."}
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-3">
          <DetailItem label="Make" value={car.make} />
          <DetailItem label="Model" value={car.model} />
          <DetailItem label="Year" value={car.year} />
          <DetailItem label="Status" value={car.status} />
          <DetailItem label="Transmission" value={car.transmission ?? "Not provided"} />
          <DetailItem label="Seats" value={car.seats ?? "Not provided"} />
          <DetailItem label="Fuel" value={car.fuel_type ?? "Not provided"} />
        </div>
      </section>

      <aside className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>{formatDailyRate(car.daily_rate)}/day</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <MapPin className="size-4" aria-hidden="true" />
              {car.location}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays className="size-4" aria-hidden="true" />
              Send a rental request for the dates you need.
            </p>
          </CardContent>
        </Card>

        <AvailabilityDisplay
          isAvailable={car.status === "available"}
          notes={
            car.status === "rented"
              ? "This car is currently rented out."
              : car.status === "unavailable"
                ? "The owner has marked this car as unavailable."
                : null
          }
        />

        <BookingRequestForm
          carId={car.id}
          ownerId={car.owner_id}
          dailyRate={car.daily_rate}
        />

        <OwnerCard car={car} />
      </aside>
    </div>
  );
}
