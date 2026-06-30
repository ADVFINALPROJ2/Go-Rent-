"use client";

import Link from "next/link";
import Image from "next/image";

import { cn } from "@/lib/utils";

type BrandLogoProps = {
  href?: string;
  label?: string;
  subtitle?: string;
  className?: string;
  compact?: boolean;
  dark?: boolean;
};

export function BrandLogo({
  href = "/",
  label = "GoRent",
  subtitle,
  className,
  compact = false,
  dark = false,
}: BrandLogoProps) {
  return (
    <Link
      className={cn(
        "group inline-flex items-center gap-3 rounded-2xl transition-transform hover:-translate-y-0.5",
        className,
      )}
      href={href}
      aria-label={`${label}${subtitle ? ` ${subtitle}` : ""}`}
    >
      <span className="relative flex h-12 w-24 shrink-0 items-center justify-center">
        <Image
          src="/brand/gorent-navbar-logo.png"
          alt=""
          width={468}
          height={246}
          className="h-full w-auto object-contain drop-shadow-sm"
          priority
          aria-hidden="true"
        />
      </span>

      <span className={cn("leading-none", compact && "hidden sm:block")}>
        <span
          className={cn(
            "block text-[1.35rem] font-black tracking-tight",
            dark ? "text-white" : "text-slate-950 dark:text-white",
          )}
        >
          Go<span className="text-sky-500">Rent</span>
        </span>
        {subtitle ? (
          <span
            className={cn(
              "mt-1 block text-[0.68rem] font-black uppercase tracking-[0.22em]",
              dark ? "text-slate-400" : "text-slate-500 dark:text-zinc-400",
            )}
          >
            {subtitle}
          </span>
        ) : null}
      </span>
    </Link>
  );
}
