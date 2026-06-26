import { MessageSquareMore } from "lucide-react";

import { MessagesClient } from "@/components/messages/messages-client";
import { PageHeading } from "@/components/page-heading";

export default function MessagesPage() {
  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-sky-100 bg-[linear-gradient(135deg,#ffffff,#eef8ff)] p-5 shadow-xl shadow-sky-950/10 dark:border-zinc-800 dark:bg-[linear-gradient(135deg,#111113,#0f172a)] sm:p-7">
        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-primary dark:bg-sky-950">
            <MessageSquareMore className="size-6" aria-hidden="true" />
          </div>
          <PageHeading
            eyebrow="Messages"
            title="Your conversations"
            description="Read stored messages about cars and bookings, then reply to owners or renters from one place."
          />
        </div>
      </div>

      <MessagesClient />
    </main>
  );
}
