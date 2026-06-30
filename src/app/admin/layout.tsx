import { ExternalLink, LogOut } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { logoutLocalUser } from "@/app/auth/actions";
import { BrandLogo } from "@/components/layout/brand-logo";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/session";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentUser = await getCurrentUser();

  async function logoutAction() {
    "use server";

    await logoutLocalUser();
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950 dark:bg-zinc-950 dark:text-white">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <BrandLogo href="/admin" label="GoRent Admin" subtitle="Admin Portal" />

          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/">
                <ExternalLink aria-hidden="true" />
                View Site
              </Link>
            </Button>
            {currentUser ? (
              <form action={logoutAction}>
                <Button type="submit" variant="outline" size="sm">
                  <LogOut aria-hidden="true" />
                  Logout
                </Button>
              </form>
            ) : null}
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
