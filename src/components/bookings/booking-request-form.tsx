"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type BookingRequestFormProps = {
  carId: string;
  ownerId: string;
  dailyRate: number;
};

type FormStatus = {
  type: "success" | "error";
  message: string;
} | null;

const dayInMilliseconds = 1000 * 60 * 60 * 24;

function calculateTotalPrice(startDate: string, endDate: string, dailyRate: number) {
  const startTime = new Date(`${startDate}T00:00:00`).getTime();
  const endTime = new Date(`${endDate}T00:00:00`).getTime();
  const rentalDays = Math.floor((endTime - startTime) / dayInMilliseconds) + 1;

  return Math.max(rentalDays, 1) * Number(dailyRate);
}

function validateDates(startDate: string, endDate: string) {
  if (!startDate) {
    return "Start date is required.";
  }

  if (!endDate) {
    return "End date is required.";
  }

  if (new Date(endDate) < new Date(startDate)) {
    return "End date cannot be before the start date.";
  }

  return null;
}

export function BookingRequestForm({
  carId,
  ownerId,
  dailyRate,
}: BookingRequestFormProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<FormStatus>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);

    const dateError = validateDates(startDate, endDate);
    if (dateError) {
      setStatus({ type: "error", message: dateError });
      return;
    }

    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setStatus({
        type: "error",
        message:
          "Supabase is not configured. Add the public Supabase URL and anon key to submit booking requests.",
      });
      return;
    }

    setIsSubmitting(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setIsSubmitting(false);
      setStatus({
        type: "error",
        message: "Please log in before requesting this rental.",
      });
      return;
    }

    if (user.id === ownerId) {
      setIsSubmitting(false);
      setStatus({
        type: "error",
        message: "You cannot request a rental for your own car.",
      });
      return;
    }

    const totalPrice = calculateTotalPrice(startDate, endDate, dailyRate);
    const trimmedMessage = message.trim();

    const { error } = await supabase.from("bookings").insert({
      car_id: carId,
      owner_id: ownerId,
      renter_id: user.id,
      start_date: startDate,
      end_date: endDate,
      total_price: totalPrice,
      message: trimmedMessage || null,
      status: "pending",
    });

    setIsSubmitting(false);

    if (error) {
      setStatus({
        type: "error",
        message: `Unable to submit booking request: ${error.message}`,
      });
      return;
    }

    setStartDate("");
    setEndDate("");
    setMessage("");
    setStatus({
      type: "success",
      message: "Booking request sent. The owner can review it next.",
    });
  }

  return (
    <Card className="border-sky-100 bg-white shadow-xl shadow-sky-950/10">
      <CardHeader>
        <CardTitle>Request this rental</CardTitle>
        <CardDescription>Choose your dates and send a note to the owner.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="booking-start-date">Start date</Label>
            <Input
              id="booking-start-date"
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="booking-end-date">End date</Label>
            <Input
              id="booking-end-date"
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="booking-message">Message to owner</Label>
            <Textarea
              id="booking-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Share pickup details or anything the owner should know."
              disabled={isSubmitting}
            />
          </div>

          {status ? (
            <p
              className={
                status.type === "success"
                  ? "rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700"
                  : "rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
              }
              role={status.type === "error" ? "alert" : "status"}
            >
              {status.message}
            </p>
          ) : null}

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit request"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
