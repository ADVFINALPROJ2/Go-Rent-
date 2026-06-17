import { CalendarCheck, CarFront, MessageSquare } from "lucide-react";
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
    id: "preview-1",
    carTitle: "Toyota Camry 2023",
    startDate: "2026-07-01",
    endDate: "2026-07-05",
    status: "pending",
    totalPrice: 200,
  },
  {
    id: "preview-2",
    carTitle: "Honda Civic 2024",
    startDate: "2026-06-20",
    endDate: "2026-06-25",
    status: "approved",
    totalPrice: 300,
  },
  {
    id: "preview-3",
    carTitle: "Ford Mustang 2022",
    startDate: "2026-05-10",
    endDate: "2026-05-15",
    status: "completed",
    totalPrice: 500,
  },
  {
    id: "preview-4",
    carTitle: "Chevrolet Malibu 2023",
    startDate: "2026-06-01",
    endDate: "2026-06-03",
    status: "declined",
    totalPrice: 150,
  },
  {
    id: "preview-5",
    carTitle: "Hyundai Sonata 2024",
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

export default function RenterDashboardPage() {
  // TEMPORARY: Replace these with real Supabase data
  const pendingBookings = filterByStatus(["pending"]);
  const activeBookings = filterByStatus(["approved"]);
  const pastBookings = filterByStatus(["completed", "declined", "cancelled"]);
  // END TEMPORARY

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

        {/* Pending requests */}
        <Card>
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

        {/* Approved / Active bookings */}
        <Card>
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
