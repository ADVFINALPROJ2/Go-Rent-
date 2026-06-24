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
import { createBookingRequest } from "@/lib/actions/bookings";

type BookingRequestFormProps = {
  carId: string;
  ownerId: string;
  dailyRate: number;
};

type FormStatus = {
  type: "success" | "error";
  message: string;
} | null;

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

    setIsSubmitting(true);

    try {
      await createBookingRequest({
        carId,
        ownerId,
        startDate,
        endDate,
        message,
      });
    } catch (error) {
      setIsSubmitting(false);
      setStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to submit booking request.",
      });
      return;
    }

    setIsSubmitting(false);

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
