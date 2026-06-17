import { CalendarCheck, CalendarX2, CheckCircle2 } from "lucide-react";
import type { ReactNode } from "react";

import { DashboardEmptyState } from "@/components/dashboard/dashboard-shell";
import { cn } from "@/lib/utils";

type BookingListEmptyVariant = "no-requests" | "no-approved" | "no-completed";

const variantConfig: Record<
  BookingListEmptyVariant,
  { icon: ReactNode; title: string; description: string }
> = {
  "no-requests": {
    icon: <CalendarX2 className="size-7" aria-hidden="true" />,
    title: "No booking requests yet",
    description:
      "Booking requests will appear here once renters start requesting cars.",
  },
  "no-approved": {
    icon: <CalendarCheck className="size-7" aria-hidden="true" />,
    title: "No approved bookings yet",
    description:
      "Approved bookings will show up here after requests are reviewed.",
  },
  "no-completed": {
    icon: <CheckCircle2 className="size-7" aria-hidden="true" />,
    title: "No completed bookings yet",
    description:
      "Completed bookings will appear here after rental periods end.",
  },
};

type BookingListEmptyProps = {
  variant: BookingListEmptyVariant;
  action?: ReactNode;
  className?: string;
};

export function BookingListEmpty({ variant, action, className }: BookingListEmptyProps) {
  const config = variantConfig[variant];

  return (
    <DashboardEmptyState
      icon={config.icon}
      title={config.title}
      description={config.description}
      action={action}
      className={cn(className)}
    />
  );
}
