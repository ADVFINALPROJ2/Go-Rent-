import { Search } from "lucide-react";
import Link from "next/link";

import { BrandLogo } from "@/components/layout/brand-logo";
import { AuthNavigation } from "@/components/layout/auth-navigation";
import { MainNavigation } from "@/components/layout/main-navigation";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl transition-colors dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <BrandLogo compact />
          <MainNavigation />
          <div className="flex items-center gap-2">
            <Link
              className="hidden size-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:bg-sky-50 hover:text-primary dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 sm:flex"
              href="/browse"
              aria-label="Search cars"
            >
              <Search className="size-4" aria-hidden="true" />
            </Link>
            <ThemeToggle />
            <AuthNavigation className="hidden md:flex" />
            <MobileNavigation />
          </div>
        </div>
      </div>
    </header>
  );
}
