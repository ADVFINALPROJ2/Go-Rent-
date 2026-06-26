import {
  ArrowRight,
  CalendarCheck,
  Car,
  CarFront,
  CheckCircle2,
  Clock3,
  MapPin,
  MessageSquare,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
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
  "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=1400&q=80";

const categories = [
  {
    name: "City sedans",
    image:
      "https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=700&q=80",
  },
  {
    name: "Electric rides",
    image:
      "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=700&q=80",
  },
  {
    name: "Weekend SUVs",
    image:
      "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=700&q=80",
  },
  {
    name: "Premium cars",
    image:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=700&q=80",
  },
];

const benefits = [
  {
    title: "Verified local owners",
    description: "Review profiles, listings, and completed trips before you request a rental.",
    icon: ShieldCheck,
  },
  {
    title: "Request first, pay later",
    description: "Send dates and a note, then wait for the owner to approve the booking.",
    icon: CalendarCheck,
  },
  {
    title: "Built-in messages",
    description: "Keep pickup details, owner replies, and rental updates in one place.",
    icon: MessageSquare,
  },
];

const fleetPreview = [
  {
    name: "Tesla Model 3",
    type: "Electric sedan",
    price: "$99/day",
    image:
      "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=700&q=80",
  },
  {
    name: "Toyota RAV4",
    type: "City SUV",
    price: "$72/day",
    image:
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=700&q=80",
  },
  {
    name: "Volkswagen Golf",
    type: "Compact hatch",
    price: "$48/day",
    image:
      "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=700&q=80",
  },
];

export default function HomePage() {
  return (
    <div className="overflow-hidden">
      <section className="relative border-b border-slate-200/70 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(14,165,233,0.14),transparent_28rem)] dark:bg-[radial-gradient(circle_at_12%_18%,rgba(14,165,233,0.2),transparent_26rem)]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-8 lg:py-16">
          <div className="space-y-8">
            <div className="max-w-2xl space-y-5">
              <span className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-sm font-semibold text-primary dark:border-sky-900 dark:bg-sky-950/60">
                <Sparkles className="size-4" aria-hidden="true" />
                Local rentals, owner approved
              </span>
              <h1 className="text-5xl font-black leading-[0.95] tracking-tight text-slate-950 dark:text-white sm:text-6xl lg:text-7xl">
                Find Your Perfect Rental Car
              </h1>
              <p className="max-w-xl text-lg leading-8 text-slate-600 dark:text-zinc-300">
                Browse verified cars from nearby owners, request your dates, message directly,
                and track every booking from one polished GoRent dashboard.
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
                ["3", "demo roles"],
                ["Live", "SQLite data"],
                ["Fast", "local booking"],
              ].map(([value, label]) => (
                <div
                  className="rounded-xl border border-slate-200 bg-white/85 p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/70"
                  key={label}
                >
                  <p className="text-2xl font-black text-slate-950 dark:text-white">{value}</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="relative overflow-hidden rounded-[1.75rem] bg-slate-950 shadow-2xl shadow-sky-950/20">
              <div className="aspect-[4/3]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={heroCarImage}
                  alt="Premium rental car in a showroom"
                  className="size-full object-cover opacity-90"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 text-white sm:p-7">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-sky-200">Featured rental</p>
                    <p className="mt-1 text-3xl font-black">Premium city pickup</p>
                  </div>
                  <div className="rounded-xl bg-white px-4 py-3 text-slate-950 shadow-lg">
                    <p className="text-xs font-bold uppercase text-slate-500">From</p>
                    <p className="text-xl font-black text-primary">$48/day</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto -mt-7 max-w-6xl px-4 sm:px-6 lg:px-8">
        <Card className="relative z-10 border-sky-100 bg-white shadow-2xl shadow-sky-950/10 dark:border-zinc-800 dark:bg-zinc-900">
          <CardContent className="grid gap-3 p-4 sm:grid-cols-[1fr_1fr_1fr_auto] sm:p-5">
            {[
              ["Location", "Search nearby cars", MapPin],
              ["Dates", "Request any range", CalendarCheck],
              ["Pickup", "Coordinate with owner", Clock3],
            ].map(([label, value, Icon]) => (
              <div
                className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 dark:bg-zinc-950"
                key={label as string}
              >
                <Icon className="size-5 text-primary" aria-hidden="true" />
                <div>
                  <p className="text-xs font-bold uppercase text-slate-500 dark:text-zinc-500">
                    {label as string}
                  </p>
                  <p className="text-sm font-bold text-slate-950 dark:text-white">
                    {value as string}
                  </p>
                </div>
              </div>
            ))}
            <Button asChild className="h-full">
              <Link href="/browse">
                <Search aria-hidden="true" />
                Search cars
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-primary">Car category</p>
            <h2 className="mt-2 text-4xl font-black tracking-tight text-slate-950 dark:text-white">
              Browse by trip style
            </h2>
          </div>
          <Button asChild variant="outline">
            <Link href="/browse">View all cars</Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {categories.map((category) => (
            <Link
              className="group relative min-h-64 overflow-hidden rounded-2xl bg-slate-950 shadow-sm"
              href="/browse"
              key={category.name}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={category.image}
                alt={`${category.name} category`}
                className="absolute inset-0 size-full object-cover opacity-75 transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-5 text-white">
                <h3 className="max-w-28 text-2xl font-black leading-tight">{category.name}</h3>
                <span className="flex size-10 items-center justify-center rounded-full bg-white text-primary">
                  <ArrowRight className="size-4" aria-hidden="true" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-slate-100/70 py-16 dark:bg-zinc-900/55">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-primary">Popular cars</p>
              <h2 className="mt-2 text-4xl font-black tracking-tight text-slate-950 dark:text-white">
                Trend vehicles
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-slate-600 dark:text-zinc-400">
              These preview cards mirror the marketplace style. Live cars are loaded from the
              local SQLite database on the Browse page.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {fleetPreview.map((car) => (
              <Card className="overflow-hidden bg-white dark:bg-zinc-950" key={car.name}>
                <div className="aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-zinc-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={car.image} alt={car.name} className="size-full object-cover" />
                </div>
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle>{car.name}</CardTitle>
                      <CardDescription>{car.type}</CardDescription>
                    </div>
                    <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-primary dark:bg-sky-950">
                      {car.price}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star className="size-4 fill-current" key={index} aria-hidden="true" />
                    ))}
                  </div>
                  <Button asChild size="sm" variant="secondary">
                    <Link href="/browse">Book now</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {benefits.map((item) => (
            <Card
              className="bg-white/90 transition-transform hover:-translate-y-1 dark:bg-zinc-950"
              key={item.title}
            >
              <CardHeader>
                <div className="flex size-12 items-center justify-center rounded-xl bg-sky-50 text-primary dark:bg-sky-950">
                  <item.icon className="size-6" aria-hidden="true" />
                </div>
                <CardTitle>{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{item.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-slate-950 py-16 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_auto] lg:items-center lg:px-8">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-bold uppercase text-sky-300">
              <CarFront className="size-4" aria-hidden="true" />
              Ready for final demo
            </p>
            <h2 className="mt-3 max-w-2xl text-4xl font-black leading-tight">
              Rent nearby or turn your parked vehicle into a polished listing.
            </h2>
            <div className="mt-5 grid max-w-2xl gap-2 text-sm text-slate-300 sm:grid-cols-3">
              {["Local auth", "Booking workflow", "Messages and reviews"].map((item) => (
                <span className="flex items-center gap-2" key={item}>
                  <CheckCircle2 className="size-4 text-sky-300" aria-hidden="true" />
                  {item}
                </span>
              ))}
            </div>
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
              className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white dark:bg-white/10"
            >
              <Link href="/browse">
                <Car aria-hidden="true" />
                Explore cars
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
