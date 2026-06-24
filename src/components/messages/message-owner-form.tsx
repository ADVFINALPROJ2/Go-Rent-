"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Loader2, MessageSquare } from "lucide-react";

import { AlertBanner } from "@/components/ui/alert-banner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type MessageOwnerFormProps = {
  carId: string;
  ownerId: string;
  carTitle: string;
};

export function MessageOwnerForm({
  carId,
  ownerId,
  carTitle,
}: MessageOwnerFormProps) {
  const [body, setBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);

    const trimmedBody = body.trim();

    if (!trimmedBody) {
      setStatus({ type: "error", message: "Message cannot be empty." });
      return;
    }

    const supabase = createSupabaseBrowserClient();

    if (!supabase) {
      setStatus({
        type: "error",
        message:
          "Supabase is not configured. Add the public Supabase URL and anon key to send messages.",
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
        message: "Please log in before messaging this owner.",
      });
      return;
    }

    if (user.id === ownerId) {
      setIsSubmitting(false);
      setStatus({
        type: "error",
        message: "You cannot send a message to yourself.",
      });
      return;
    }

    const { error } = await supabase.from("messages").insert({
      sender_id: user.id,
      receiver_id: ownerId,
      car_id: carId,
      booking_id: null,
      body: trimmedBody,
    });

    setIsSubmitting(false);

    if (error) {
      setStatus({
        type: "error",
        message: `Unable to send message: ${error.message}`,
      });
      return;
    }

    setBody("");
    setStatus({
      type: "success",
      message: "Message sent. You can continue the conversation in Messages.",
    });
  }

  return (
    <Card className="border-sky-100 bg-white shadow-xl shadow-sky-950/10">
      <CardHeader>
        <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-sky-50 text-primary">
          <MessageSquare className="size-5" aria-hidden="true" />
        </div>
        <CardTitle className="text-base">Message owner</CardTitle>
        <CardDescription>
          Ask a question about {carTitle} before requesting a rental.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          {status ? (
            <AlertBanner
              variant={status.type}
              message={status.message}
              onDismiss={() => setStatus(null)}
            />
          ) : null}

          <Textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="Ask about pickup, availability, or car details."
            disabled={isSubmitting}
          />

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="animate-spin" aria-hidden="true" />
              ) : (
                <MessageSquare aria-hidden="true" />
              )}
              {isSubmitting ? "Sending..." : "Send message"}
            </Button>
            <Button asChild type="button" variant="outline">
              <Link href="/messages">Open messages</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
