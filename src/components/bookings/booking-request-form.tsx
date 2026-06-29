"use client";

import { useState, useMemo, type FormEvent } from "react";

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
import { RentalDatePicker } from "@/components/bookings/rental-date-picker";
import { createBookingRequest } from "@/lib/actions/bookings";
import { formatBirr } from "@/lib/utils";

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
  dailyRate,
}: BookingRequestFormProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<FormStatus>(null);

  const todayStr = useMemo(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, []);

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
    <Card className="border-sky-100 bg-white shadow-xl shadow-sky-950/10 dark:border-zinc-800 dark:bg-zinc-950">
      <CardHeader>
        <CardTitle>Request this rental</CardTitle>
        <CardDescription>
          Choose your dates and send a note to the owner. Daily rate: {formatBirr(dailyRate, "day")}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="booking-start-date">Pick-up date</Label>
            <RentalDatePicker
              id="booking-start-date"
              value={startDate}
              onChange={(val) => {
                setStartDate(val);
                if (endDate && val > endDate) {
                  setEndDate("");
                }
              }}
              minDate={todayStr}
              disabled={isSubmitting}
              placeholder="Select pick-up date"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="booking-end-date">Drop-off date</Label>
            <RentalDatePicker
              id="booking-end-date"
              value={endDate}
              onChange={(val) => setEndDate(val)}
              minDate={startDate || todayStr}
              disabled={isSubmitting}
              placeholder="Select drop-off date"
            />
            {startDate && endDate && endDate < startDate && (
              <p className="text-xs text-destructive" role="alert">
                Drop-off date must be on or after the pick-up date.
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="booking-message">Message to owner</Label>
            <Textarea
              id="booking-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Share pickup details, preferred Addis handover area, or anything the owner should know."
              disabled={isSubmitting}
            />
          </div>

          {startDate && endDate && endDate >= startDate && (() => {
            const startTime = new Date(`${startDate}T00:00:00`).getTime();
            const endTime = new Date(`${endDate}T00:00:00`).getTime();
            const days = Math.floor((endTime - startTime) / (1000 * 60 * 60 * 24)) + 1;
            const total = Math.max(days, 1) * dailyRate;
            return (
              <div className="rounded-lg border border-sky-200/60 bg-sky-50/50 p-3 dark:border-zinc-700 dark:bg-zinc-900/50">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-zinc-400">
                    {formatBirr(dailyRate)} × {days} {days === 1 ? "day" : "days"}
                  </span>
                  <span className="font-bold text-slate-900 dark:text-zinc-100">
                    {formatBirr(total)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-zinc-500">
                  Estimated total • final price set by the owner
                </p>
              </div>
            );
          })()}

          {status ? (
            <p
              className={
                status.type === "success"
                  ? "rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/30 dark:text-green-300"
                  : "rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
              }
              role={status.type === "error" ? "alert" : "status"}
            >
              {status.message}
            </p>
          ) : null}

          <Button className="h-11" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit request"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
