import Link from "next/link";
import { Car, MapPin } from "lucide-react";
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
import type { Database } from "@/lib/supabase/types";

type CarRow = Database["public"]["Tables"]["cars"]["Row"];
type CarCardStatus = CarRow["status"];

type CarCardProps = {
  car?: CarRow;
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
  archived: "muted",
};

function formatDailyRate(rate: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(rate));
}

function StatusBadge({ status }: { status: CarCardStatus }) {
  return (
    <Badge className="capitalize" variant={STATUS_VARIANTS[status]}>
      {status}
    </Badge>
  );
}

/**
 * Reusable CarCard component for displaying car listings.
 * Accepts a Supabase car row or direct layout props for static previews.
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

  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={title}
            className="size-full object-cover transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-[linear-gradient(135deg,#e7eef4,#d8ebe6)]">
            <Car className="size-10 text-muted-foreground/40" aria-hidden="true" />
          </div>
        )}
        {showStatus ? (
          <div className="absolute right-2 top-2">
            <StatusBadge status={carStatus} />
          </div>
        ) : null}
      </div>

      <CardHeader className="flex-1">
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>
          {carMake} {carModel} - {carYear}
        </CardDescription>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="size-3.5" aria-hidden="true" />
          {carLocation}
        </p>
      </CardHeader>

      <CardContent className="flex items-center justify-between border-t pt-4">
        <p className="text-lg font-semibold text-primary">
          {formatDailyRate(dailyRate)}
          <span className="text-sm font-normal text-muted-foreground">/day</span>
        </p>

        {variant === "browse" ? (
          <Button asChild variant="secondary" size="sm">
            <Link href={`/cars/${carId}`}>View</Link>
          </Button>
        ) : null}

        {variant === "dashboard" ? actions : null}
      </CardContent>
    </Card>
  );
}
