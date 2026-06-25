import { Loader2 } from "lucide-react";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-slate-200/80 ${className ?? ""}`} />;
}

export default function AdminDashboardLoading() {
  return (
    <DashboardShell
      eyebrow="Admin dashboard"
      title="Loading admin workspace..."
      description="Fetching users, listings, and platform metrics."
    >
      <div className="grid gap-6">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <Card className="bg-white" key={index}>
              <CardHeader className="space-y-3">
                <SkeletonBlock className="h-4 w-28" />
                <SkeletonBlock className="h-3 w-36" />
              </CardHeader>
              <CardContent>
                <SkeletonBlock className="h-9 w-16" />
              </CardContent>
            </Card>
          ))}
        </section>

        {Array.from({ length: 3 }).map((_, index) => (
          <Card className="bg-white shadow-sm" key={index}>
            <CardHeader className="space-y-2">
              <SkeletonBlock className="h-5 w-40" />
              <SkeletonBlock className="h-4 w-full max-w-xl" />
            </CardHeader>
            <CardContent className="space-y-3">
              <SkeletonBlock className="h-32 w-full" />
            </CardContent>
          </Card>
        ))}

        <div className="flex items-center justify-center gap-2 py-4 text-sm text-slate-500">
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          <span>Loading admin dashboard...</span>
        </div>
      </div>
    </DashboardShell>
  );
}
