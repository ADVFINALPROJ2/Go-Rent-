import { CarFront, Search } from "lucide-react";
import Link from "next/link";

import { AuthNavigation } from "@/components/layout/auth-navigation";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { mainNavigation } from "@/lib/routes";

export function SiteHeader() {
  const compactNavigation = mainNavigation.filter(
    (item) => !["/owner/dashboard/cars", "/profile"].includes(item.href),
  );

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl transition-colors dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <Link className="flex items-center gap-2 font-bold text-slate-950 dark:text-white" href="/">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-sky-500/20">
              <CarFront className="size-5" aria-hidden="true" />
            </span>
            <span className="text-xl tracking-tight">
              Go<span className="text-primary">Rent</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-1 text-sm font-medium lg:flex" aria-label="Main">
            {compactNavigation.map((item) => (
              <Link
                className="whitespace-nowrap rounded-lg px-3 py-2 text-slate-600 transition-colors hover:bg-sky-50 hover:text-primary dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-sky-300"
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link
              className="hidden size-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:bg-sky-50 hover:text-primary dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 sm:flex"
              href="/browse"
              aria-label="Search cars"
            >
              <Search className="size-4" aria-hidden="true" />
            </Link>
            <ThemeToggle />
            <AuthNavigation />
          </div>
        </div>
        <nav className="flex gap-2 overflow-x-auto pb-1 text-sm font-medium lg:hidden" aria-label="Main">
          {compactNavigation.map((item) => (
            <Link
              className="whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-600 shadow-sm transition-colors hover:bg-sky-50 hover:text-primary dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
