import { Car, CircleDollarSign, Clock, List, Plus } from "lucide-react";
import Link from "next/link";

import { BookingListEmpty } from "@/components/bookings/booking-list-empty";
import { BookingStatusCard } from "@/components/bookings/booking-status-card";
import {
  DashboardShell,
  DashboardStatGrid,
} from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { BookingStatus } from "@/lib/supabase/types";

const metrics = [
  {
    label: "Active cars",
    value: "0",
    icon: <Car className="size-5" aria-hidden="true" />,
    description: "Visible listings",
  },
  {
    label: "Pending requests",
    value: "0",
    icon: <Clock className="size-5" aria-hidden="true" />,
    description: "Awaiting review",
  },
  {
    label: "Monthly revenue",
    value: "$0",
    icon: <CircleDollarSign className="size-5" aria-hidden="true" />,
    description: "Placeholder total",
  },
];

// TEMPORARY: placeholder data for layout preview — replace with Supabase query
type PlaceholderBooking = {
  id: string;
  carTitle: string;
  startDate: string;
  endDate: string;
  status: BookingStatus;
  totalPrice: number;
};

const placeholderBookings: PlaceholderBooking[] = [
  {
    id: "owner-preview-1",
    carTitle: "My Toyota Camry 2023",
    startDate: "2026-07-01",
    endDate: "2026-07-05",
    status: "pending",
    totalPrice: 200,
  },
  {
    id: "owner-preview-2",
    carTitle: "My Honda Civic 2024",
    startDate: "2026-06-20",
    endDate: "2026-06-25",
    status: "approved",
    totalPrice: 300,
  },
  {
    id: "owner-preview-3",
    carTitle: "My Ford Mustang 2022",
    startDate: "2026-05-10",
    endDate: "2026-05-15",
    status: "completed",
    totalPrice: 500,
  },
  {
    id: "owner-preview-4",
    carTitle: "My Chevrolet Malibu 2023",
    startDate: "2026-06-01",
    endDate: "2026-06-03",
    status: "declined",
    totalPrice: 150,
  },
  {
    id: "owner-preview-5",
    carTitle: "My Hyundai Sonata 2024",
    startDate: "2026-06-10",
    endDate: "2026-06-12",
    status: "cancelled",
    totalPrice: 120,
  },
];
// END TEMPORARY

/**
 * Filters placeholder bookings by status group.
 * In production, replace with a Supabase query.
 */
function filterByStatus(statuses: BookingStatus[]) {
  return placeholderBookings.filter((b) => statuses.includes(b.status));
}

export default function OwnerDashboardPage() {
  // TEMPORARY: Replace these with real Supabase data
  const pendingBookings = filterByStatus(["pending"]);
  const activeBookings = filterByStatus(["approved"]);
  const pastBookings = filterByStatus(["completed", "declined", "cancelled"]);
  // END TEMPORARY

  return (
    <DashboardShell
      eyebrow="Owner dashboard"
      title="Manage vehicles and rental requests."
      description="Owners will list cars, review booking requests, and track completed rentals here."
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

        {/* Incoming requests */}
        <Card className="bg-white">
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
                  carTitle={booking.carTitle}
                  startDate={booking.startDate}
                  endDate={booking.endDate}
                  status={booking.status}
                  totalPrice={booking.totalPrice}
                />
              ))
            ) : (
              <BookingListEmpty variant="no-requests" />
            )}
          </CardContent>
        </Card>

        {/* Approved bookings */}
        <Card className="bg-white">
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
        <Card className="bg-white">
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
                  carTitle={booking.carTitle}
                  startDate={booking.startDate}
                  endDate={booking.endDate}
                  status={booking.status}
                  totalPrice={booking.totalPrice}
                />
              ))
            ) : (
              <BookingListEmpty variant="no-completed" />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
