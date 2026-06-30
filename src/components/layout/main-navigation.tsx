"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { mainNavigation } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { useCurrentUser } from "@/components/layout/use-current-user";

export function MainNavigation() {
  const pathname = usePathname();
  const { user, isLoading } = useCurrentUser();

  const visibleNavigation = mainNavigation.filter((item) => {
    if (!item.hideForRoles?.length || !user) {
      return true;
    }

    return !item.hideForRoles.includes(user.role);
  });

  if (isLoading) {
    return <nav className="hidden lg:flex" aria-label="Main" />;
  }

  return (
    <nav className="hidden flex-1 items-center justify-center gap-2 text-[0.95rem] font-semibold lg:flex" aria-label="Main">
      {visibleNavigation.map((item) => {
        const isActive =
          item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            className={cn(
              "whitespace-nowrap rounded-full px-4 py-2.5 text-slate-600 transition-colors hover:bg-sky-50 hover:text-primary dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-sky-300",
              isActive && "bg-sky-50 text-primary dark:bg-zinc-900 dark:text-sky-300",
            )}
            href={item.href}
            key={item.href}
            aria-current={isActive ? "page" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
