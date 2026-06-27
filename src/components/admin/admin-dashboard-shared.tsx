import {
  Ban,
  CalendarDays,
  Car,
  Eye,
  ShieldCheck,
  Trash2,
  Users,
} from "lucide-react";
import Link from "next/link";

import {
  deleteAdminListing,
  deleteAdminUser,
  updateAdminListingStatus,
  updateAdminUserStatus,
} from "@/app/admin/actions";
import {
  DashboardEmptyState,
  DashboardShell,
} from "@/components/dashboard/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type {
  AdminBookingRecord,
  AdminListingRecord,
  AdminUserRecord,
} from "@/lib/admin/data";
import type { AccountStatus, BookingStatus, CarStatus, UserRole } from "@/db/schema";
import { cn, formatBirr } from "@/lib/utils";

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

const bookingStatusStyles: Record<BookingStatus, string> = {
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  approved: "border-blue-200 bg-blue-50 text-blue-700",
  declined: "border-red-200 bg-red-50 text-red-700",
  completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  cancelled: "border-slate-200 bg-slate-50 text-slate-700",
};

export function formatAdminDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
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

export function UnauthorizedState({ isDisabled = false }: { isDisabled?: boolean }) {
  return (
    <DashboardShell
      eyebrow="Admin dashboard"
      title="Admin access required."
      description="This area is reserved for active GoRent administrators."
      actions={
        <Button asChild variant="outline">
          <Link href="/admin/login">Admin login</Link>
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

export function UsersTable({
  users,
  currentAdminId,
}: {
  users: AdminUserRecord[];
  currentAdminId?: string;
}) {
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
              <th className="px-4 py-3 font-semibold">Actions</th>
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
                <td className="px-4 py-3 text-slate-600 dark:text-zinc-300">
                  {formatAdminDate(user.created_at)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/admin/users/${user.id}`}>
                        <Eye aria-hidden="true" />
                        View
                      </Link>
                    </Button>
                    <form
                      action={updateAdminUserStatus.bind(
                        null,
                        user.id,
                        user.account_status === "active" ? "disabled" : "active",
                      )}
                    >
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={user.id === currentAdminId && user.account_status === "active"}
                        title={
                          user.id === currentAdminId
                            ? "You cannot disable your own admin account"
                            : undefined
                        }
                        type="submit"
                      >
                        <Ban aria-hidden="true" />
                        {user.account_status === "active" ? "Disable" : "Enable"}
                      </Button>
                    </form>
                    <form action={deleteAdminUser.bind(null, user.id)}>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={user.id === currentAdminId}
                        title={
                          user.id === currentAdminId
                            ? "You cannot delete your own admin account"
                            : undefined
                        }
                        type="submit"
                      >
                        Delete
                      </Button>
                    </form>
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

export function ListingsTable({ listings }: { listings: AdminListingRecord[] }) {
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
                  {formatBirr(Number(listing.daily_rate), "day")}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge className={carStatusStyles[listing.status]}>
                    {listing.status}
                  </StatusBadge>
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-zinc-300">
                  {formatAdminDate(listing.created_at)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/cars/${listing.id}`}>
                        <Eye aria-hidden="true" />
                        View
                      </Link>
                    </Button>
                    <form
                      action={updateAdminListingStatus.bind(
                        null,
                        listing.id,
                        listing.status === "disabled" ? "available" : "disabled",
                      )}
                    >
                      <Button size="sm" variant="outline" type="submit">
                        {listing.status === "disabled" ? "Enable" : "Disable"}
                      </Button>
                    </form>
                    <form action={deleteAdminListing.bind(null, listing.id)}>
                      <Button size="sm" variant="outline" type="submit">
                        <Trash2 aria-hidden="true" />
                        Delete
                      </Button>
                    </form>
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

export function BookingsTable({ bookings }: { bookings: AdminBookingRecord[] }) {
  if (bookings.length === 0) {
    return (
      <DashboardEmptyState
        icon={<CalendarDays className="size-7" aria-hidden="true" />}
        title="No bookings found"
        description="Booking requests will appear here as renters request vehicles."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-zinc-800">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-zinc-900 dark:text-zinc-400">
            <tr>
              <th className="px-4 py-3 font-semibold">Booking</th>
              <th className="px-4 py-3 font-semibold">Renter</th>
              <th className="px-4 py-3 font-semibold">Owner</th>
              <th className="px-4 py-3 font-semibold">Dates</th>
              <th className="px-4 py-3 font-semibold">Total</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white dark:divide-zinc-800 dark:bg-zinc-950">
            {bookings.map((booking) => (
              <tr key={booking.id} className="align-top">
                <td className="px-4 py-3">
                  <p className="font-semibold text-slate-950 dark:text-white">{booking.carTitle}</p>
                  <p className="mt-1 max-w-44 truncate text-xs text-slate-500">{booking.id}</p>
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-zinc-300">{booking.renterName}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-zinc-300">{booking.ownerName}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-zinc-300">
                  {booking.startDate} to {booking.endDate}
                </td>
                <td className="px-4 py-3 font-semibold text-slate-950 dark:text-white">
                  {formatBirr(booking.totalPrice, "ETB")}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge className={bookingStatusStyles[booking.status]}>
                    {booking.status}
                  </StatusBadge>
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-zinc-300">
                  {formatAdminDate(booking.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
