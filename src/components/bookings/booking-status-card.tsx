"use client";

import { useState } from "react";
import { CalendarDays, DollarSign } from "lucide-react";

import { BookingStatusBadge } from "@/components/bookings/booking-status-badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReviewForm } from "@/components/reviews/review-form";
import type { BookingStatus } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

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
}: BookingStatusCardProps) {
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  const canReview = status === "completed" && showReviewAction && !hasReviewed;

  return (
    <Card
      className={cn(
        "overflow-hidden bg-white transition-shadow hover:shadow-md hover:shadow-sky-950/10",
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
            <DollarSign className="size-4 shrink-0" aria-hidden="true" />
            {formatCurrency(totalPrice)}
          </p>
        </div>

        {canReview && (
          <div className="border-t pt-3 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">How was your trip?</span>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs font-semibold px-3"
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
                  className="border-0 bg-slate-50/50 p-0 shadow-none"
                />
              </div>
            )}
          </div>
        )}

        {hasReviewed && (
          <div className="flex items-center gap-1.5 border-t pt-3 text-xs font-semibold text-green-600">
            ✓ Review submitted successfully!
          </div>
        )}
      </CardContent>
    </Card>
  );
}
