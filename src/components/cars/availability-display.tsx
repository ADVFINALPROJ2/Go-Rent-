import { CheckCircle2, Clock, XCircle } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type AvailabilityDisplayProps = {
  isAvailable: boolean | null;
  notes?: string | null;
  className?: string;
};

export function AvailabilityDisplay({
  isAvailable,
  notes,
  className,
}: AvailabilityDisplayProps) {
  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className="text-base">Availability</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        {isAvailable === null ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="size-4 shrink-0" aria-hidden="true" />
            <span>Availability information not yet available.</span>
          </div>
        ) : isAvailable ? (
          <div className="flex items-center gap-2 text-sm text-emerald-700">
            <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
            <span className="font-medium">Available now</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-red-700">
            <XCircle className="size-4 shrink-0" aria-hidden="true" />
            <span className="font-medium">Unavailable</span>
          </div>
        )}

        {notes ? (
          <p className="text-sm leading-relaxed text-muted-foreground">
            {notes}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
