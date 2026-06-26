"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { AuthNavigation } from "@/components/layout/auth-navigation";
import { Button } from "@/components/ui/button";
import { mainNavigation } from "@/lib/routes";

export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((value) => !value)}
      >
        {isOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
      </Button>

      {isOpen ? (
        <div className="absolute inset-x-0 top-full border-b border-slate-200 bg-white/98 px-4 py-4 shadow-xl backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/98 sm:px-6">
          <nav className="grid gap-2 text-sm font-semibold" aria-label="Mobile main">
            {mainNavigation.map((item) => (
              <Link
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-700 shadow-sm transition-colors hover:border-sky-200 hover:bg-sky-50 hover:text-primary dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                href={item.href}
                key={item.href}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 border-t border-slate-100 pt-4 dark:border-zinc-800">
            <AuthNavigation className="w-full flex-wrap justify-start" />
          </div>
        </div>
      ) : null}
    </div>
  );
}
