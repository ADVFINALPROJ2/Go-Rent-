"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Inbox,
  Loader2,
  MessageSquare,
  RefreshCw,
  Send,
} from "lucide-react";

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
import type { Database } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

type MessageRow = Database["public"]["Tables"]["messages"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type CarRow = Database["public"]["Tables"]["cars"]["Row"];

type MessageWithContext = MessageRow & {
  otherUserId: string;
  otherUserName: string;
  carTitle: string | null;
  carLocation: string | null;
  carImageUrl: string | null;
};

type Conversation = {
  key: string;
  otherUserId: string;
  otherUserName: string;
  carId: string | null;
  carTitle: string | null;
  carLocation: string | null;
  carImageUrl: string | null;
  messages: MessageWithContext[];
  lastMessage: MessageWithContext;
  unreadCount: number;
};

function formatShortUser(id: string) {
  return `User ${id.slice(0, 8)}`;
}

function formatMessageTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function buildConversationKey(otherUserId: string, carId: string | null) {
  return `${otherUserId}:${carId ?? "general"}`;
}

export function MessagesClient() {
  const router = useRouter();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageWithContext[]>([]);
  const [selectedConversationKey, setSelectedConversationKey] = useState<string | null>(
    null,
  );
  const [replyBody, setReplyBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [markingReadKey, setMarkingReadKey] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadMessages = useCallback(
    async (preferredConversationKey?: string | null) => {
      setLoading(true);
      setError("");
      setSuccess("");

      try {
        const supabase = createSupabaseBrowserClient();

        if (!supabase) {
          throw new Error(
            "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
          );
        }

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          throw new Error(userError.message);
        }

        if (!user) {
          router.push("/login");
          return;
        }

        setCurrentUserId(user.id);

        const { data: messageRows, error: messagesError } = await supabase
          .from("messages")
          .select("*")
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .order("created_at", { ascending: true });

        if (messagesError) {
          throw new Error(messagesError.message);
        }

        if (!messageRows?.length) {
          setMessages([]);
          setSelectedConversationKey(null);
          return;
        }

        const userIds = [
          ...new Set(
            messageRows.flatMap((message) => [message.sender_id, message.receiver_id]),
          ),
        ];
        const carIds = [
          ...new Set(
            messageRows
              .map((message) => message.car_id)
              .filter((carId): carId is string => Boolean(carId)),
          ),
        ];

        const profilesPromise =
          userIds.length > 0
            ? supabase.from("profiles").select("id, full_name").in("id", userIds)
            : Promise.resolve({ data: [] as ProfileRow[], error: null });

        const carsPromise =
          carIds.length > 0
            ? supabase
                .from("cars")
                .select("id, title, make, model, location, image_urls")
                .in("id", carIds)
            : Promise.resolve({ data: [] as CarRow[], error: null });

        const [profilesResult, carsResult] = await Promise.all([
          profilesPromise,
          carsPromise,
        ]);

        if (profilesResult.error) {
          throw new Error(profilesResult.error.message);
        }

        if (carsResult.error) {
          throw new Error(carsResult.error.message);
        }

        const profileMap = new Map(
          (profilesResult.data ?? []).map((profile) => [profile.id, profile]),
        );
        const carMap = new Map((carsResult.data ?? []).map((car) => [car.id, car]));

        const contextualMessages = messageRows.map((message) => {
          const otherUserId =
            message.sender_id === user.id ? message.receiver_id : message.sender_id;
          const otherProfile = profileMap.get(otherUserId);
          const car = message.car_id ? carMap.get(message.car_id) : null;
          const carTitle = car
            ? car.title || `${car.make} ${car.model}`
            : null;

          return {
            ...message,
            otherUserId,
            otherUserName: otherProfile?.full_name ?? formatShortUser(otherUserId),
            carTitle,
            carLocation: car?.location ?? null,
            carImageUrl: car?.image_urls?.[0] ?? null,
          };
        });

        setMessages(contextualMessages);

        const nextKeys = new Set(
          contextualMessages.map((message) =>
            buildConversationKey(message.otherUserId, message.car_id),
          ),
        );

        if (preferredConversationKey && nextKeys.has(preferredConversationKey)) {
          setSelectedConversationKey(preferredConversationKey);
        } else {
          const newestMessage = [...contextualMessages].sort(
            (a, b) =>
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
          )[0];
          setSelectedConversationKey(
            buildConversationKey(newestMessage.otherUserId, newestMessage.car_id),
          );
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load messages.");
      } finally {
        setLoading(false);
      }
    },
    [router],
  );

  useEffect(() => {
    queueMicrotask(() => {
      void loadMessages();
    });
  }, [loadMessages]);

  const conversations = useMemo<Conversation[]>(() => {
    if (!currentUserId) {
      return [];
    }

    const conversationMap = new Map<string, MessageWithContext[]>();

    messages.forEach((message) => {
      const key = buildConversationKey(message.otherUserId, message.car_id);
      const existing = conversationMap.get(key) ?? [];
      existing.push(message);
      conversationMap.set(key, existing);
    });

    return Array.from(conversationMap.entries())
      .map(([key, conversationMessages]) => {
        const sortedMessages = [...conversationMessages].sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        );
        const lastMessage = sortedMessages[sortedMessages.length - 1];

        return {
          key,
          otherUserId: lastMessage.otherUserId,
          otherUserName: lastMessage.otherUserName,
          carId: lastMessage.car_id,
          carTitle: lastMessage.carTitle,
          carLocation: lastMessage.carLocation,
          carImageUrl: lastMessage.carImageUrl,
          messages: sortedMessages,
          lastMessage,
          unreadCount: sortedMessages.filter(
            (message) => message.receiver_id === currentUserId && !message.read_at,
          ).length,
        };
      })
      .sort(
        (a, b) =>
          new Date(b.lastMessage.created_at).getTime() -
          new Date(a.lastMessage.created_at).getTime(),
      );
  }, [currentUserId, messages]);

  const selectedConversation =
    conversations.find((conversation) => conversation.key === selectedConversationKey) ??
    conversations[0] ??
    null;

  useEffect(() => {
    async function markSelectedConversationRead() {
      if (!currentUserId || !selectedConversation) {
        return;
      }

      const unreadMessageIds = selectedConversation.messages
        .filter((message) => message.receiver_id === currentUserId && !message.read_at)
        .map((message) => message.id);

      if (unreadMessageIds.length === 0) {
        return;
      }

      setMarkingReadKey(selectedConversation.key);

      const supabase = createSupabaseBrowserClient();
      if (!supabase) {
        setMarkingReadKey(null);
        return;
      }

      const readAt = new Date().toISOString();
      const { error: readError } = await supabase
        .from("messages")
        .update({ read_at: readAt })
        .in("id", unreadMessageIds)
        .eq("receiver_id", currentUserId);

      if (!readError) {
        setMessages((previousMessages) =>
          previousMessages.map((message) =>
            unreadMessageIds.includes(message.id)
              ? { ...message, read_at: readAt }
              : message,
          ),
        );
      }

      setMarkingReadKey(null);
    }

    void markSelectedConversationRead();
  }, [currentUserId, selectedConversation]);

  async function handleSendReply() {
    if (!currentUserId || !selectedConversation) {
      return;
    }

    const trimmedReply = replyBody.trim();
    if (!trimmedReply) {
      setError("Reply cannot be empty.");
      return;
    }

    setSending(true);
    setError("");
    setSuccess("");

    try {
      const supabase = createSupabaseBrowserClient();

      if (!supabase) {
        throw new Error(
          "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
        );
      }

      const { error: sendError } = await supabase.from("messages").insert({
        sender_id: currentUserId,
        receiver_id: selectedConversation.otherUserId,
        car_id: selectedConversation.carId,
        booking_id: null,
        body: trimmedReply,
      });

      if (sendError) {
        throw new Error(sendError.message);
      }

      setReplyBody("");
      setSuccess("Reply sent.");
      await loadMessages(selectedConversation.key);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reply.");
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center gap-3 py-12 text-sm text-muted-foreground">
          <Loader2 className="size-5 animate-spin" aria-hidden="true" />
          Loading your messages...
        </CardContent>
      </Card>
    );
  }

  if (error && messages.length === 0) {
    return (
      <div className="grid gap-4">
        <AlertBanner variant="error" message={error} onDismiss={() => setError("")} />
        <Button className="w-fit" onClick={() => void loadMessages()} variant="outline">
          <RefreshCw aria-hidden="true" />
          Try again
        </Button>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <Card className="border-dashed border-sky-200 bg-sky-50/40">
        <CardContent className="flex flex-col items-center gap-4 px-6 py-14 text-center">
          <div className="flex size-14 items-center justify-center rounded-lg bg-white text-primary shadow-sm">
            <Inbox className="size-7" aria-hidden="true" />
          </div>
          <div>
            <CardTitle>No messages yet</CardTitle>
            <CardDescription className="mt-2 max-w-md">
              Conversations will appear here after a renter or owner sends a
              message about a car.
            </CardDescription>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
      <Card className="overflow-hidden bg-white">
        <CardHeader>
          <CardTitle>Conversations</CardTitle>
          <CardDescription>
            Messages grouped by participant and car listing.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 p-3 pt-0">
          {conversations.map((conversation) => {
            const isSelected = conversation.key === selectedConversation?.key;

            return (
              <button
                className={cn(
                  "rounded-lg border p-3 text-left transition-colors hover:border-sky-200 hover:bg-sky-50",
                  isSelected && "border-primary bg-sky-50",
                )}
                key={conversation.key}
                onClick={() => {
                  setSelectedConversationKey(conversation.key);
                  setError("");
                  setSuccess("");
                }}
                type="button"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-foreground">
                      {conversation.otherUserName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {conversation.carTitle ?? "General conversation"}
                    </p>
                  </div>
                  {conversation.unreadCount > 0 ? (
                    <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                      {conversation.unreadCount}
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                  {conversation.lastMessage.body}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {formatMessageTime(conversation.lastMessage.created_at)}
                </p>
              </button>
            );
          })}
        </CardContent>
      </Card>

      <Card className="min-w-0 bg-white">
        {selectedConversation ? (
          <>
            <CardHeader className="border-b">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle>{selectedConversation.otherUserName}</CardTitle>
                  <CardDescription>
                    {selectedConversation.carTitle ?? "General conversation"}
                    {selectedConversation.carLocation
                      ? ` - ${selectedConversation.carLocation}`
                      : ""}
                  </CardDescription>
                </div>
                {markingReadKey === selectedConversation.key ? (
                  <Loader2
                    className="size-4 animate-spin text-muted-foreground"
                    aria-hidden="true"
                  />
                ) : null}
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 p-4 sm:p-6">
              {error ? (
                <AlertBanner
                  variant="error"
                  message={error}
                  onDismiss={() => setError("")}
                />
              ) : null}
              {success ? (
                <AlertBanner
                  variant="success"
                  message={success}
                  onDismiss={() => setSuccess("")}
                />
              ) : null}

              <div className="grid max-h-[520px] gap-3 overflow-y-auto pr-1">
                {selectedConversation.messages.map((message) => {
                  const isSent = message.sender_id === currentUserId;

                  return (
                    <div
                      className={cn(
                        "flex",
                        isSent ? "justify-end" : "justify-start",
                      )}
                      key={message.id}
                    >
                      <div
                        className={cn(
                          "max-w-[82%] rounded-lg px-4 py-3 text-sm shadow-sm",
                          isSent
                            ? "bg-primary text-primary-foreground"
                            : "border bg-muted/40 text-foreground",
                        )}
                      >
                        <p className="whitespace-pre-wrap">{message.body}</p>
                        <p
                          className={cn(
                            "mt-2 text-[0.7rem]",
                            isSent
                              ? "text-primary-foreground/75"
                              : "text-muted-foreground",
                          )}
                        >
                          {formatMessageTime(message.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="grid gap-3 border-t pt-4">
                <Textarea
                  value={replyBody}
                  onChange={(event) => setReplyBody(event.target.value)}
                  placeholder="Write a reply..."
                  disabled={sending}
                />
                <div className="flex justify-end">
                  <Button onClick={() => void handleSendReply()} disabled={sending}>
                    {sending ? (
                      <Loader2 className="animate-spin" aria-hidden="true" />
                    ) : (
                      <Send aria-hidden="true" />
                    )}
                    {sending ? "Sending..." : "Send reply"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </>
        ) : (
          <CardContent className="flex flex-col items-center gap-4 py-14 text-center">
            <MessageSquare className="size-10 text-muted-foreground" aria-hidden="true" />
            <CardTitle>Select a conversation</CardTitle>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
