"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarCheck, CarFront, Loader2, MessageSquare } from "lucide-react";
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
import {
  cancelRenterBooking,
  getRenterBookings,
  type RenterBookingSummary,
} from "@/lib/actions/bookings";

type RenterBooking = RenterBookingSummary;

const activity = [
  {
    label: "Upcoming trips",
    value: "0",
    icon: <CalendarCheck className="size-5" aria-hidden="true" />,
    description: "Confirmed rentals",
  },
  {
    label: "Saved cars",
    value: "0",
    icon: <CarFront className="size-5" aria-hidden="true" />,
    description: "Shortlisted vehicles",
  },
  {
    label: "Unread messages",
    value: "0",
    icon: <MessageSquare className="size-5" aria-hidden="true" />,
    description: "Owner conversations",
  },
];

export default function RenterDashboardPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<RenterBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadBookings = useCallback(async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const bookingRows = await getRenterBookings();
      setBookings(bookingRows);
    } catch (err) {
      if (err instanceof Error && err.message === "NOT_AUTHENTICATED") {
        router.push("/login");
        return;
      }

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

  async function handleCancelBooking(booking: RenterBooking) {
    if (booking.status !== "pending") {
      setError("Only pending bookings can be cancelled.");
      return;
    }

    setProcessingId(booking.id);
    setError("");
    setSuccess("");

    try {
      await cancelRenterBooking(booking.id);
      setSuccess("Booking cancelled successfully.");
      await loadBookings();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel booking.");
    } finally {
      setProcessingId(null);
    }
  }

  const pendingBookings = bookings.filter((b) => b.status === "pending");
  const activeBookings = bookings.filter((b) => b.status === "approved");
  const pastBookings = bookings.filter((b) =>
    ["completed", "declined", "cancelled"].includes(b.status),
  );

  return (
    <DashboardShell
      eyebrow="Renter dashboard"
      title="Track trips, requests, and conversations."
      description="Renters will manage bookings, message owners, and review completed rentals from this area."
      actions={
        <Button asChild>
          <Link href="/browse">
            <CarFront aria-hidden="true" />
            Browse cars
          </Link>
        </Button>
      }
    >
      <div className="grid gap-6">
        <DashboardStatGrid stats={activity} />

        {error ? <AlertBanner variant="error" message={error} /> : null}
        {success ? <AlertBanner variant="success" message={success} /> : null}

        {loading ? (
          <Card>
            <CardContent className="flex items-center justify-center gap-3 py-10 text-sm text-muted-foreground">
              <Loader2 className="size-5 animate-spin" aria-hidden="true" />
              Loading your bookings…
            </CardContent>
          </Card>
        ) : null}

        {!loading && !error && (
          <>
            {/* Pending requests */}
            <Card className="bg-white dark:bg-zinc-950">
              <CardHeader>
                <CardTitle>Pending Requests</CardTitle>
                <CardDescription>
                  Booking requests waiting for owner review.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                {pendingBookings.length > 0 ? (
                  pendingBookings.map((booking) => (
                    <BookingStatusCard
                      key={booking.id}
                      bookingId={booking.id}
                      carId={booking.carId}
                      renterId={booking.renterId}
                      ownerId={booking.ownerId}
                      carTitle={booking.carTitle}
                      startDate={booking.startDate}
                      endDate={booking.endDate}
                      status={booking.status}
                      totalPrice={booking.totalPrice}
                      secondaryActions={
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => void handleCancelBooking(booking)}
                          disabled={processingId === booking.id}
                        >
                          {processingId === booking.id ? (
                            <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
                          ) : null}
                          Cancel
                        </Button>
                      }
                    />
                  ))
                ) : (
                  <BookingListEmpty variant="no-requests" />
                )}
              </CardContent>
            </Card>

            {/* Approved / Active bookings */}
            <Card className="bg-white dark:bg-zinc-950">
              <CardHeader>
                <CardTitle>Approved Bookings</CardTitle>
                <CardDescription>
                  Upcoming and active rentals.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                {activeBookings.length > 0 ? (
                  activeBookings.map((booking) => (
                    <BookingStatusCard
                      key={booking.id}
                      bookingId={booking.id}
                      carId={booking.carId}
                      renterId={booking.renterId}
                      ownerId={booking.ownerId}
                      carTitle={booking.carTitle}
                      startDate={booking.startDate}
                      endDate={booking.endDate}
                      status={booking.status}
                      totalPrice={booking.totalPrice}
                    />
                  ))
                ) : (
                  <BookingListEmpty variant="no-approved" />
                )}
              </CardContent>
            </Card>

            {/* Past bookings */}
            <Card className="bg-white dark:bg-zinc-950">
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
                      bookingId={booking.id}
                      carId={booking.carId}
                      renterId={booking.renterId}
                      ownerId={booking.ownerId}
                      carTitle={booking.carTitle}
                      startDate={booking.startDate}
                      endDate={booking.endDate}
                      status={booking.status}
                      totalPrice={booking.totalPrice}
                      showReviewAction={booking.status === "completed"}
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
