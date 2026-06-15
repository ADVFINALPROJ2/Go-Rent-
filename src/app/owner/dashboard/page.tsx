import { Car, CircleDollarSign, Clock, List, Plus } from "lucide-react";
import Link from "next/link";

import {
  DashboardEmptyState,
  DashboardShell,
  DashboardStatGrid,
} from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";

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

export default function OwnerDashboardPage() {
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
        <DashboardEmptyState
          icon={<Car className="size-7" aria-hidden="true" />}
          title="No listing activity yet"
          description="Owner activity, recent rental requests, and listing performance will appear here once cars and bookings are active."
          action={
            <Button asChild>
              <Link href="/owner/dashboard/cars/new">
                <Plus aria-hidden="true" />
                Add first car
              </Link>
            </Button>
          }
        />
      </div>
    </DashboardShell>
  );
}
