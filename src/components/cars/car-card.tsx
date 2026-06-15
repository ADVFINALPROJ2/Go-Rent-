import Link from "next/link";
import { Car, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Database } from "@/lib/supabase/types";

type CarRow = Database["public"]["Tables"]["cars"]["Row"];

type CarCardProps = {
  car: CarRow;
  variant?: "browse" | "dashboard";
  actions?: React.ReactNode;
};

function formatDailyRate(rate: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(rate));
}

/**
 * Reusable CarCard component for displaying car listings.
 * Supports two variants:
 * - browse: For the Browse Cars page (with View button)
 * - dashboard: For the Owner Dashboard (with custom actions slot)
 */
export function CarCard({ car, variant = "browse", actions }: CarCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden">
      {/* Image */}
      <div className="aspect-video w-full overflow-hidden bg-muted">
        {car.image_urls.length > 0 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={car.image_urls[0]}
            alt={car.title}
            className="size-full object-cover transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-[linear-gradient(135deg,#e7eef4,#d8ebe6)]">
            <Car className="size-10 text-muted-foreground/40" aria-hidden="true" />
          </div>
        )}
      </div>

      {/* Details */}
      <CardHeader className="flex-1">
        <CardTitle className="text-lg">{car.title}</CardTitle>
        <CardDescription>
          {car.make} {car.model} · {car.year}
        </CardDescription>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="size-3.5" aria-hidden="true" />
          {car.location}
        </p>
      </CardHeader>

      {/* Footer */}
      <CardContent className="flex items-center justify-between border-t pt-4">
        <p className="text-lg font-semibold text-primary">
          {formatDailyRate(car.daily_rate)}
          <span className="text-sm font-normal text-muted-foreground">/day</span>
        </p>

        {/* Actions based on variant */}
        {variant === "browse" && (
          <Button asChild variant="secondary" size="sm">
            <Link href={`/cars/${car.id}`}>View</Link>
          </Button>
        )}

        {variant === "dashboard" && actions}
      </CardContent>
    </Card>
  );
}
