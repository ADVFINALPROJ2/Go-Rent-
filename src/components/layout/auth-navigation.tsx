"use client";

import { useEffect, useState } from "react";
import { LogIn, LogOut, UserCircle, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { logoutLocalUser } from "@/app/auth/actions";
import { authNavigation } from "@/lib/routes";
import type { SessionUser } from "@/lib/auth/session";

export function AuthNavigation() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((response) => response.json())
      .then((data: { user: SessionUser | null }) => {
        setUser(data.user);
      })
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  async function handleLogout() {
    setIsSigningOut(true);
    await logoutLocalUser();
    setUser(null);
    router.push("/login");
    router.refresh();
    setIsSigningOut(false);
  }

  if (isLoading) {
    return <div className="h-9 w-36" aria-hidden="true" />;
  }

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
          <Link href={user.role === "admin" ? "/admin/dashboard" : user.role === "owner" ? "/owner/dashboard" : "/renter/dashboard"}>
            <UserCircle aria-hidden="true" />
            <span className="capitalize">{user.role}</span>
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
    <div className="flex items-center gap-2">
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
