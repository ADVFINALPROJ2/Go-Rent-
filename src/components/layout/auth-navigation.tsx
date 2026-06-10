"use client";

import { useEffect, useState } from "react";
import { LogIn, LogOut, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import { Button } from "@/components/ui/button";
import { authNavigation } from "@/lib/routes";
import { supabase } from "@/lib/supabase/client";

export function AuthNavigation() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(supabase));
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    if (!supabase) {
      return;
    }

    setIsSigningOut(true);
    await supabase.auth.signOut();
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
