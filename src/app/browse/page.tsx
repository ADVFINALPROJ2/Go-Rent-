import { MapPin, SlidersHorizontal } from "lucide-react";
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

const sampleCars = [
  { id: "sample-sedan", name: "Toyota Corolla", location: "Nairobi West", rate: "$42/day" },
  { id: "sample-suv", name: "Subaru Forester", location: "Kilimani", rate: "$68/day" },
  { id: "sample-ev", name: "Nissan Leaf", location: "Westlands", rate: "$51/day" },
];

export default function BrowseCarsPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <PageHeading
          eyebrow="Browse cars"
          title="Available vehicles"
          description="Search, filters, location matching, and availability checks will connect here."
        />
        <Button variant="outline">
          <SlidersHorizontal aria-hidden="true" />
          Filters
        </Button>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        {sampleCars.map((car) => (
          <Card key={car.id}>
            <CardHeader>
              <div className="aspect-video rounded-md bg-[linear-gradient(135deg,#e7eef4,#d8ebe6)]" />
              <CardTitle>{car.name}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <MapPin className="size-4" aria-hidden="true" />
                {car.location}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <p className="font-semibold">{car.rate}</p>
              <Button asChild variant="secondary" size="sm">
                <Link href={`/cars/${car.id}`}>View</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
