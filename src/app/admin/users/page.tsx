import Link from "next/link";
import { redirect } from "next/navigation";

import {
  UnauthorizedState,
  UsersTable,
} from "@/components/admin/admin-dashboard-shared";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import { getAdminDashboardData } from "@/lib/admin/data";
import { getCurrentUser } from "@/lib/auth/session";

export default async function AdminUsersPage() {
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

  const { users } = getAdminDashboardData();

  return (
    <DashboardShell
      eyebrow="Admin users"
      title="All platform users"
      description="Review every registered GoRent account, role, status, and signup date."
      actions={
        <Button asChild variant="outline">
          <Link href="/admin">Overview</Link>
        </Button>
      }
    >
      <UsersTable currentAdminId={currentUser.id} users={users} />
    </DashboardShell>
  );
}
