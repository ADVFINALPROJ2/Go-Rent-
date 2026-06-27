import Link from "next/link";
import { redirect } from "next/navigation";

import {
  AdminDashboardActions,
  BookingsTable,
  UnauthorizedState,
} from "@/components/admin/admin-dashboard-shared";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import { getAdminDashboardData } from "@/lib/admin/data";
import { getCurrentUser } from "@/lib/auth/session";

export default async function AdminPendingBookingsPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  if (currentUser.status !== "active") {
    return <UnauthorizedState isDisabled />;
  }

  if (currentUser.role !== "admin") {
    return <UnauthorizedState />;
  }

  const { bookings } = getAdminDashboardData();
  const pendingBookings = bookings.filter((booking) => booking.status === "pending");

  return (
    <DashboardShell
      eyebrow="Admin bookings"
      title="Pending booking requests"
      description="Booking requests that are still waiting for owner approval or decline."
      actions={
        <>
          <Button asChild variant="outline">
            <Link href="/admin/dashboard">Overview</Link>
          </Button>
          <AdminDashboardActions />
        </>
      }
    >
      <BookingsTable bookings={pendingBookings} />
    </DashboardShell>
  );
}
