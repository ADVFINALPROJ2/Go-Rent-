"use client";

import { useState } from "react";
import { ChevronDown, LayoutDashboard, LogIn, LogOut, User, UserPen, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { logoutLocalUser } from "@/app/auth/actions";
import { authNavigation } from "@/lib/routes";
import { ProfileAvatar } from "@/components/profile/profile-avatar";
import { getDashboardPath } from "@/lib/profile/constants";
import { cn } from "@/lib/utils";
import { useCurrentUser } from "@/components/layout/use-current-user";

type AuthNavigationProps = {
  className?: string;
};

export function AuthNavigation({ className }: AuthNavigationProps) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isLoading } = useCurrentUser();

  async function handleLogout() {
    setIsSigningOut(true);
    setIsMenuOpen(false);
    await logoutLocalUser();
    router.push("/login");
    router.refresh();
    setIsSigningOut(false);
  }

  if (isLoading) {
    return <div className={cn("h-9 w-36", className)} aria-hidden="true" />;
  }

  if (user) {
    const dashboardHref = getDashboardPath(user.role);
    const dashboardLabel =
      user.role === "admin"
        ? "Admin Dashboard"
        : user.role === "owner"
          ? "Owner Dashboard"
          : "Renter Dashboard";
    const displayName = user.fullName || user.email;
    const dropdownLinks = [
      { href: "/profile", label: "Profile", icon: User },
      { href: "/profile/edit", label: "Edit Profile", icon: UserPen },
      { href: dashboardHref, label: "Dashboard", icon: LayoutDashboard },
    ];

    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Button asChild variant="ghost" size="sm" className="hidden lg:inline-flex">
          <Link href={dashboardHref}>
            <LayoutDashboard aria-hidden="true" />
            {dashboardLabel}
          </Link>
        </Button>
        <div className="relative">
          <button
            type="button"
            className="flex items-center gap-2 rounded-full border border-slate-200 bg-white p-1 pr-2 shadow-sm transition-colors hover:border-sky-200 hover:bg-sky-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
            aria-label="Open profile menu"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((value) => !value)}
          >
            <ProfileAvatar
              name={displayName}
              avatarUrl={user.avatarUrl ?? null}
              size="sm"
              className="border-0 shadow-none"
            />
            <ChevronDown
              className={cn("size-4 text-slate-500 transition-transform", isMenuOpen && "rotate-180")}
              aria-hidden="true"
            />
          </button>

          {isMenuOpen ? (
            <div className="absolute right-0 z-50 mt-3 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
              <div className="border-b border-slate-100 px-4 py-3 dark:border-zinc-800">
                <p className="truncate text-sm font-bold text-slate-950 dark:text-white">{displayName}</p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                <p className="mt-1 text-xs font-semibold capitalize text-primary">{user.role}</p>
              </div>
              <div className="grid p-2">
                {dropdownLinks.map((item) => {
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-sky-50 hover:text-primary dark:text-zinc-200 dark:hover:bg-zinc-900"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Icon className="size-4" aria-hidden="true" />
                      {item.label}
                    </Link>
                  );
                })}
                <button
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-slate-700 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60 dark:text-zinc-200 dark:hover:bg-red-950/30"
                  disabled={isSigningOut}
                  onClick={handleLogout}
                  type="button"
                >
                  <LogOut className="size-4" aria-hidden="true" />
                  {isSigningOut ? "Logging out..." : "Logout"}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button asChild variant="ghost" size="sm">
        <Link href={authNavigation[0].href}>
          <LogIn aria-hidden="true" />
          {authNavigation[0].label}
        </Link>
      </Button>
      <Button asChild size="sm">
        <Link href={authNavigation[1].href}>
          <UserPlus aria-hidden="true" />
          {authNavigation[1].label}
        </Link>
      </Button>
    </div>
  );
}
