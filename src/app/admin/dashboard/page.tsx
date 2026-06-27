import { Activity, Ban, Car, Clock, ShieldCheck, Users } from "lucide-react";
import { redirect } from "next/navigation";

import {
  AdminDashboardActions,
  ListingsTable,
  UnauthorizedState,
  UsersTable,
} from "@/components/admin/admin-dashboard-shared";
import {
  DashboardEmptyState,
  DashboardShell,
  DashboardStatGrid,
} from "@/components/dashboard/dashboard-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAdminDashboardData } from "@/lib/admin/data";
import { getCurrentUser } from "@/lib/auth/session";

function RecentActivitySection() {
  return (
    <Card className="bg-white shadow-sm dark:bg-zinc-950">
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
        <CardDescription>
          Platform events such as signups, listing changes, and booking updates will appear here.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DashboardEmptyState
          icon={<Activity className="size-7" aria-hidden="true" />}
          title="No recent activity"
          description="Activity feed integration is pending. Admin actions and marketplace events will be summarized here later."
        />
      </CardContent>
    </Card>
  );
}

export default async function AdminDashboardPage() {
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

  const { users, listings, bookings } = getAdminDashboardData();

  const availableListings = listings.filter((listing) => listing.status === "available");
  const disabledListings = listings.filter((listing) => listing.status === "disabled");
  const pendingBookings = bookings.filter((booking) => booking.status === "pending");

  const metrics = [
    {
      label: "Total users",
      value: String(users.length),
      icon: <Users className="size-5" aria-hidden="true" />,
      description: "Registered profiles",
      href: "/admin/dashboard/users",
    },
    {
      label: "Total listings",
      value: String(listings.length),
      icon: <Car className="size-5" aria-hidden="true" />,
      description: "Owner vehicles",
      href: "/admin/dashboard/listings",
    },
    {
      label: "Available cars",
      value: String(availableListings.length),
      icon: <ShieldCheck className="size-5" aria-hidden="true" />,
      description: "Visible marketplace listings",
      href: "/admin/dashboard/listings/available",
    },
    {
      label: "Disabled cars",
      value: String(disabledListings.length),
      icon: <Ban className="size-5" aria-hidden="true" />,
      description: "Hidden by status",
      href: "/admin/dashboard/listings/disabled",
    },
    {
      label: "Pending bookings",
      value: String(pendingBookings.length),
      icon: <Clock className="size-5" aria-hidden="true" />,
      description: "Awaiting owner action",
      href: "/admin/dashboard/bookings/pending",
    },
  ];

  return (
    <DashboardShell
      eyebrow="Admin dashboard"
      title="Monitor Addis users, listings, and platform quality."
      description="Admins can review account health, local listing status, and pending marketplace activity from one workspace."
      actions={<AdminDashboardActions />}
    >
      <div className="grid gap-6">
        <section aria-labelledby="admin-overview-heading" className="grid gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white" id="admin-overview-heading">
              Overview
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-zinc-400">
              Live counts from the local SQLite users, cars, and bookings tables. Select any card to open its full admin page.
            </p>
          </div>
          <DashboardStatGrid className="sm:grid-cols-2 xl:grid-cols-5" stats={metrics} />
        </section>

        <Card className="bg-white shadow-sm dark:bg-zinc-950">
          <CardHeader>
            <CardTitle>User management</CardTitle>
            <CardDescription>
              Review platform users, roles, account status, and signup dates.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UsersTable currentAdminId={currentUser.id} users={users} />
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm dark:bg-zinc-950">
          <CardHeader>
            <CardTitle>Listing management</CardTitle>
            <CardDescription>
              Review vehicle listings and status. Destructive admin actions are placeholders until approved.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ListingsTable listings={listings} />
          </CardContent>
        </Card>

        <RecentActivitySection />
      </div>
    </DashboardShell>
  );
}
