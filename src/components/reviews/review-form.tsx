"use client";

import { useState, type FormEvent } from "react";
import { Star, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type ReviewFormProps = {
  bookingId: string;
  carId: string;
  renterId: string;
  ownerId: string;
  onSuccess?: () => void;
  className?: string;
  disabled?: boolean;
  disabledReason?: string;
};

type FormStatus = {
  type: "success" | "error";
  message: string;
} | null;

const ratingLabels = [
  "Select a rating",
  "Poor - Not recommended",
  "Fair - Met basic needs",
  "Good - Comfortable and clean",
  "Very Good - Exceeded expectations",
  "Excellent - Absolutely perfect",
];

export function ReviewForm({
  bookingId,
  carId,
  renterId,
  ownerId,
  onSuccess,
  className,
  disabled = false,
  disabledReason,
}: ReviewFormProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<FormStatus>(null);
  const [validationErrors, setValidationErrors] = useState<{
    rating?: string;
    comment?: string;
  }>({});

  // Client-side validation
  function validateForm() {
    const errors: { rating?: string; comment?: string } = {};

    if (rating === 0) {
      errors.rating = "Please select a rating between 1 and 5 stars.";
    }

    const trimmedComment = comment.trim();
    if (!trimmedComment) {
      errors.comment = "Comment is required to submit a review.";
    } else if (trimmedComment.length < 10) {
      errors.comment = "Comment must be at least 10 characters long.";
    } else if (trimmedComment.length > 500) {
      errors.comment = "Comment cannot exceed 500 characters.";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    setValidationErrors({});

    // Validate inputs
    if (!validateForm()) {
      return;
    }

    // Check UUID format roughly or if placeholder booking
    const isPlaceholder = 
      bookingId.startsWith("preview-") || 
      carId.startsWith("preview-") || 
      renterId.startsWith("preview-") || 
      ownerId.startsWith("preview-");

    if (isPlaceholder) {
      setIsSubmitting(true);
      // Simulate database insertion delay for testing placeholder data
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setIsSubmitting(false);
      
      // Let the user know the review validated successfully, but database insert is bypassed
      setStatus({
        type: "success",
        message: "Demo Mode Success: Review validated successfully! (Database insert bypassed for preview/placeholder IDs).",
      });
      
      // Reset form
      setRating(0);
      setComment("");
      if (onSuccess) onSuccess();
      return;
    }

    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setStatus({
        type: "error",
        message: "Supabase client not configured. Add Supabase environment variables to submit reviews.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Check auth state
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setIsSubmitting(false);
        setStatus({
          type: "error",
          message: "You must be logged in to submit a review.",
        });
        return;
      }

      // Perform insertion
      const { error: insertError } = await supabase.from("reviews").insert({
        booking_id: bookingId,
        car_id: carId,
        renter_id: renterId,
        owner_id: ownerId,
        rating: rating,
        comment: comment.trim(),
      });

      setIsSubmitting(false);

      if (insertError) {
        setStatus({
          type: "error",
          message: `Failed to submit review: ${insertError.message}`,
        });
        return;
      }

      // Successful submission
      setStatus({
        type: "success",
        message: "Thank you! Your review has been submitted successfully.",
      });
      setRating(0);
      setComment("");
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      setIsSubmitting(false);
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred.";
      setStatus({
        type: "error",
        message: `An unexpected error occurred: ${message}`,
      });
    }
  }

  return (
    <Card className={cn("overflow-hidden border border-slate-200/80 bg-white/80 backdrop-blur-md shadow-lg transition-shadow duration-300 hover:shadow-xl dark:border-slate-800 dark:bg-slate-950/80", className)}>
      <CardHeader className="space-y-1.5 pb-4">
        <CardTitle className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">
          Rate your rental experience
        </CardTitle>
        <CardDescription className="text-slate-500 dark:text-slate-400">
          Share your feedback on this vehicle and booking trip.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {disabled && disabledReason && (
            <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50/70 p-3.5 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-300 animate-pulse" role="status">
              <AlertCircle className="size-5 shrink-0 text-amber-600 dark:text-amber-400" />
              <span>{disabledReason}</span>
            </div>
          )}

          {/* Rating field */}
          <div className={cn("space-y-2.5", disabled && "opacity-60 pointer-events-none")}>
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold tracking-wide text-slate-800 dark:text-slate-200">
                Your Rating
              </Label>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {ratingLabels[hoverRating || rating] || ratingLabels[0]}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((starValue) => {
                const isHighlighted = starValue <= (hoverRating || rating);
                return (
                  <button
                    key={starValue}
                    type="button"
                    onClick={() => {
                      setRating(starValue);
                      if (validationErrors.rating) {
                        setValidationErrors((prev) => ({ ...prev, rating: undefined }));
                      }
                    }}
                    onMouseEnter={() => setHoverRating(starValue)}
                    onMouseLeave={() => setHoverRating(0)}
                    disabled={isSubmitting || disabled}
                    className="group relative rounded-md p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-all duration-200 disabled:opacity-50"
                    aria-label={`Rate ${starValue} star${starValue > 1 ? "s" : ""}`}
                  >
                    <Star
                      className={cn(
                        "size-8 transition-transform duration-200 group-hover:scale-110",
                        isHighlighted
                          ? "fill-amber-400 stroke-amber-400 drop-shadow-[0_0_3px_rgba(251,191,36,0.3)]"
                          : "fill-transparent stroke-slate-300 dark:stroke-slate-700"
                      )}
                    />
                  </button>
                );
              })}
            </div>
            {validationErrors.rating && (
              <p className="flex items-center gap-1.5 text-xs font-medium text-red-500" role="alert">
                <AlertCircle className="size-3.5" />
                {validationErrors.rating}
              </p>
            )}
          </div>

          {/* Comment field */}
          <div className={cn("space-y-2", disabled && "opacity-60 pointer-events-none")}>
            <div className="flex items-center justify-between">
              <Label htmlFor="review-comment" className="text-sm font-semibold tracking-wide text-slate-800 dark:text-slate-200">
                Written Review
              </Label>
              <span
                className={cn(
                  "text-xs font-medium",
                  comment.length > 500
                    ? "text-red-500"
                    : comment.length >= 450
                    ? "text-amber-500"
                    : "text-slate-400 dark:text-slate-500"
                )}
              >
                {comment.length}/500
              </span>
            </div>
            <Textarea
              id="review-comment"
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
                if (validationErrors.comment) {
                  setValidationErrors((prev) => ({ ...prev, comment: undefined }));
                }
              }}
              placeholder="What did you like or dislike about the car? How was the host's communication?"
              rows={4}
              disabled={isSubmitting || disabled}
              className={cn(
                "resize-none border-slate-200 bg-slate-50/50 focus:border-blue-500 focus:bg-white focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-900/50 dark:focus:border-blue-400 dark:focus:bg-slate-900",
                validationErrors.comment && "border-red-500 focus:border-red-500 focus:ring-red-500"
              )}
            />
            {validationErrors.comment && (
              <p className="flex items-center gap-1.5 text-xs font-medium text-red-500" role="alert">
                <AlertCircle className="size-3.5" />
                {validationErrors.comment}
              </p>
            )}
          </div>

          {/* Status Message */}
          {status && (
            <div
              className={cn(
                "flex items-start gap-2.5 rounded-lg border p-3.5 text-sm transition-all duration-300",
                status.type === "success"
                  ? "border-emerald-200 bg-emerald-50/70 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-300"
                  : "border-red-200 bg-red-50/70 text-red-800 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300"
              )}
              role={status.type === "error" ? "alert" : "status"}
            >
              {status.type === "success" ? (
                <CheckCircle2 className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <AlertCircle className="size-5 shrink-0 text-red-600 dark:text-red-400" />
              )}
              <span>{status.message}</span>
            </div>
          )}

          {/* Submit button */}
          <Button
            type="submit"
            disabled={isSubmitting || disabled}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:from-blue-500 dark:to-indigo-500"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Submitting Review...
              </>
            ) : (
              "Submit Review"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
