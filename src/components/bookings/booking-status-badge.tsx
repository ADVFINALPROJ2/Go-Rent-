import { Badge } from "@/components/ui/badge";
import type { BookingStatus } from "@/lib/supabase/types";

type BadgeVariant = "warning" | "info" | "destructive" | "success" | "muted";

const statusConfig: Record<BookingStatus, { label: string; variant: BadgeVariant }> = {
  pending: { label: "Pending", variant: "warning" },
  approved: { label: "Approved", variant: "info" },
  declined: { label: "Declined", variant: "destructive" },
  completed: { label: "Completed", variant: "success" },
  cancelled: { label: "Cancelled", variant: "muted" },
};

type BookingStatusBadgeProps = {
  status: BookingStatus;
  className?: string;
};

export function BookingStatusBadge({ status, className }: BookingStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}
