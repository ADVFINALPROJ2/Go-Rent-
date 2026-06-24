"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, MessageSquareText, Star } from "lucide-react";

import { ReviewForm } from "@/components/reviews/review-form";
import { AlertBanner } from "@/components/ui/alert-banner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getCarReviews,
  type ReviewWithProfile,
} from "@/lib/actions/reviews";
import { cn } from "@/lib/utils";

type ReviewFormConfig = {
  bookingId: string;
  renterId: string;
  ownerId: string;
  disabled: boolean;
  disabledReason?: string;
};

type ReviewsSectionProps = {
  carId: string;
  reviewForm: ReviewFormConfig;
};

function formatReviewDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function RatingStars({
  rating,
  size = "sm",
}: {
  rating: number;
  size?: "sm" | "md";
}) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((starValue) => (
        <Star
          key={starValue}
          className={cn(
            size === "md" ? "size-5" : "size-4",
            starValue <= Math.round(rating)
              ? "fill-amber-400 stroke-amber-400"
              : "fill-transparent stroke-slate-300",
          )}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

export function ReviewsSection({ carId, reviewForm }: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<ReviewWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReviews = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      setReviews(await getCarReviews(carId));
    } catch (err) {
      setReviews([]);
      setError(
        err instanceof Error
          ? `Reviews could not be loaded: ${err.message}`
          : "Reviews could not be loaded.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [carId]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadReviews();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadReviews]);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) {
      return 0;
    }

    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return total / reviews.length;
  }, [reviews]);

  return (
    <div id="reviews-section" className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-slate-950">Reviews & Ratings</h3>
          <p className="text-sm text-slate-500">
            Read feedback from previous renters or submit your own.
          </p>
        </div>

        <Card className="border-sky-100 bg-sky-50/70 shadow-sm sm:min-w-56">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-11 items-center justify-center rounded-full bg-white text-amber-500 shadow-sm">
              <Star className="size-5 fill-amber-400 stroke-amber-400" aria-hidden="true" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-950">
                {reviews.length > 0 ? averageRating.toFixed(1) : "No"}
              </p>
              <p className="text-xs font-medium text-slate-500">
                {reviews.length === 0
                  ? "reviews yet"
                  : `${reviews.length} review${reviews.length === 1 ? "" : "s"}`}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <div className="space-y-3">
          <AlertBanner variant="error" message={error} />
          <Button type="button" variant="outline" onClick={() => void loadReviews()}>
            Try again
          </Button>
        </div>
      )}

      {isLoading ? (
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardContent className="flex items-center gap-3 p-5 text-sm text-slate-500">
            <Loader2 className="size-4 animate-spin text-primary" aria-hidden="true" />
            Loading reviews...
          </CardContent>
        </Card>
      ) : null}

      {!isLoading && !error && reviews.length === 0 ? (
        <Card className="border-dashed border-slate-200 bg-white/80 shadow-sm">
          <CardContent className="flex items-start gap-3 p-5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-sky-50 text-primary">
              <MessageSquareText className="size-5" aria-hidden="true" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">No reviews yet</p>
              <p className="mt-1 text-sm text-slate-500">
                Completed renters can leave the first review for this car.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {!isLoading && !error && reviews.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <RatingStars rating={averageRating} size="md" />
            <span className="text-sm font-semibold text-slate-800">
              {averageRating.toFixed(1)} average from {reviews.length} review
              {reviews.length === 1 ? "" : "s"}
            </span>
          </div>

          {reviews.map((review) => (
            <Card key={review.id} className="border-slate-200 bg-white shadow-sm">
              <CardHeader className="space-y-2 pb-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-sky-100 text-sm font-bold text-primary">
                      {review.reviewerAvatarUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={review.reviewerAvatarUrl}
                          alt=""
                          className="size-full object-cover"
                        />
                      ) : (
                        review.reviewerName.slice(0, 1).toUpperCase()
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-base text-slate-950">
                        {review.reviewerName}
                      </CardTitle>
                      <CardDescription>{formatReviewDate(review.created_at)}</CardDescription>
                    </div>
                  </div>
                  <RatingStars rating={review.rating} />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-slate-600">
                  {review.comment || "This renter left a rating without a written comment."}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      <ReviewForm
        bookingId={reviewForm.bookingId}
        carId={carId}
        renterId={reviewForm.renterId}
        ownerId={reviewForm.ownerId}
        disabled={reviewForm.disabled}
        disabledReason={reviewForm.disabledReason}
        onSuccess={() => void loadReviews()}
      />
    </div>
  );
}
