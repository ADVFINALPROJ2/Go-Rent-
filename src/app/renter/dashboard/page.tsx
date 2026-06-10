import { CalendarCheck, CarFront, MessageSquare } from "lucide-react";

import { PageHeading } from "@/components/page-heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const activity = [
  { label: "Upcoming trips", value: "0", icon: CalendarCheck },
  { label: "Saved cars", value: "0", icon: CarFront },
  { label: "Unread messages", value: "0", icon: MessageSquare },
];

export default function RenterDashboardPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <PageHeading
        eyebrow="Renter dashboard"
        title="Track trips, requests, and conversations."
        description="Renters will manage bookings, message owners, and review completed rentals from this area."
      />
      <section className="grid gap-4 md:grid-cols-3">
        {activity.map((item) => (
          <Card key={item.label}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">{item.label}</CardTitle>
              <item.icon className="size-5 text-primary" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
