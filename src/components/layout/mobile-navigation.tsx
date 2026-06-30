"use client";

import { LayoutDashboard, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { AuthNavigation } from "@/components/layout/auth-navigation";
import { useCurrentUser } from "@/components/layout/use-current-user";
import { Button } from "@/components/ui/button";
import { getDashboardPath } from "@/lib/profile/constants";
import { mainNavigation } from "@/lib/routes";
import { cn } from "@/lib/utils";

export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useCurrentUser();
  const dashboardHref = user ? getDashboardPath(user.role) : null;
  const dashboardLabel =
    user?.role === "admin"
      ? "Admin Dashboard"
      : user?.role === "owner"
        ? "Owner Dashboard"
        : "Renter Dashboard";

  const visibleNavigation = mainNavigation.filter((item) => {
    if (!item.hideForRoles?.length || !user) {
      return true;
    }

    return !item.hideForRoles.includes(user.role);
  });

  return (
    <div className="lg:hidden">
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((value) => !value)}
      >
        {isOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
      </Button>

      {isOpen ? (
        <div className="absolute inset-x-0 top-full border-b border-slate-200 bg-white/98 px-4 py-4 shadow-xl backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/98 sm:px-6">
          <nav className="grid gap-2 text-sm font-semibold" aria-label="Mobile main">
            {dashboardHref ? (
              <Link
                className="flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-primary shadow-sm transition-colors hover:bg-sky-100 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300"
                href={dashboardHref}
                onClick={() => setIsOpen(false)}
              >
                <LayoutDashboard className="size-4" aria-hidden="true" />
                {dashboardLabel}
              </Link>
            ) : null}
            {visibleNavigation.map((item) => {
              const isActive =
                item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  className={cn(
                    "rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-700 shadow-sm transition-colors hover:border-sky-200 hover:bg-sky-50 hover:text-primary dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800",
                    isActive && "border-sky-200 bg-sky-50 text-primary dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300",
                  )}
                  href={item.href}
                  key={item.href}
                  onClick={() => setIsOpen(false)}
                  aria-current={isActive ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-4 border-t border-slate-100 pt-4 dark:border-zinc-800">
            <AuthNavigation className="w-full flex-wrap justify-start" />
          </div>
        </div>
      ) : null}
    </div>
  );
}
