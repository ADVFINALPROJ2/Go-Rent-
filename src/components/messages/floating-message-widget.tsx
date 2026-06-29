"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MessageSquare, X, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { getMessageSummary, type MessageSummaryResult } from "@/lib/actions/messages";

function formatRelativeTime(isoString: string) {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

function getInitials(name: string) {
  return name
    .split(/[ @]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function FloatingMessageWidget() {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<MessageSummaryResult>({
    authenticated: false,
    unreadCount: 0,
    conversations: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchSummary = useCallback(async () => {
    try {
      const summary = await getMessageSummary();
      setData(summary);
    } catch (e) {
      console.error("Failed to fetch message summary:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch summary on load and path change
  useEffect(() => {
    void fetchSummary();
  }, [pathname, fetchSummary]);

  // Fetch when widget is opened
  useEffect(() => {
    if (isOpen) {
      void fetchSummary();
    }
  }, [isOpen, fetchSummary]);

  // Close widget on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Poll for unread count every 25 seconds if authenticated
  useEffect(() => {
    if (!data.authenticated) return;

    const interval = setInterval(() => {
      void fetchSummary();
    }, 25000);

    return () => clearInterval(interval);
  }, [data.authenticated, fetchSummary]);

  return (
    <div className="fixed bottom-6 right-6 z-40 md:bottom-8 md:right-8" ref={containerRef}>
      {/* Floating Panel */}
      {isOpen && (
        <div 
          className="absolute bottom-16 right-0 mb-3 w-[calc(100vw-2rem)] sm:w-[380px] max-h-[500px] flex flex-col rounded-2xl border border-slate-200/80 bg-white/95 backdrop-blur-md shadow-2xl transition-all duration-200 dark:border-zinc-800/80 dark:bg-zinc-950/95"
          role="dialog"
          aria-modal="true"
          aria-labelledby="widget-header-title"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 p-4 dark:border-zinc-800/60">
            <div>
              <h3 id="widget-header-title" className="text-sm font-bold text-slate-900 dark:text-white">
                Messages
              </h3>
              <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                Recent renter-owner conversations
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 rounded-full text-slate-500 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
              onClick={() => setIsOpen(false)}
              aria-label="Close messages panel"
            >
              <X className="size-4" />
            </Button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[340px]">
            {loading && data.conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500 dark:text-zinc-400">
                <Loader2 className="size-6 animate-spin text-sky-500" />
                <span className="mt-2 text-xs font-semibold">Loading messages...</span>
              </div>
            ) : !data.authenticated ? (
              /* Logged out view */
              <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
                <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-sky-50 text-sky-500 dark:bg-sky-950/50 dark:text-sky-400">
                  <MessageSquare className="size-5" />
                </div>
                <p className="text-sm font-semibold text-slate-700 dark:text-zinc-300">
                  Log in or create an account to view messages.
                </p>
                <div className="mt-5 flex w-full flex-col gap-2">
                  <Button asChild size="sm" className="w-full">
                    <Link href="/login" onClick={() => setIsOpen(false)}>
                      Login
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link href="/register" onClick={() => setIsOpen(false)}>
                      Register
                    </Link>
                  </Button>
                </div>
              </div>
            ) : data.conversations.length === 0 ? (
              /* Empty state view */
              <div className="flex flex-col items-center justify-center px-4 py-12 text-center text-slate-500 dark:text-zinc-400">
                <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-slate-50 dark:bg-zinc-900">
                  <MessageSquare className="size-5 text-slate-400" />
                </div>
                <p className="text-xs font-semibold leading-relaxed max-w-[240px]">
                  No messages yet. Start by messaging an owner from a car page.
                </p>
              </div>
            ) : (
              /* Conversations list */
              <div className="space-y-1">
                {data.conversations.slice(0, 4).map((conversation) => (
                  <Link
                    key={conversation.key}
                    href="/messages"
                    onClick={() => setIsOpen(false)}
                    className="flex items-start gap-3 rounded-xl border border-transparent p-2.5 transition-colors hover:bg-sky-50/60 dark:hover:bg-zinc-900/60"
                  >
                    {/* Avatar */}
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sky-100 text-[11px] font-black text-sky-700 dark:bg-sky-950/70 dark:text-sky-300">
                      {getInitials(conversation.otherUserName) || "GR"}
                    </div>

                    {/* Meta info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {conversation.otherUserName}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-zinc-500 whitespace-nowrap ml-2">
                          {formatRelativeTime(conversation.lastMessageCreatedAt)}
                        </span>
                      </div>
                      
                      {conversation.carTitle && (
                        <div className="text-[10px] font-medium text-sky-600 dark:text-sky-400 truncate mt-0.5">
                          {conversation.carTitle}
                        </div>
                      )}

                      <p className={`text-[11px] mt-1 truncate ${
                        conversation.unreadCount > 0 
                          ? "font-semibold text-slate-950 dark:text-white" 
                          : "text-slate-500 dark:text-zinc-400"
                      }`}>
                        {conversation.lastMessageBody}
                      </p>
                    </div>

                    {/* Unread dot */}
                    {conversation.unreadCount > 0 && (
                      <div className="size-2 rounded-full bg-sky-500 self-center shrink-0 ml-1" />
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {data.authenticated && data.conversations.length > 0 && (
            <div className="border-t border-slate-100 bg-slate-50/50 p-2.5 dark:border-zinc-800/60 dark:bg-zinc-900/20">
              <Button asChild variant="ghost" size="sm" className="w-full text-xs gap-1 py-1.5 h-auto text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300">
                <Link href="/messages" onClick={() => setIsOpen(false)}>
                  View all messages <ArrowRight className="size-3" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Floating Circular Button */}
      <button
        type="button"
        className="relative flex size-14 items-center justify-center rounded-full bg-sky-500 text-white shadow-lg shadow-sky-500/25 hover:bg-sky-600 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-950"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Close messages" : "Open messages"}
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="size-6" /> : <MessageSquare className="size-6" />}

        {/* Badge */}
        {data.authenticated && data.unreadCount > 0 && (
          <span 
            className="absolute -top-1 -right-1 flex min-size-6 px-1.5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white ring-2 ring-white dark:ring-zinc-950 animate-in zoom-in duration-200"
            aria-label={`${data.unreadCount} unread messages`}
          >
            {data.unreadCount}
          </span>
        )}
      </button>
    </div>
  );
}
