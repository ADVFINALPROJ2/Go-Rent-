"use client";

import { useCallback, useEffect, useState } from "react";
import { Car, CircleDollarSign, Clock, List, Loader2, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { BookingListEmpty } from "@/components/bookings/booking-list-empty";
import { BookingStatusCard } from "@/components/bookings/booking-status-card";
import {
  DashboardShell,
  DashboardStatGrid,
} from "@/components/dashboard/dashboard-shell";
import { AlertBanner } from "@/components/ui/alert-banner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireOwnerSession } from "@/lib/auth/role-guards";
import type { BookingStatus, Database } from "@/lib/supabase/types";

type CarRow = Database["public"]["Tables"]["cars"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

type OwnerBooking = {
  id: string;
  ownerId: string;
  renterId: string;
  carId: string;
  carTitle: string;
  make: string;
  model: string;
  location: string;
  dailyRate: number;
  startDate: string;
  endDate: string;
  status: BookingStatus;
  totalPrice: number;
  message: string | null;
  renterName: string | null;
  renterEmail: string | null;
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export default function OwnerDashboardPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<OwnerBooking[]>([]);
  const [activeCarCount, setActiveCarCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadBookings = useCallback(async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const ownerSession = await requireOwnerSession(router);
      if (!ownerSession) {
        return;
      }

      const { supabase, user } = ownerSession;

      const { data: bookingRows, error: bookingsError } = await supabase
        .from("bookings")
        .select(
          "id, car_id, owner_id, renter_id, start_date, end_date, total_price, status, message, created_at",
        )
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

      if (bookingsError) {
        throw new Error(bookingsError.message);
      }

      if (!bookingRows?.length) {
        setBookings([]);
        setActiveCarCount(0);
        return;
      }

      const carIds = [...new Set(bookingRows.map((booking) => booking.car_id))];
      const renterIds = [...new Set(bookingRows.map((booking) => booking.renter_id))];

      const carsPromise =
        carIds.length > 0
          ? supabase
              .from("cars")
              .select("id, title, make, model, location, daily_rate")
              .in("id", carIds)
          : Promise.resolve({ data: [] as CarRow[], error: null });

      const profilesPromise =
        renterIds.length > 0
          ? supabase
              .from("profiles")
              .select("id, full_name")
              .in("id", renterIds)
          : Promise.resolve({ data: [] as ProfileRow[], error: null });

      const ownerCarsPromise = supabase
        .from("cars")
        .select("id")
        .eq("owner_id", user.id);

      const [carsResult, profilesResult, ownerCarsResult] = await Promise.all([
        carsPromise,
        profilesPromise,
        ownerCarsPromise,
      ]);

      if (carsResult.error) {
        throw new Error(carsResult.error.message);
      }

      if (profilesResult.error) {
        throw new Error(profilesResult.error.message);
      }

      if (ownerCarsResult.error) {
        throw new Error(ownerCarsResult.error.message);
      }

      const carMap = new Map(
        (carsResult.data ?? []).map((car) => [car.id, car]),
      );
      const profileMap = new Map(
        (profilesResult.data ?? []).map((profile) => [profile.id, profile]),
      );

      const mappedBookings: OwnerBooking[] = bookingRows.map((booking) => {
        const car = carMap.get(booking.car_id);
        const profile = profileMap.get(booking.renter_id);

        return {
          id: booking.id,
          ownerId: booking.owner_id,
          renterId: booking.renter_id,
          carId: booking.car_id,
          carTitle: car?.title ?? "Unknown vehicle",
          make: car?.make ?? "Unknown",
          model: car?.model ?? "Unknown",
          location: car?.location ?? "Location pending",
          dailyRate: Number(car?.daily_rate ?? 0),
          startDate: booking.start_date,
          endDate: booking.end_date,
          status: booking.status as BookingStatus,
          totalPrice: Number(booking.total_price),
          message: booking.message,
          renterName: profile?.full_name ?? null,
          renterEmail: null,
        };
      });

      setBookings(mappedBookings);
      setActiveCarCount(ownerCarsResult.data?.length ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadBookings();
    });
  }, [loadBookings]);

  async function handleBookingAction(booking: OwnerBooking, status: "approved" | "declined" | "completed") {
    if (status === "completed") {
      if (booking.status !== "approved") {
        setError("Only approved bookings can be marked as completed.");
        return;
      }
    } else if (booking.status !== "pending") {
      setError("Only pending requests can be approved or declined.");
      return;
    }

    setProcessingId(booking.id);
    setError("");
    setSuccess("");

    try {
      const ownerSession = await requireOwnerSession(router);
      if (!ownerSession) {
        return;
      }

      const { supabase, user } = ownerSession;

      const expectedCurrentStatus = status === "completed" ? "approved" : "pending";

      const { error: updateError } = await supabase
        .from("bookings")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", booking.id)
        .eq("owner_id", user.id)
        .eq("status", expectedCurrentStatus);

      if (updateError) {
        throw new Error(updateError.message);
      }

      setSuccess(
        status === "completed"
          ? "Booking marked as completed successfully."
          : `Booking ${status === "approved" ? "approved" : "declined"} successfully.`,
      );
      await loadBookings();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Booking update failed.");
    } finally {
      setProcessingId(null);
    }
  }

  const metrics = [
    {
      label: "Active cars",
      value: String(activeCarCount),
      icon: <Car className="size-5" aria-hidden="true" />,
      description: "Visible listings",
    },
    {
      label: "Pending requests",
      value: String(bookings.filter((booking) => booking.status === "pending").length),
      icon: <Clock className="size-5" aria-hidden="true" />,
      description: "Awaiting review",
    },
    {
      label: "Completed revenue",
      value: formatCurrency(
        bookings
          .filter((booking) => booking.status === "completed")
          .reduce((sum, booking) => sum + booking.totalPrice, 0),
      ),
      icon: <CircleDollarSign className="size-5" aria-hidden="true" />,
      description: "From completed rentals",
    },
  ];

  const pendingBookings = bookings.filter((booking) => booking.status === "pending");
  const activeBookings = bookings.filter((booking) => booking.status === "approved");
  const pastBookings = bookings.filter((booking) =>
    ["completed", "declined", "cancelled"].includes(booking.status),
  );

  return (
    <DashboardShell
      eyebrow="Owner dashboard"
      title="Manage vehicles and rental requests."
      description="Owners can review booking requests, approve or decline them, and track rentals from this area."
      actions={
        <>
          <Button asChild variant="outline">
            <Link href="/owner/dashboard/cars">
              <List aria-hidden="true" />
              Manage listings
            </Link>
          </Button>
          <Button asChild>
            <Link href="/owner/dashboard/cars/new">
              <Plus aria-hidden="true" />
              Add car
            </Link>
          </Button>
        </>
      }
    >
      <div className="grid gap-6">
        <DashboardStatGrid stats={metrics} />

        {error ? <AlertBanner variant="error" message={error} /> : null}
        {success ? <AlertBanner variant="success" message={success} /> : null}

        {loading ? (
          <Card>
            <CardContent className="flex items-center justify-center gap-3 py-10 text-sm text-muted-foreground">
              <Loader2 className="size-5 animate-spin" aria-hidden="true" />
              Loading your booking requests…
            </CardContent>
          </Card>
        ) : null}

        {!loading && !error && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Incoming Requests</CardTitle>
                <CardDescription>
                  Rental requests from renters waiting for your review.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                {pendingBookings.length > 0 ? (
                  pendingBookings.map((booking) => (
                    <BookingStatusCard
                      key={booking.id}
                      carTitle={`${booking.make} ${booking.model}`}
                      startDate={booking.startDate}
                      endDate={booking.endDate}
                      status={booking.status}
                      totalPrice={booking.totalPrice}
                      renterName={booking.renterName}
                      renterEmail={booking.renterEmail}
                      message={booking.message}
                      actions={
                        <>
                          <Button
                            size="sm"
                            onClick={() => void handleBookingAction(booking, "approved")}
                            disabled={processingId === booking.id}
                          >
                            {processingId === booking.id ? (
                              <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
                            ) : null}
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => void handleBookingAction(booking, "declined")}
                            disabled={processingId === booking.id}
                          >
                            {processingId === booking.id ? (
                              <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
                            ) : null}
                            Decline
                          </Button>
                        </>
                      }
                    />
                  ))
                ) : (
                  <BookingListEmpty variant="no-requests" />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Approved Bookings</CardTitle>
                <CardDescription>
                  Active and upcoming rentals for your vehicles.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                {activeBookings.length > 0 ? (
                  activeBookings.map((booking) => (
                    <BookingStatusCard
                      key={booking.id}
                      carTitle={`${booking.make} ${booking.model}`}
                      startDate={booking.startDate}
                      endDate={booking.endDate}
                      status={booking.status}
                      totalPrice={booking.totalPrice}
                      renterName={booking.renterName}
                      renterEmail={booking.renterEmail}
                      message={booking.message}
                    />
                  ))
                ) : (
                  <BookingListEmpty variant="no-approved" />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Past Bookings</CardTitle>
                <CardDescription>
                  Completed, declined, and cancelled bookings.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                {pastBookings.length > 0 ? (
                  pastBookings.map((booking) => (
                    <BookingStatusCard
                      key={booking.id}
                      carTitle={`${booking.make} ${booking.model}`}
                      startDate={booking.startDate}
                      endDate={booking.endDate}
                      status={booking.status}
                      totalPrice={booking.totalPrice}
                      renterName={booking.renterName}
                      renterEmail={booking.renterEmail}
                      message={booking.message}
                    />
                  ))
                ) : (
                  <BookingListEmpty variant="no-completed" />
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardShell>
  );
}
