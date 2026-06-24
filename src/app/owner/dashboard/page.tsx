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
import {
  getOwnerDashboardBookings,
  updateOwnerBookingStatus,
  type OwnerBookingSummary,
} from "@/lib/actions/bookings";
import { requireOwnerSession } from "@/lib/auth/role-guards";

type OwnerBooking = OwnerBookingSummary;

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

      const dashboardBookings = await getOwnerDashboardBookings();
      setBookings(dashboardBookings.bookings);
      setActiveCarCount(dashboardBookings.activeCarCount);
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

      await updateOwnerBookingStatus(booking.id, status);
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
                      actions={
                        <Button
                          size="sm"
                          onClick={() => void handleBookingAction(booking, "completed")}
                          disabled={processingId === booking.id}
                        >
                          {processingId === booking.id ? (
                            <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
                          ) : null}
                          Mark Completed
                        </Button>
                      }
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
