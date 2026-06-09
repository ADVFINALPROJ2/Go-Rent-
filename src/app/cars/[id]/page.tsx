import { CalendarDays, MapPin, MessageSquare } from "lucide-react";

import { PageHeading } from "@/components/page-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

type CarDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CarDetailsPage({ params }: CarDetailsPageProps) {
  const { id } = await params;

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
      <section className="space-y-6">
        <div className="aspect-[16/9] rounded-lg border bg-[linear-gradient(135deg,#e7eef4,#f6e7c8_60%,#d8ebe6)]" />
        <PageHeading
          eyebrow={`Car ID: ${id}`}
          title="Vehicle details"
          description="Photos, specs, owner profile, availability, and rental terms will be loaded from Supabase."
        />
        <div className="grid gap-4 sm:grid-cols-3">
          {["Transmission", "Seats", "Fuel"].map((label) => (
            <Card key={label}>
              <CardHeader>
                <CardTitle className="text-base">{label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Pending listing data</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <aside className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Request rental</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays className="size-4" aria-hidden="true" />
              Dates and availability connect to bookings.
            </p>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="size-4" aria-hidden="true" />
              Pickup location comes from the car listing.
            </p>
            <Textarea placeholder="Message the owner about your trip" />
            <Button>
              <MessageSquare aria-hidden="true" />
              Send request
            </Button>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
