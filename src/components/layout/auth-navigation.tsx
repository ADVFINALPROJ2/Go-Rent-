"use client";

import { useEffect, useState } from "react";
import { LogIn, LogOut, UserPlus } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { logoutLocalUser } from "@/app/auth/actions";
import { authNavigation } from "@/lib/routes";
import type { SessionUser } from "@/lib/auth/session";
import { cn } from "@/lib/utils";

type NavigationUser = SessionUser & {
  fullName?: string | null;
};

type AuthNavigationProps = {
  className?: string;
};

export function AuthNavigation({ className }: AuthNavigationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<NavigationUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    let isCurrent = true;

    fetch("/api/auth/me", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: { user: NavigationUser | null }) => {
        if (isCurrent) {
          setUser(data.user);
        }
      })
      .catch(() => {
        if (isCurrent) {
          setUser(null);
        }
      })
      .finally(() => {
        if (isCurrent) {
          setIsLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [pathname]);

  async function handleLogout() {
    setIsSigningOut(true);
    await logoutLocalUser();
    setUser(null);
    router.push("/login");
    router.refresh();
    setIsSigningOut(false);
  }

  if (isLoading) {
    return <div className={cn("h-9 w-36", className)} aria-hidden="true" />;
  }

  if (user) {
    const dashboardHref =
      user.role === "admin"
        ? "/admin/dashboard"
        : user.role === "owner"
          ? "/owner/dashboard"
          : "/renter/dashboard";
    const displayName = user.fullName || user.email;
    const initials = displayName
      .split(/[ @]/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");

    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Button asChild variant="ghost" size="sm" className="h-auto gap-2 px-2 py-1.5">
          <Link href={dashboardHref}>
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-black text-primary dark:bg-sky-950">
              {initials || "GR"}
            </span>
            <span className="hidden text-left leading-tight sm:block">
              <span className="block max-w-28 truncate text-xs font-bold text-slate-950 dark:text-white">
                {displayName}
              </span>
              <span className="block text-[0.68rem] font-semibold capitalize text-slate-500 dark:text-zinc-400">
                {user.role}
              </span>
            </span>
          </Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          disabled={isSigningOut}
          type="button"
        >
          <LogOut aria-hidden="true" />
          {isSigningOut ? "Logging out..." : "Logout"}
        </Button>
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
