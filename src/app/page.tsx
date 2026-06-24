import {
  ArrowRight,
  CalendarCheck,
  Car,
  Clock3,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const heroCarImage =
  "https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1200&q=80";

const features = [
  {
    title: "Affordable rentals",
    description: "Browse local owner listings with clear daily pricing before you request a trip.",
    icon: Car,
  },
  {
    title: "Trusted owners",
    description: "Profiles, listing records, and reviews keep the marketplace easier to trust.",
    icon: ShieldCheck,
  },
  {
    title: "Flexible booking",
    description: "Send rental requests, track statuses, and keep trip details organized.",
    icon: CalendarCheck,
  },
];

const categories = [
  {
    name: "City sedans",
    image:
      "https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "SUV comfort",
    image:
      "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Premium rides",
    image:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80",
  },
];

const popularCars = [
  {
    name: "Tesla Model 3",
    location: "Downtown",
    price: "$99",
    image:
      "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=700&q=80",
  },
  {
    name: "BMW 3 Series",
    location: "Airport area",
    price: "$88",
    image:
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=700&q=80",
  },
  {
    name: "Toyota RAV4",
    location: "Westlands",
    price: "$72",
    image:
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=700&q=80",
  },
];

export default function HomePage() {
  return (
    <div className="overflow-hidden">
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:px-8 lg:py-16">
        <div className="space-y-8">
          <div className="max-w-2xl space-y-5">
            <span className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-sm font-semibold text-primary">
              <Sparkles className="size-4" aria-hidden="true" />
              Local cars, simple booking
            </span>
            <h1 className="text-5xl font-bold leading-tight text-slate-950 sm:text-6xl lg:text-7xl">
              Find Your Perfect Rental Car
            </h1>
            <p className="max-w-xl text-lg leading-8 text-slate-600">
              GoRent connects renters with nearby car owners for daily trips,
              weekend plans, and flexible local travel.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/browse">
                Browse cars
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/owner/dashboard">List your car</Link>
            </Button>
          </div>

          <div className="grid max-w-xl gap-3 sm:grid-cols-3">
            {[
              ["60+", "demo-ready routes"],
              ["24/7", "request tracking"],
              ["3 roles", "renter, owner, admin"],
            ].map(([value, label]) => (
              <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm" key={label}>
                <p className="text-2xl font-bold text-slate-950">{value}</p>
                <p className="mt-1 text-sm text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute -left-6 top-8 hidden h-28 w-28 rounded-full bg-sky-100 lg:block" />
          <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-white p-3 shadow-2xl shadow-sky-950/10">
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={heroCarImage}
                alt="Blue sports car available for rental"
                className="size-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/75 to-transparent p-5 text-white">
                <p className="text-sm text-sky-100">Featured ride</p>
                <p className="mt-1 text-2xl font-bold">Premium city pickup</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Card className="-mt-2 border-sky-100 bg-white shadow-xl shadow-sky-950/10">
          <CardContent className="grid gap-3 p-4 sm:grid-cols-[1fr_1fr_1fr_auto] sm:p-5">
            <div className="flex items-center gap-3 rounded-lg bg-slate-50 px-4 py-3">
              <MapPin className="size-5 text-primary" aria-hidden="true" />
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">Location</p>
                <p className="text-sm font-semibold text-slate-950">Search your city</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-slate-50 px-4 py-3">
              <CalendarCheck className="size-5 text-primary" aria-hidden="true" />
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">Dates</p>
                <p className="text-sm font-semibold text-slate-950">Choose trip days</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-slate-50 px-4 py-3">
              <Clock3 className="size-5 text-primary" aria-hidden="true" />
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">Pickup</p>
                <p className="text-sm font-semibold text-slate-950">Flexible handoff</p>
              </div>
            </div>
            <Button asChild className="h-full">
              <Link href="/browse">
                <Search aria-hidden="true" />
                Search
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8">
        {features.map((item) => (
          <Card className="bg-white/90" key={item.title}>
            <CardHeader>
              <div className="flex size-11 items-center justify-center rounded-lg bg-sky-50 text-primary">
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

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase text-primary">Car category</p>
              <h2 className="mt-2 text-4xl font-bold text-slate-950">Browse by trip style</h2>
            </div>
            <Button asChild variant="outline">
              <Link href="/browse">View all cars</Link>
            </Button>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {categories.map((category) => (
              <Link
                className="group relative overflow-hidden rounded-lg border border-slate-200 bg-slate-900 shadow-sm"
                href="/browse"
                key={category.name}
              >
                <div className="aspect-[4/3]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={category.image}
                    alt={`${category.name} rental category`}
                    className="size-full object-cover opacity-85 transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5 text-white">
                  <h3 className="text-2xl font-bold">{category.name}</h3>
                  <span className="flex size-10 items-center justify-center rounded-lg bg-white text-primary">
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-primary">Popular cars</p>
            <h2 className="mt-2 text-4xl font-bold text-slate-950">Fleet preview</h2>
          </div>
          <p className="max-w-lg text-sm leading-6 text-slate-500">
            Sample marketplace cards preview the browsing experience. Live listings load from SQLite on the Browse Cars page.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {popularCars.map((car) => (
            <Card className="overflow-hidden" key={car.name}>
              <div className="aspect-[16/10] overflow-hidden bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={car.image} alt={car.name} className="size-full object-cover" />
              </div>
              <CardHeader>
                <CardTitle>{car.name}</CardTitle>
                <CardDescription className="flex items-center gap-1.5">
                  <MapPin className="size-4" aria-hidden="true" />
                  {car.location}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <p className="text-xl font-bold text-primary">
                  {car.price}
                  <span className="text-sm font-medium text-slate-500">/day</span>
                </p>
                <Button asChild size="sm" variant="secondary">
                  <Link href="/browse">View cars</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-slate-950 py-16 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_auto] lg:items-center lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase text-sky-300">Ready for the next trip?</p>
            <h2 className="mt-3 max-w-2xl text-4xl font-bold">
              Rent a car nearby or turn your parked vehicle into a listing.
            </h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/register">
                <Users aria-hidden="true" />
                Join GoRent
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
            >
              <Link href="/browse">Explore cars</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
