"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import type { AccountStatus, ProfileRole } from "@/lib/local-types";

export type NavigationUser = {
  id: string;
  email: string;
  role: ProfileRole;
  status: AccountStatus;
  fullName?: string | null;
};

type AuthMeResponse = {
  user: NavigationUser | null;
};

export function useCurrentUser() {
  const pathname = usePathname();
  const [user, setUser] = useState<NavigationUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCurrent = true;

    fetch("/api/auth/me", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: AuthMeResponse) => {
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

  return { user, isLoading };
}
