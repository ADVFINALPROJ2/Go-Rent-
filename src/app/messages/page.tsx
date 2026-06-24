import { MessageSquareMore } from "lucide-react";

export default function MessagesPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-4 px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-lg border bg-card p-8 shadow-sm">
        <div className="flex items-center gap-3">
          <MessageSquareMore className="size-6" aria-hidden="true" />
          <div>
            <h1 className="text-xl font-semibold">Messages</h1>
            <p className="text-sm text-muted-foreground">
              Messaging is not part of this owner booking task, but this route is available for the app shell.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
