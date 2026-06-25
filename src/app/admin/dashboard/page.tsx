import {
  Activity,
  AlertTriangle,
  Ban,
  Car,
  Clock,
  Eye,
  ShieldCheck,
  Users,
} from "lucide-react";
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
import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from "@/lib/supabase/server";
import type { AccountStatus, CarStatus, Database, ProfileRole } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

type ProfileRow = Pick<
  Database["public"]["Tables"]["profiles"]["Row"],
  "id" | "full_name" | "role" | "account_status" | "created_at"
>;

type CarRow = Pick<
  Database["public"]["Tables"]["cars"]["Row"],
  | "id"
  | "owner_id"
  | "title"
  | "make"
  | "model"
  | "location"
  | "daily_rate"
  | "status"
  | "created_at"
>;

type BookingRow = Pick<
  Database["public"]["Tables"]["bookings"]["Row"],
  "id" | "status"
>;

type UserRecord = ProfileRow & {
  email: string | null;
};

type ListingRecord = CarRow & {
  ownerName: string;
};

const roleStyles: Record<ProfileRole, string> = {
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

function SetupState({ message }: { message: string }) {
  return (
    <DashboardShell
      eyebrow="Admin dashboard"
      title="Admin tools need Supabase setup."
      description="Add the required environment variables before reviewing users and listings."
    >
      <DashboardEmptyState
        icon={<AlertTriangle className="size-7" aria-hidden="true" />}
        title="Supabase is not configured"
        description={message}
      />
    </DashboardShell>
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

function RecentActivitySection() {
  return (
    <Card className="bg-white shadow-sm">
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
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">User</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Role</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Joined</th>
              <th className="px-4 py-3 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {users.map((user) => (
              <tr key={user.id} className="align-top">
                <td className="px-4 py-3">
                  <p className="font-semibold text-slate-950">
                    {user.full_name || "Unnamed user"}
                  </p>
                  <p className="mt-1 max-w-44 truncate text-xs text-slate-500">{user.id}</p>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {user.email || "Requires service role key"}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge className={roleStyles[user.role]}>{user.role}</StatusBadge>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge className={accountStatusStyles[user.account_status]}>
                    {user.account_status}
                  </StatusBadge>
                </td>
                <td className="px-4 py-3 text-slate-600">{formatDate(user.created_at)}</td>
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
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
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
          <tbody className="divide-y divide-slate-100 bg-white">
            {listings.map((listing) => (
              <tr key={listing.id} className="align-top">
                <td className="px-4 py-3">
                  <p className="font-semibold text-slate-950">
                    {listing.make} {listing.model}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{listing.title}</p>
                </td>
                <td className="px-4 py-3 text-slate-600">{listing.ownerName}</td>
                <td className="px-4 py-3 text-slate-600">{listing.location}</td>
                <td className="px-4 py-3 font-semibold text-slate-950">
                  {formatCurrency(Number(listing.daily_rate))}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge className={carStatusStyles[listing.status]}>
                    {listing.status}
                  </StatusBadge>
                </td>
                <td className="px-4 py-3 text-slate-600">{formatDate(listing.created_at)}</td>
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
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return (
      <SetupState message="Create .env.local with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable admin route protection." />
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: currentProfile, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, role, account_status, created_at")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !currentProfile) {
    return (
      <SetupState message={profileError?.message ?? "Your profile could not be loaded."} />
    );
  }

  if (currentProfile.account_status !== "active") {
    return <UnauthorizedState isDisabled />;
  }

  if (currentProfile.role !== "admin") {
    return <UnauthorizedState />;
  }

  const [profilesResult, carsResult, bookingsResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, role, account_status, created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("cars")
      .select("id, owner_id, title, make, model, location, daily_rate, status, created_at")
      .order("created_at", { ascending: false }),
    supabase.from("bookings").select("id, status"),
  ]);

  const dataError =
    profilesResult.error?.message ??
    carsResult.error?.message ??
    bookingsResult.error?.message ??
    null;

  const profiles = profilesResult.data ?? [];
  const cars = carsResult.data ?? [];
  const bookings = (bookingsResult.data ?? []) as BookingRow[];

  const adminClient = createSupabaseAdminClient();
  let emailMap = new Map<string, string>();
  let emailNotice = "";

  if (adminClient) {
    const { data: authUsers, error: authUsersError } =
      await adminClient.auth.admin.listUsers();

    if (authUsersError) {
      emailNotice = authUsersError.message;
    } else {
      emailMap = new Map(
        authUsers.users.map((authUser) => [authUser.id, authUser.email ?? ""]),
      );
    }
  } else {
    emailNotice =
      "Add SUPABASE_SERVICE_ROLE_KEY on the server to show auth email addresses.";
  }

  const users: UserRecord[] = profiles.map((profile) => ({
    ...profile,
    email: emailMap.get(profile.id) || null,
  }));

  const ownerNameMap = new Map(
    profiles.map((profile) => [profile.id, profile.full_name || "Unnamed owner"]),
  );

  const listings: ListingRecord[] = cars.map((car) => ({
    ...car,
    ownerName: ownerNameMap.get(car.owner_id) ?? "Unknown owner",
  }));

  const availableListings = listings.filter((listing) => listing.status === "available");
  const disabledListings = listings.filter((listing) => listing.status === "disabled");
  const pendingBookings = bookings.filter((booking) => booking.status === "pending");

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

        {dataError ? (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="flex items-start gap-3 p-4 text-sm text-red-800">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>{dataError}</span>
            </CardContent>
          </Card>
        ) : null}

        {emailNotice ? (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="flex items-start gap-3 p-4 text-sm text-amber-800">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>{emailNotice}</span>
            </CardContent>
          </Card>
        ) : null}

        <Card className="bg-white shadow-sm">
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

        <Card className="bg-white shadow-sm">
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
