"use server";

import { desc, eq, inArray } from "drizzle-orm";

import { db } from "@/db/client";
import { bookings, profiles, reviews } from "@/db/schema";
import { requireUser } from "@/lib/auth/session";

export type ReviewWithProfile = {
  id: string;
  booking_id: string;
  car_id: string;
  renter_id: string;
  owner_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewerName: string;
  reviewerAvatarUrl: string | null;
};

export type SubmitReviewInput = {
  bookingId: string;
  carId: string;
  renterId: string;
  ownerId: string;
  rating: number;
  comment: string;
};

function getReviewerFallback(renterId: string) {
  return renterId ? `Renter ${renterId.slice(0, 8)}` : "Verified renter";
}

export async function getCarReviews(carId: string): Promise<ReviewWithProfile[]> {
  const reviewRows = db.query.reviews.findMany({
    where: eq(reviews.carId, carId),
    orderBy: desc(reviews.createdAt),
  }).sync();
  const renterIds = [...new Set(reviewRows.map((review) => review.renterId))];
  const profileRows = renterIds.length
    ? db.query.profiles.findMany({
        where: inArray(profiles.userId, renterIds),
      }).sync()
    : [];
  const profileMap = new Map(profileRows.map((profile) => [profile.userId, profile]));

  return reviewRows.map((review) => {
    const profile = profileMap.get(review.renterId);

    return {
      id: review.id,
      booking_id: review.bookingId,
      car_id: review.carId,
      renter_id: review.renterId,
      owner_id: review.ownerId,
      rating: review.rating,
      comment: review.comment,
      created_at: review.createdAt,
      reviewerName: profile?.fullName || getReviewerFallback(review.renterId),
      reviewerAvatarUrl: null,
    };
  });
}

export async function submitReview(input: SubmitReviewInput) {
  const user = await requireUser();

  if (!user) {
    throw new Error("You must be logged in to submit a review.");
  }

  if (user.id !== input.renterId) {
    throw new Error("You can only submit reviews for your own completed rentals.");
  }

  if (input.rating < 1 || input.rating > 5) {
    throw new Error("Please select a rating between 1 and 5 stars.");
  }

  const comment = input.comment.trim();

  if (comment.length < 10) {
    throw new Error("Comment must be at least 10 characters long.");
  }

  if (comment.length > 500) {
    throw new Error("Comment cannot exceed 500 characters.");
  }

  const booking = db.query.bookings.findFirst({
    where: eq(bookings.id, input.bookingId),
  }).sync();

  if (
    !booking ||
    booking.status !== "completed" ||
    booking.carId !== input.carId ||
    booking.renterId !== input.renterId ||
    booking.ownerId !== input.ownerId
  ) {
    throw new Error("Only completed bookings for this car can be reviewed.");
  }

  try {
    db.insert(reviews)
      .values({
        id: crypto.randomUUID(),
        bookingId: input.bookingId,
        carId: input.carId,
        renterId: input.renterId,
        ownerId: input.ownerId,
        rating: input.rating,
        comment,
      })
      .run();
  } catch {
    throw new Error("A review for this booking already exists.");
  }
}
