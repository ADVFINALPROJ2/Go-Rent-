"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { mainNavigation } from "@/lib/routes";
import { cn } from "@/lib/utils";

export function MainNavigation() {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-1 text-sm font-medium lg:flex" aria-label="Main">
      {mainNavigation.map((item) => {
        const isActive =
          item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            className={cn(
              "whitespace-nowrap rounded-lg px-3 py-2 text-slate-600 transition-colors hover:bg-sky-50 hover:text-primary dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-sky-300",
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
