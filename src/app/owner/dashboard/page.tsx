import { Car, CircleDollarSign, Clock } from "lucide-react";

import { PageHeading } from "@/components/page-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const metrics = [
  { label: "Active cars", value: "0", icon: Car },
  { label: "Pending requests", value: "0", icon: Clock },
  { label: "Monthly revenue", value: "$0", icon: CircleDollarSign },
];

export default function OwnerDashboardPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <PageHeading
          eyebrow="Owner dashboard"
          title="Manage vehicles and rental requests."
          description="Owners will list cars, review booking requests, and track completed rentals here."
        />
        <Button>Add car</Button>
      </div>
      <section className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">{metric.label}</CardTitle>
              <metric.icon className="size-5 text-primary" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{metric.value}</p>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
