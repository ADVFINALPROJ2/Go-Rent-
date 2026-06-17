"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, MessageSquare } from "lucide-react";

import { MessageOwnerForm } from "@/components/messages/message-owner-form";
import { PageHeading } from "@/components/page-heading";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  fetchProfilesByIds,
  fetchUserMessages,
  type MessageWithProfiles,
} from "@/lib/messages/queries";

type ConversationSummary = {
  partnerId: string;
  partnerName: string;
  lastMessageAt: string;
  preview: string;
  messages: MessageWithProfiles[];
};

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function MessagesPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageWithProfiles[]>([]);
  const [profiles, setProfiles] = useState<Record<string, { full_name?: string | null }>>(
    {},
  );
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMessages() {
      setIsLoading(true);
      setError(null);

      const supabase = createSupabaseBrowserClient();
      if (!supabase) {
        setError(
          "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
        );
        setIsLoading(false);
        return;
      }

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setUserId(null);
        setMessages([]);
        setIsLoading(false);
        return;
      }

      setUserId(user.id);

      try {
        const fetchedMessages = await fetchUserMessages(user.id);
        setMessages(fetchedMessages as MessageWithProfiles[]);

        const profileIds = Array.from(
          new Set(
            fetchedMessages.flatMap((message) => [
              message.sender_id,
              message.receiver_id,
            ]),
          ),
        );

        const profileMap = await fetchProfilesByIds(profileIds);
        setProfiles(profileMap);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load your messages right now.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadMessages();
  }, []);

  const conversations = useMemo<ConversationSummary[]>(() => {
    if (!userId) {
      return [];
    }

    const grouped = new Map<string, ConversationSummary>();

    for (const message of messages) {
      const partnerId = message.sender_id === userId ? message.receiver_id : message.sender_id;
      const partnerProfile = profiles[partnerId];
      const partnerName = partnerProfile?.full_name ?? "Unknown user";
      const existing = grouped.get(partnerId);
      const preview = message.body.trim().slice(0, 80);

      if (existing) {
        existing.messages.push(message);
        existing.lastMessageAt =
          message.created_at > existing.lastMessageAt
            ? message.created_at
            : existing.lastMessageAt;
        existing.preview = preview;
      } else {
        grouped.set(partnerId, {
          partnerId,
          partnerName,
          lastMessageAt: message.created_at,
          preview,
          messages: [message],
        });
      }
    }

    return Array.from(grouped.values()).sort(
      (left, right) =>
        new Date(right.lastMessageAt).getTime() - new Date(left.lastMessageAt).getTime(),
    );
  }, [messages, profiles, userId]);

  const selectedConversation =
    conversations.find((conversation) => conversation.partnerId === selectedPartnerId) ??
    conversations[0] ??
    null;

  if (isLoading) {
    return (
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-12 sm:px-6 lg:px-8">
        <PageHeading
          eyebrow="Messages"
          title="Loading conversations"
          description="Fetching your inbox now."
        />
        <div className="flex items-center gap-2 rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading messages...
        </div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12 sm:px-6 lg:px-8">
        <PageHeading
          eyebrow="Messages"
          title="Sign in to view messages"
          description="You need an account before you can read or send messages."
        />
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-6 text-sm text-amber-900">
            Please log in to see your conversations.
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12 sm:px-6 lg:px-8">
        <PageHeading
          eyebrow="Messages"
          title="Unable to load messages"
          description="There was a problem loading your inbox."
        />
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-6 text-sm text-destructive">{error}</CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <PageHeading
        eyebrow="Messages"
        title="Inbox"
        description="Review conversations and send follow-up questions."
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Conversations</CardTitle>
            <CardDescription>
              {conversations.length} conversation{conversations.length === 1 ? "" : "s"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 p-3">
            {conversations.length === 0 ? (
              <div className="flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20 p-6 text-center text-sm text-muted-foreground">
                <MessageSquare className="size-5" />
                <p className="mt-2">No messages yet.</p>
              </div>
            ) : (
              conversations.map((conversation) => (
                <button
                  key={conversation.partnerId}
                  type="button"
                  onClick={() => setSelectedPartnerId(conversation.partnerId)}
                  className={`w-full rounded-lg border p-3 text-left transition-colors ${
                    selectedConversation?.partnerId === conversation.partnerId
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">{conversation.partnerName}</p>
                    <span className="text-xs text-muted-foreground">
                      {formatTimestamp(conversation.lastMessageAt)}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {conversation.preview}
                  </p>
                </button>
              ))
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          {selectedConversation ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>{selectedConversation.partnerName}</CardTitle>
                  <CardDescription>
                    {selectedConversation.messages.length} message
                    {selectedConversation.messages.length === 1 ? "" : "s"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {selectedConversation.messages.map((message) => {
                    const isSender = message.sender_id === userId;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isSender ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg border p-3 text-sm ${
                            isSender
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <p>{message.body}</p>
                          <p
                            className={`mt-2 text-xs ${
                              isSender ? "text-primary-foreground/80" : "text-muted-foreground"
                            }`}
                          >
                            {isSender ? "You" : selectedConversation.partnerName} · {formatTimestamp(message.created_at)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <MessageOwnerForm
                receiverId={selectedConversation.partnerId}
                receiverName={selectedConversation.partnerName}
                onSuccess={() => {
                  const refreshMessages = async () => {
                    if (!userId) return;
                    const refreshedMessages = await fetchUserMessages(userId);
                    setMessages(refreshedMessages as MessageWithProfiles[]);
                  };

                  void refreshMessages();
                }}
              />
            </>
          ) : (
            <Card>
              <CardContent className="flex min-h-64 items-center justify-center text-sm text-muted-foreground">
                Select a conversation to view the thread.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
