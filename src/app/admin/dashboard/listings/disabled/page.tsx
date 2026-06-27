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

export default async function AdminDisabledListingsPage() {
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
  const disabledListings = listings.filter((listing) => listing.status === "disabled");

  return (
    <DashboardShell
      eyebrow="Admin listings"
      title="Disabled cars"
      description="Cars hidden from renters because their listing status is disabled."
      actions={
        <>
          <Button asChild variant="outline">
            <Link href="/admin/dashboard/listings">All listings</Link>
          </Button>
          <AdminDashboardActions />
        </>
      }
    >
      <ListingsTable listings={disabledListings} />
    </DashboardShell>
  );
}
