import { CalendarCheck, CarFront, MessageSquare } from "lucide-react";
import Link from "next/link";

import {
  DashboardEmptyState,
  DashboardShell,
  DashboardStatGrid,
} from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";

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
        <DashboardEmptyState
          icon={<CalendarCheck className="size-7" aria-hidden="true" />}
          title="No rental activity yet"
          description="Upcoming trips, pending requests, and recent messages will appear here after booking features are connected."
          action={
            <Button asChild variant="outline">
              <Link href="/browse">Find a car</Link>
            </Button>
          }
        />
      </div>
    </DashboardShell>
  );
}
