import Link from "next/link";
import { Car, Fuel, Gauge, MapPin, Star, Users } from "lucide-react";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Database } from "@/lib/local-types";
import { cn, formatBirr } from "@/lib/utils";

type CarRow = Database["public"]["Tables"]["cars"]["Row"];
type CarCardRow = CarRow & {
  average_rating?: number | null;
  review_count?: number;
};
type CarCardStatus = CarRow["status"];

type CarCardProps = {
  car?: CarCardRow;
  id?: string;
  image?: string | null;
  image_url?: string | null;
  make?: string;
  model?: string;
  year?: number;
  location?: string;
  price_per_day?: number;
  status?: CarCardStatus;
  variant?: "browse" | "dashboard";
  layout?: "grid" | "list";
  actions?: ReactNode;
  showStatus?: boolean;
};

const STATUS_VARIANTS: Record<
  CarCardStatus,
  "secondary" | "success" | "warning" | "muted"
> = {
  draft: "secondary",
  available: "success",
  unavailable: "warning",
  disabled: "muted",
  rented: "warning",
  archived: "muted",
};

function StatusBadge({ status }: { status: CarCardStatus }) {
  return (
    <Badge className="capitalize" variant={STATUS_VARIANTS[status]}>
      {status}
    </Badge>
  );
}

/**
 * Reusable CarCard component for displaying car listings.
 * Accepts a local database car row or direct layout props for static previews.
 */
export function CarCard({
  car,
  id,
  image,
  image_url,
  make,
  model,
  year,
  location,
  price_per_day,
  status,
  variant = "browse",
  layout = "grid",
  actions,
  showStatus = false,
}: CarCardProps) {
  const carId = car?.id ?? id ?? "";
  const imageUrl = car?.image_urls?.[0] ?? image_url ?? image ?? null;
  const carMake = car?.make ?? make ?? "Car";
  const carModel = car?.model ?? model ?? "Model";
  const carYear = car?.year ?? year ?? new Date().getFullYear();
  const carLocation = car?.location ?? location ?? "Location pending";
  const dailyRate = car?.daily_rate ?? price_per_day ?? 0;
  const carStatus = car?.status ?? status ?? "available";
  const title = car?.title ?? `${carMake} ${carModel}`;
  const seats = car?.seats;
  const transmission = car?.transmission;
  const fuelType = car?.fuel_type;
  const category = car?.category;
  const averageRating = car?.average_rating;
  const reviewCount = car?.review_count ?? 0;
  const isList = layout === "list";

  return (
    <Card
      className={cn(
        "group overflow-hidden bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-sky-950/10 dark:bg-zinc-950",
        isList ? "grid sm:grid-cols-[260px_1fr]" : "flex flex-col",
      )}
    >
      <div
        className={cn(
          "relative w-full overflow-hidden bg-muted",
          isList ? "aspect-video sm:h-full sm:min-h-56" : "aspect-video",
        )}
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={title}
            className="size-full object-cover transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-[linear-gradient(135deg,#e0f2fe,#f8fafc_58%,#dbeafe)]">
            <Car className="size-12 text-primary/35" aria-hidden="true" />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/75 to-transparent opacity-90" />
        <div className="absolute right-3 top-3 flex flex-wrap justify-end gap-2">
          {category && variant === "browse" ? (
            <Badge variant="secondary">{category}</Badge>
          ) : null}
          {showStatus ? <StatusBadge status={carStatus} /> : null}
        </div>
        <div className="absolute bottom-3 left-3 rounded-xl bg-white/95 px-3 py-2 shadow-sm backdrop-blur dark:bg-zinc-950/90">
          <p className="text-base font-bold text-primary">
            {formatBirr(dailyRate)}
            <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">/day</span>
          </p>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <CardHeader className="flex-1 pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <CardTitle className="line-clamp-2 text-lg font-black">{title || `${carMake} ${carModel}`}</CardTitle>
              <CardDescription className="font-medium text-slate-500 dark:text-zinc-400">
                {carMake} {carModel}
              </CardDescription>
            </div>
            {typeof averageRating === "number" ? (
              <span className="flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-bold text-amber-600 dark:bg-amber-950/40">
                <Star className="size-3 fill-current" aria-hidden="true" />
                {averageRating.toFixed(1)}
                {reviewCount ? (
                  <span className="font-medium text-amber-700/70 dark:text-amber-200/70">
                    ({reviewCount})
                  </span>
                ) : null}
              </span>
            ) : null}
          </div>
          <p className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-zinc-400">
            <MapPin className="size-3.5" aria-hidden="true" />
            {carYear} - {carLocation}
          </p>
          <div className="grid grid-cols-1 gap-2 pt-2 text-xs text-slate-500 dark:text-zinc-400 sm:grid-cols-3">
            <span className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-2 dark:bg-zinc-900">
              <Users className="size-3.5 text-primary" aria-hidden="true" />
              {seats ? `${seats} seats` : "Seats pending"}
            </span>
            <span className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-2 dark:bg-zinc-900">
              <Gauge className="size-3.5 text-primary" aria-hidden="true" />
              {transmission || "Transmission pending"}
            </span>
            <span className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-2 dark:bg-zinc-900">
              <Fuel className="size-3.5 text-primary" aria-hidden="true" />
              {fuelType || "Fuel pending"}
            </span>
          </div>
        </CardHeader>

        <CardContent className="flex items-center justify-between border-t border-slate-100 pt-4 dark:border-zinc-800">
          {variant === "browse" ? (
            <Button asChild className={cn(isList ? "sm:w-auto" : "w-full")} variant="secondary" size="sm">
              <Link href={`/cars/${carId}`}>View</Link>
            </Button>
          ) : null}

          {variant === "dashboard" ? actions : null}
        </CardContent>
      </div>
    </Card>
  );
}

