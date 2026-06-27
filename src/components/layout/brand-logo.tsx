import { CarFront, MapPin } from "lucide-react";
import Link from "next/link";

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
      <span className="relative grid size-12 shrink-0 place-items-center rounded-2xl bg-[linear-gradient(135deg,#0ea5e9,#0369a1)] text-white shadow-lg shadow-sky-500/25 ring-1 ring-white/20">
        <span className="absolute -right-1 -top-1 size-4 rounded-full border-2 border-white bg-emerald-400 shadow-sm" />
        <span className="absolute inset-1 rounded-[1rem] border border-white/20" />
        <CarFront className="relative size-6" aria-hidden="true" />
        <span className="absolute -bottom-1 -left-1 grid size-5 place-items-center rounded-full border-2 border-white bg-slate-950 text-sky-300 shadow-sm">
          <MapPin className="size-3" aria-hidden="true" />
        </span>
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
