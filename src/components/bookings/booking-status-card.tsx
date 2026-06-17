import { CalendarDays, DollarSign } from "lucide-react";

import { BookingStatusBadge } from "@/components/bookings/booking-status-badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { BookingStatus } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

type BookingStatusCardProps = {
  carTitle: string;
  startDate: string;
  endDate: string;
  status: BookingStatus;
  totalPrice: number;
  className?: string;
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function formatDateRange(startDate: string, endDate: string) {
  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
  };

  const start = new Date(`${startDate}T00:00:00`).toLocaleDateString(
    "en-US",
    options,
  );
  const end = new Date(`${endDate}T00:00:00`).toLocaleDateString(
    "en-US",
    options,
  );

  return `${start} – ${end}`;
}

const statusCardStyles: Record<BookingStatus, string> = {
  pending: "border-l-4 border-l-amber-400",
  approved: "border-l-4 border-l-blue-400",
  declined: "border-l-4 border-l-red-400 opacity-75",
  completed: "border-l-4 border-l-emerald-400 opacity-75",
  cancelled: "border-l-4 border-l-neutral-400 opacity-60",
};

export function BookingStatusCard({
  carTitle,
  startDate,
  endDate,
  status,
  totalPrice,
  className,
}: BookingStatusCardProps) {
  return (
    <Card
      className={cn(
        "transition-shadow hover:shadow-md",
        statusCardStyles[status],
        className,
      )}
    >
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <CardTitle className="text-base leading-snug">{carTitle}</CardTitle>
        <BookingStatusBadge status={status} />
      </CardHeader>
      <CardContent className="grid gap-2">
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays className="size-4 shrink-0" aria-hidden="true" />
          {formatDateRange(startDate, endDate)}
        </p>
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <DollarSign className="size-4 shrink-0" aria-hidden="true" />
          {formatCurrency(totalPrice)}
        </p>
      </CardContent>
    </Card>
  );
}
