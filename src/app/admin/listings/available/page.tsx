import Link from "next/link";
import { redirect } from "next/navigation";

import {
  ListingsTable,
  UnauthorizedState,
} from "@/components/admin/admin-dashboard-shared";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import { getAdminDashboardData } from "@/lib/admin/data";
import { getCurrentUser } from "@/lib/auth/session";

export default async function AdminAvailableListingsPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/admin/login");
  }

  if (currentUser.status !== "active") {
    return <UnauthorizedState isDisabled />;
  }

  if (currentUser.role !== "admin") {
    return <UnauthorizedState />;
  }

  const { listings } = getAdminDashboardData();
  const availableListings = listings.filter((listing) => listing.status === "available");

  return (
    <DashboardShell
      eyebrow="Admin listings"
      title="Available cars"
      description="Cars currently visible to renters in the Addis marketplace."
      actions={
        <Button asChild variant="outline">
          <Link href="/admin/listings">All listings</Link>
        </Button>
      }
    >
      <ListingsTable listings={availableListings} />
    </DashboardShell>
  );
}
