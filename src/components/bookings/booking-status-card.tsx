"use client";

import { useState, type ReactNode } from "react";
import { Banknote, CalendarDays } from "lucide-react";

import { BookingStatusBadge } from "@/components/bookings/booking-status-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ReviewForm } from "@/components/reviews/review-form";
import type { BookingStatus } from "@/lib/local-types";
import { cn, formatBirr } from "@/lib/utils";

type BookingStatusCardProps = {
  bookingId?: string;
  carId?: string;
  renterId?: string;
  ownerId?: string;
  carTitle: string;
  startDate: string;
  endDate: string;
  status: BookingStatus;
  totalPrice: number;
  className?: string;
  showReviewAction?: boolean;
  actions?: ReactNode;
  secondaryActions?: ReactNode;
  renterName?: string | null;
  renterEmail?: string | null;
  message?: string | null;
};

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
  bookingId,
  carId,
  renterId,
  ownerId,
  carTitle,
  startDate,
  endDate,
  status,
  totalPrice,
  className,
  showReviewAction = false,
  actions,
  secondaryActions,
  renterName,
  renterEmail,
  message,
}: BookingStatusCardProps) {
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  const canReview = status === "completed" && showReviewAction && !hasReviewed;

  return (
    <Card
      className={cn(
        "overflow-hidden transition-shadow hover:shadow-md",
        statusCardStyles[status],
        className,
      )}
    >
      <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2">
        <CardTitle className="text-base leading-snug">{carTitle}</CardTitle>
        <BookingStatusBadge status={status} />
      </CardHeader>
      <CardContent className="grid gap-3">
        <div className="grid gap-1.5">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="size-4 shrink-0" aria-hidden="true" />
            {formatDateRange(startDate, endDate)}
          </p>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Banknote className="size-4 shrink-0" aria-hidden="true" />
            {formatBirr(totalPrice, "ETB")}
          </p>
        </div>

        {(renterName || renterEmail || message) && (
        <div className="rounded-xl border bg-muted/30 p-3 text-sm dark:border-zinc-800">
            {renterName && (
              <p className="font-medium text-foreground">Renter: {renterName}</p>
            )}
            {renterEmail && (
              <p className="text-muted-foreground">{renterEmail}</p>
            )}
            {message && (
              <p className="mt-2 text-muted-foreground">“{message}”</p>
            )}
          </div>
        )}

        {(actions || secondaryActions) && (
          <div className="flex flex-wrap gap-2 border-t pt-3">
            {actions}
            {secondaryActions}
          </div>
        )}

        {canReview && (
          <div className="flex flex-col gap-3 border-t pt-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">
                How was your trip?
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 text-xs font-semibold"
                onClick={() => setIsReviewOpen(!isReviewOpen)}
              >
                {isReviewOpen ? "Cancel Review" : "Write a Review"}
              </Button>
            </div>

            {isReviewOpen && (
              <div className="mt-1 animate-in fade-in slide-in-from-top-2 duration-200">
                <ReviewForm
                  bookingId={bookingId || "preview-booking-id"}
                  carId={carId || "preview-car-id"}
                  renterId={renterId || "preview-renter-id"}
                  ownerId={ownerId || "preview-owner-id"}
                  onSuccess={() => {
                    setHasReviewed(true);
                    setIsReviewOpen(false);
                  }}
                  className="border-0 bg-slate-50/50 p-0 shadow-none dark:bg-zinc-900/50"
                />
              </div>
            )}
          </div>
        )}

        {hasReviewed && (
          <div className="flex items-center gap-1.5 border-t pt-3 text-xs font-semibold text-green-600 dark:border-zinc-800 dark:text-green-400">
            ✓ Review submitted successfully!
          </div>
        )}
      </CardContent>
    </Card>
  );
}

