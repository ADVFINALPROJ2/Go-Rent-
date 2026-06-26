import {
  Ban,
  Car,
  Clock,
  Eye,
  ShieldCheck,
  Users,
} from "lucide-react";
import { desc } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";

import {
  DashboardEmptyState,
  DashboardShell,
  DashboardStatGrid,
} from "@/components/dashboard/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/db/client";
import {
  cars as carsTable,
  users as usersTable,
} from "@/db/schema";
import type { AccountStatus, CarStatus, UserRole } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { cn } from "@/lib/utils";

type UserRecord = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: UserRole;
  account_status: AccountStatus;
  created_at: string;
};

type ListingRecord = {
  id: string;
  owner_id: string;
  title: string;
  make: string;
  model: string;
  location: string;
  daily_rate: number;
  status: CarStatus;
  created_at: string;
  ownerName: string;
};

const roleStyles: Record<UserRole, string> = {
  admin: "border-blue-200 bg-blue-50 text-blue-700",
  owner: "border-amber-200 bg-amber-50 text-amber-700",
  renter: "border-sky-200 bg-sky-50 text-sky-700",
};

const accountStatusStyles: Record<AccountStatus, string> = {
  active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  disabled: "border-red-200 bg-red-50 text-red-700",
};

const carStatusStyles: Record<CarStatus, string> = {
  available: "border-emerald-200 bg-emerald-50 text-emerald-700",
  disabled: "border-red-200 bg-red-50 text-red-700",
  rented: "border-blue-200 bg-blue-50 text-blue-700",
  draft: "border-slate-200 bg-slate-50 text-slate-700",
  unavailable: "border-amber-200 bg-amber-50 text-amber-700",
  archived: "border-slate-200 bg-slate-50 text-slate-700",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function StatusBadge({
  children,
  className,
}: {
  children: string;
  className: string;
}) {
  return (
    <Badge variant="secondary" className={cn("border capitalize", className)}>
      {children}
    </Badge>
  );
}

function UnauthorizedState({ isDisabled = false }: { isDisabled?: boolean }) {
  return (
    <DashboardShell
      eyebrow="Admin dashboard"
      title="Admin access required."
      description="This area is reserved for active GoRent administrators."
      actions={
        <Button asChild variant="outline">
          <Link href="/">Return home</Link>
        </Button>
      }
    >
      <DashboardEmptyState
        icon={
          isDisabled ? (
            <Ban className="size-7" aria-hidden="true" />
          ) : (
            <ShieldCheck className="size-7" aria-hidden="true" />
          )
        }
        title={isDisabled ? "Account disabled" : "You are not an admin"}
        description={
          isDisabled
            ? "Your account is not active, so admin tools are unavailable."
            : "Sign in with an active admin account to review platform users and listings."
        }
      />
    </DashboardShell>
  );
}

function UsersTable({ users }: { users: UserRecord[] }) {
  if (users.length === 0) {
    return (
      <DashboardEmptyState
        icon={<Users className="size-7" aria-hidden="true" />}
        title="No users found"
        description="User profiles will appear here after accounts are created."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-zinc-800">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-zinc-900 dark:text-zinc-400">
            <tr>
              <th className="px-4 py-3 font-semibold">User</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Role</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Joined</th>
              <th className="px-4 py-3 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white dark:divide-zinc-800 dark:bg-zinc-950">
            {users.map((user) => (
              <tr key={user.id} className="align-top">
                <td className="px-4 py-3">
                  <p className="font-semibold text-slate-950 dark:text-white">
                    {user.full_name || "Unnamed user"}
                  </p>
                  <p className="mt-1 max-w-44 truncate text-xs text-slate-500">{user.id}</p>
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-zinc-300">
                  {user.email || "No email recorded"}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge className={roleStyles[user.role]}>{user.role}</StatusBadge>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge className={accountStatusStyles[user.account_status]}>
                    {user.account_status}
                  </StatusBadge>
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-zinc-300">{formatDate(user.created_at)}</td>
                <td className="px-4 py-3">
                  <Button size="sm" variant="outline" disabled>
                    View user
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ListingsTable({ listings }: { listings: ListingRecord[] }) {
  if (listings.length === 0) {
    return (
      <DashboardEmptyState
        icon={<Car className="size-7" aria-hidden="true" />}
        title="No listings found"
        description="Vehicle listings will appear here once owners add cars."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-zinc-800">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-zinc-900 dark:text-zinc-400">
            <tr>
              <th className="px-4 py-3 font-semibold">Listing</th>
              <th className="px-4 py-3 font-semibold">Owner</th>
              <th className="px-4 py-3 font-semibold">Location</th>
              <th className="px-4 py-3 font-semibold">Daily rate</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Created</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white dark:divide-zinc-800 dark:bg-zinc-950">
            {listings.map((listing) => (
              <tr key={listing.id} className="align-top">
                <td className="px-4 py-3">
                  <p className="font-semibold text-slate-950 dark:text-white">
                    {listing.make} {listing.model}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{listing.title}</p>
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-zinc-300">{listing.ownerName}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-zinc-300">{listing.location}</td>
                <td className="px-4 py-3 font-semibold text-slate-950 dark:text-white">
                  {formatCurrency(Number(listing.daily_rate))}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge className={carStatusStyles[listing.status]}>
                    {listing.status}
                  </StatusBadge>
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-zinc-300">{formatDate(listing.created_at)}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/cars/${listing.id}`}>
                        <Eye aria-hidden="true" />
                        View
                      </Link>
                    </Button>
                    <Button size="sm" variant="outline" disabled>
                      Disable
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
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

  const [userRows, profileRows, carRows, bookingRows] = [
    db.query.users.findMany({ orderBy: desc(usersTable.createdAt) }).sync(),
    db.query.profiles.findMany().sync(),
    db.query.cars.findMany({ orderBy: desc(carsTable.createdAt) }).sync(),
    db.query.bookings.findMany().sync(),
  ];

  const profileMap = new Map(profileRows.map((profile) => [profile.userId, profile]));
  const users: UserRecord[] = userRows.map((user) => {
    const profile = profileMap.get(user.id);

    return {
      id: user.id,
      full_name: profile?.fullName ?? null,
      email: user.email,
      role: user.role,
      account_status: user.status,
      created_at: user.createdAt,
    };
  });

  const ownerNameMap = new Map(
    profileRows.map((profile) => [profile.userId, profile.fullName || "Unnamed owner"]),
  );

  const listings: ListingRecord[] = carRows.map((car) => ({
    id: car.id,
    owner_id: car.ownerId,
    title: car.title,
    make: car.make,
    model: car.model,
    location: car.location,
    daily_rate: car.dailyRate,
    status: car.status,
    created_at: car.createdAt,
    ownerName: ownerNameMap.get(car.ownerId) ?? "Unknown owner",
  }));

  const availableListings = listings.filter((listing) => listing.status === "available");
  const disabledListings = listings.filter((listing) => listing.status === "disabled");
  const pendingBookings = bookingRows.filter((booking) => booking.status === "pending");

  const metrics = [
    {
      label: "Total users",
      value: String(users.length),
      icon: <Users className="size-5" aria-hidden="true" />,
      description: "Registered profiles",
    },
    {
      label: "Total listings",
      value: String(listings.length),
      icon: <Car className="size-5" aria-hidden="true" />,
      description: "Owner vehicles",
    },
    {
      label: "Available cars",
      value: String(availableListings.length),
      icon: <ShieldCheck className="size-5" aria-hidden="true" />,
      description: "Visible marketplace listings",
    },
    {
      label: "Disabled cars",
      value: String(disabledListings.length),
      icon: <Ban className="size-5" aria-hidden="true" />,
      description: "Hidden by status",
    },
    {
      label: "Pending bookings",
      value: String(pendingBookings.length),
      icon: <Clock className="size-5" aria-hidden="true" />,
      description: "Awaiting owner action",
    },
  ];

  return (
    <DashboardShell
      eyebrow="Admin dashboard"
      title="Monitor users, listings, and platform quality."
      description="Admins can review account health, listing status, and pending marketplace activity from one workspace."
    >
      <div className="grid gap-6">
        <DashboardStatGrid stats={metrics} />

        <Card className="bg-white shadow-sm dark:bg-zinc-950">
          <CardHeader>
            <CardTitle>User management</CardTitle>
            <CardDescription>
              Review platform users, roles, account status, and signup dates.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UsersTable users={users} />
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
      </div>
    </DashboardShell>
  );
}
