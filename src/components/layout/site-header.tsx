import { CarFront } from "lucide-react";
import Link from "next/link";

import { AuthNavigation } from "@/components/layout/auth-navigation";
import { mainNavigation } from "@/lib/routes";

export function SiteHeader() {
  return (
    <header className="border-b bg-card">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link className="flex items-center gap-2 font-semibold" href="/">
            <span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <CarFront className="size-5" aria-hidden="true" />
            </span>
            <span className="text-lg">GoRent</span>
          </Link>
          <AuthNavigation />
        </div>
        <nav className="flex gap-2 overflow-x-auto pb-1 text-sm" aria-label="Main">
          {mainNavigation.map((item) => (
            <Link
              className="whitespace-nowrap rounded-md px-3 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
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
