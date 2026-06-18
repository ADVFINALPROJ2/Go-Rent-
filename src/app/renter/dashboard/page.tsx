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
import { createSupabaseServerClient } from "@/lib/supabase/server";

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
  carId?: string;
  renterId?: string;
  ownerId?: string;
  carTitle: string;
  startDate: string;
  endDate: string;
  status: BookingStatus;
  totalPrice: number;
};

const placeholderBookings: PlaceholderBooking[] = [
  {
    id: "preview-1",
    carId: "preview-car-1",
    renterId: "preview-renter-1",
    ownerId: "preview-owner-1",
    carTitle: "Toyota Camry 2023",
    startDate: "2026-07-01",
    endDate: "2026-07-05",
    status: "pending",
    totalPrice: 200,
  },
  {
    id: "preview-2",
    carId: "preview-car-2",
    renterId: "preview-renter-2",
    ownerId: "preview-owner-2",
    carTitle: "Honda Civic 2024",
    startDate: "2026-06-20",
    endDate: "2026-06-25",
    status: "approved",
    totalPrice: 300,
  },
  {
    id: "preview-3",
    carId: "preview-car-3",
    renterId: "preview-renter-3",
    ownerId: "preview-owner-3",
    carTitle: "Ford Mustang 2022",
    startDate: "2026-05-10",
    endDate: "2026-05-15",
    status: "completed",
    totalPrice: 500,
  },
  {
    id: "preview-4",
    carId: "preview-car-4",
    renterId: "preview-renter-4",
    ownerId: "preview-owner-4",
    carTitle: "Chevrolet Malibu 2023",
    startDate: "2026-06-01",
    endDate: "2026-06-03",
    status: "declined",
    totalPrice: 150,
  },
  {
    id: "preview-5",
    carId: "preview-car-5",
    renterId: "preview-renter-5",
    ownerId: "preview-owner-5",
    carTitle: "Hyundai Sonata 2024",
    startDate: "2026-06-10",
    endDate: "2026-06-12",
    status: "cancelled",
    totalPrice: 120,
  },
];
// END TEMPORARY

export default async function RenterDashboardPage() {
  let bookings: PlaceholderBooking[] = [];
  let isRealData = false;

  try {
    const supabase = await createSupabaseServerClient();
    if (supabase) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Fetch real renter bookings
        const { data: bookingsData, error } = await supabase
          .from("bookings")
          .select(`
            id,
            car_id,
            owner_id,
            renter_id,
            start_date,
            end_date,
            total_price,
            status,
            cars:cars(title)
          `)
          .eq("renter_id", user.id)
          .order("created_at", { ascending: false });

        if (bookingsData && !error) {
          bookings = bookingsData.map((b) => ({
            id: b.id,
            carId: b.car_id,
            ownerId: b.owner_id,
            renterId: b.renter_id,
            carTitle: b.cars ? (b.cars as any).title : "Unknown Vehicle",
            startDate: b.start_date,
            endDate: b.end_date,
            status: b.status,
            totalPrice: Number(b.total_price),
          }));
          isRealData = true;
        }
      }
    }
  } catch (err) {
    // Ignore errors and fallback to placeholders
  }

  // Use placeholders if no real bookings or not logged in
  if (!isRealData || bookings.length === 0) {
    bookings = placeholderBookings;
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
      </div>
    </DashboardShell>
  );
}
