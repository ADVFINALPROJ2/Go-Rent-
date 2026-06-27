import Link from "next/link";
import { redirect } from "next/navigation";

import {
  AdminDashboardActions,
  ListingsTable,
  UnauthorizedState,
} from "@/components/admin/admin-dashboard-shared";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import { getAdminDashboardData } from "@/lib/admin/data";
import { getCurrentUser } from "@/lib/auth/session";

export default async function AdminListingsPage() {
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

  const { listings } = getAdminDashboardData();

  return (
    <DashboardShell
      eyebrow="Admin listings"
      title="All vehicle listings"
      description="Review every owner vehicle, daily Birr rate, status, and public listing page."
      actions={
        <>
          <Button asChild variant="outline">
            <Link href="/admin/dashboard">Overview</Link>
          </Button>
          <AdminDashboardActions />
        </>
      }
    >
      <ListingsTable listings={listings} />
    </DashboardShell>
  );
}
