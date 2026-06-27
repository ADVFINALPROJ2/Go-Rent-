import { Mail, MapPin, Phone, UserRound } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import {
  AdminDashboardActions,
  UnauthorizedState,
  formatAdminDate,
} from "@/components/admin/admin-dashboard-shared";
import {
  DashboardEmptyState,
  DashboardShell,
} from "@/components/dashboard/dashboard-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAdminUserById } from "@/lib/admin/data";
import { getCurrentUser } from "@/lib/auth/session";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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

  const { id } = await params;
  const user = getAdminUserById(id);

  return (
    <DashboardShell
      eyebrow="Admin user detail"
      title={user?.full_name || user?.email || "User profile"}
      description="Read-only account and profile details for admin review."
      actions={
        <>
          <Button asChild variant="outline">
            <Link href="/admin/dashboard/users">All users</Link>
          </Button>
          <AdminDashboardActions />
        </>
      }
    >
      {!user ? (
        <DashboardEmptyState
          icon={<UserRound className="size-7" aria-hidden="true" />}
          title="User not found"
          description="This account does not exist in the local database."
          action={
            <Button asChild>
              <Link href="/admin/dashboard/users">Back to users</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <Card className="bg-white shadow-sm dark:bg-zinc-950">
            <CardHeader>
              <CardTitle>Profile information</CardTitle>
              <CardDescription>
                Public profile fields connected to this account.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 text-sm text-slate-600 dark:text-zinc-300">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">Full name</p>
                <p className="mt-1 text-base font-semibold text-slate-950 dark:text-white">
                  {user.full_name || "Not provided"}
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 p-4 dark:border-zinc-800">
                  <Mail className="mb-3 size-5 text-primary" aria-hidden="true" />
                  <p className="text-xs font-semibold uppercase text-slate-500">Email</p>
                  <p className="mt-1 break-words text-slate-950 dark:text-white">
                    {user.email}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 p-4 dark:border-zinc-800">
                  <Phone className="mb-3 size-5 text-primary" aria-hidden="true" />
                  <p className="text-xs font-semibold uppercase text-slate-500">Phone</p>
                  <p className="mt-1 text-slate-950 dark:text-white">
                    {user.phone || "Not provided"}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 p-4 dark:border-zinc-800 sm:col-span-2">
                  <MapPin className="mb-3 size-5 text-primary" aria-hidden="true" />
                  <p className="text-xs font-semibold uppercase text-slate-500">Location</p>
                  <p className="mt-1 text-slate-950 dark:text-white">
                    {user.location || "Not provided"}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">Bio</p>
                <p className="mt-1 leading-6">{user.bio || "No bio has been added."}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm dark:bg-zinc-950">
            <CardHeader>
              <CardTitle>Account status</CardTitle>
              <CardDescription>Admin-facing identity and access fields.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 text-sm">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">User ID</p>
                <p className="mt-1 break-all font-mono text-slate-700 dark:text-zinc-300">
                  {user.id}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200 p-4 dark:border-zinc-800">
                  <p className="text-xs font-semibold uppercase text-slate-500">Role</p>
                  <p className="mt-1 text-base font-bold capitalize text-slate-950 dark:text-white">
                    {user.role}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 p-4 dark:border-zinc-800">
                  <p className="text-xs font-semibold uppercase text-slate-500">Status</p>
                  <p className="mt-1 text-base font-bold capitalize text-slate-950 dark:text-white">
                    {user.account_status}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">Joined</p>
                <p className="mt-1 text-slate-700 dark:text-zinc-300">
                  {formatAdminDate(user.created_at)}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">Last updated</p>
                <p className="mt-1 text-slate-700 dark:text-zinc-300">
                  {formatAdminDate(user.updated_at)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardShell>
  );
}
