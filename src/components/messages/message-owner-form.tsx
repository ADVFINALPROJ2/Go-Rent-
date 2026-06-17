"use client";

import { useState, type FormEvent } from "react";
import { Send } from "lucide-react";

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
import { sendMessage } from "@/lib/messages/queries";

type MessageOwnerFormProps = {
  receiverId: string;
  receiverName?: string;
  bookingId?: string | null;
  onSuccess?: () => void;
};

export function MessageOwnerForm({
  receiverId,
  receiverName = "the owner",
  bookingId = null,
  onSuccess,
}: MessageOwnerFormProps) {
  const [body, setBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedBody = body.trim();
    const supabase = createSupabaseBrowserClient();

    if (!trimmedBody) {
      setError("Please enter a message before sending.");
      setSuccess(null);
      return;
    }

    if (!supabase) {
      setError(
        "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      );
      setSuccess(null);
      return;
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      setError("You must be logged in to send a message.");
      setSuccess(null);
      return;
    }

    if (user.id === receiverId) {
      setError("You cannot message yourself.");
      setSuccess(null);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await sendMessage({
        sender_id: user.id,
        receiver_id: receiverId,
        booking_id: bookingId,
        body: trimmedBody,
      });

      setBody("");
      setSuccess(`Message sent to ${receiverName}.`);
      onSuccess?.();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to send your message right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Message Owner</CardTitle>
        <CardDescription>
          Ask about availability, pickup details, or rental timing.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-3" onSubmit={handleSubmit}>
          <Textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder={`Send a message to ${receiverName}...`}
            rows={5}
          />

          {error ? <AlertBanner variant="error" message={error} /> : null}
          {success ? <AlertBanner variant="success" message={success} /> : null}

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              <Send className="size-4" aria-hidden="true" />
              {isSubmitting ? "Sending..." : "Send Message"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
