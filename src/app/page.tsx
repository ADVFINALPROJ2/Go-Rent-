import { ArrowRight, Car, ShieldCheck, Users } from "lucide-react";
import Link from "next/link";

import { PageHeading } from "@/components/page-heading";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const highlights = [
  {
    title: "Owner listings",
    description: "Vehicle owners can prepare listings with pricing, photos, and availability.",
    icon: Car,
  },
  {
    title: "Rental requests",
    description: "Renters can browse cars and begin a booking request from a vehicle page.",
    icon: Users,
  },
  {
    title: "Trusted records",
    description: "Profiles, bookings, messages, and reviews share one Supabase-backed data model.",
    icon: ShieldCheck,
  },
];

export default function HomePage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 py-12 sm:px-6 lg:px-8">
      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-6">
          <PageHeading
            eyebrow="Day 1 foundation"
            title="Rent nearby cars from local owners."
            description="GoRent starts with the routes, schema, Supabase connection points, and shared UI structure needed for feature teams to build safely in parallel."
          />
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/browse">
                Browse cars
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/owner/dashboard">Owner dashboard</Link>
            </Button>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="aspect-[4/3] rounded-md bg-[linear-gradient(135deg,#d8ebe6,#f6e7c8_55%,#dbeafe)] p-6">
            <div className="flex h-full flex-col justify-between rounded-md border border-white/70 bg-white/70 p-5 shadow-sm backdrop-blur">
              <div>
                <p className="text-sm font-medium text-primary">Featured route</p>
                <h2 className="mt-2 text-2xl font-semibold">City weekend pickup</h2>
              </div>
              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-md bg-background p-3">
                  <p className="text-muted-foreground">Daily rate</p>
                  <p className="text-lg font-semibold">$48</p>
                </div>
                <div className="rounded-md bg-background p-3">
                  <p className="text-muted-foreground">Availability</p>
                  <p className="text-lg font-semibold">Open</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {highlights.map((item) => (
          <Card key={item.title}>
            <CardHeader>
              <div className="flex size-10 items-center justify-center rounded-md bg-accent text-accent-foreground">
                <item.icon className="size-5" aria-hidden="true" />
              </div>
              <CardTitle>{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{item.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
