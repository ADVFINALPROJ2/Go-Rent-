import {
  ArrowRight,
  Banknote,
  Car,
  CarFront,
  CheckCircle2,
  Clock3,
  Headphones,
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
import { ADDIS_AREAS, formatBirr } from "@/lib/utils";

const heroCarImage =
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1400&q=80";

const categories = [
  {
    name: "City sedans",
    image:
      "https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=700&q=80",
  },
  {
    name: "Airport SUVs",
    image:
      "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=700&q=80",
  },
  {
    name: "Electric rides",
    image:
      "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=700&q=80",
  },
  {
    name: "Premium cars",
    image:
      "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&w=700&q=80",
  },
];

const benefits = [
  {
    title: "Verified local owners",
    description: "Rent from Addis Ababa owners with profiles, reviews, and local pickup details.",
    icon: ShieldCheck,
  },
  {
    title: "Transparent Birr pricing",
    description: "Daily prices are shown in Ethiopian Birr before you send a booking request.",
    icon: Banknote,
  },
  {
    title: "Direct owner messaging",
    description: "Coordinate pickup, handover, and trip questions without leaving GoRent.",
    icon: MessageSquare,
  },
  {
    title: "Addis pickup areas",
    description: "Search Bole, Piassa, CMC, Ayat, Lebu, Merkato, and more local areas.",
    icon: MapPin,
  },
];

const fleetPreview = [
  {
    name: "Toyota Corolla",
    type: "City sedan in Bole",
    price: formatBirr(2500, "day"),
    image:
      "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=700&q=80",
  },
  {
    name: "Toyota RAV4",
    type: "SUV pickup in CMC",
    price: formatBirr(3800, "day"),
    image:
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=700&q=80",
  },
  {
    name: "Hyundai Elantra",
    type: "Sedan near Kazanchis",
    price: formatBirr(2200, "day"),
    image:
      "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=700&q=80",
  },
];

const howItWorks = [
  {
    title: "Search by Addis area",
    description: "Choose Bole for airport pickup, CMC for east-side trips, or any local area.",
  },
  {
    title: "Request dates in Birr",
    description: "Send your rental dates and message the owner with your pickup needs.",
  },
  {
    title: "Meet, hand over, drive",
    description: "Coordinate directly with the owner and track the booking from your dashboard.",
  },
];

const searchHighlights = [
  { label: "Pickup area", value: "Bole, CMC, Piassa...", icon: MapPin },
  { label: "Daily budget", value: "price in Birr", icon: Banknote },
  { label: "Owner chat", value: "Confirm handover", icon: Clock3 },
];

const contactItems = [
  { title: "Local support", description: "Bole, Addis Ababa", icon: Headphones },
  { title: "Call format", description: "+251 911 234 567", icon: MapPin },
  { title: "Community", description: "Verified local owners", icon: ShieldCheck },
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
                Peer-to-peer car rental in Addis Ababa
              </span>
              <h1 className="text-5xl font-black leading-[0.95] tracking-tight text-slate-950 dark:text-white sm:text-6xl lg:text-7xl">
                Find cars across Addis Ababa
              </h1>
              <p className="max-w-xl text-lg leading-8 text-slate-600 dark:text-zinc-300">
                Book trusted cars in Ethiopian Birr from verified local owners. Search by
                neighborhood, message directly, and manage every rental in one clean GoRent
                dashboard.
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
                ["17", "Addis pickup areas"],
                ["Br", "Transparent pricing"],
                ["Local", "owner community"],
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
                  alt="Premium rental car in Addis Ababa"
                  className="size-full object-cover opacity-90"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 text-white sm:p-7">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-sky-200">Featured local pickup</p>
                    <p className="mt-1 text-3xl font-black">Bole to anywhere</p>
                  </div>
                  <div className="rounded-xl bg-white px-4 py-3 text-slate-950 shadow-lg">
                    <p className="text-xs font-bold uppercase text-slate-500">From</p>
                    <p className="text-xl font-black text-primary">{formatBirr(1800, "day")}</p>
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
            {searchHighlights.map((item) => (
              <div
                className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 dark:bg-zinc-950"
                key={item.label}
              >
                <item.icon className="size-5 text-primary" aria-hidden="true" />
                <div>
                  <p className="text-xs font-bold uppercase text-slate-500 dark:text-zinc-500">
                    {item.label}
                  </p>
                  <p className="text-sm font-bold text-slate-950 dark:text-white">
                    {item.value}
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
                Local owners, local prices
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-slate-600 dark:text-zinc-400">
              Preview the marketplace feel, then open Browse for live SQLite listings with
              searchable Addis pickup areas.
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

      <section id="how-it-works" className="mx-auto max-w-7xl scroll-mt-28 px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-primary">How it works</p>
            <h2 className="mt-2 text-4xl font-black tracking-tight text-slate-950 dark:text-white">
              Book trusted cars in Ethiopian Birr
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-zinc-400">
              GoRent keeps the flow simple for Addis renters and owners: search locally, request
              clearly, and keep communication on-platform.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {howItWorks.map((item, index) => (
              <Card className="bg-white/90 dark:bg-zinc-950" key={item.title}>
                <CardHeader>
                  <div className="flex size-10 items-center justify-center rounded-full bg-sky-50 text-sm font-black text-primary dark:bg-sky-950">
                    {index + 1}
                  </div>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{item.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-4">
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

      <section className="bg-slate-50 py-16 dark:bg-zinc-900/45">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-primary">Addis pickup map</p>
            <h2 className="mt-2 text-4xl font-black tracking-tight text-slate-950 dark:text-white">
              Cars all over Addis
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-zinc-400">
              Browse listings around Bole, Kazanchis, Piassa, Megenagna, Mexico, Sar Bet, CMC,
              Ayat, Gerji, Summit, Lebu, Kality, Arat Kilo, Lideta, Jemo, Gulele, and Merkato.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            {ADDIS_AREAS.map((area) => (
              <Link
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:border-sky-200 hover:bg-sky-50 hover:text-primary dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
                href={`/browse?location=${encodeURIComponent(area)}`}
                key={area}
              >
                {area}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="reviews" className="mx-auto max-w-7xl scroll-mt-28 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <p className="text-sm font-bold uppercase tracking-wide text-primary">Reviews</p>
          <h2 className="mt-2 text-4xl font-black tracking-tight text-slate-950 dark:text-white">
            Loved by the local renter/owner community
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["Booked from Bole for a weekend trip. Handover took five minutes.", "Hanna T.", "Bole"],
            ["Transparent Birr pricing made it easy to compare owners.", "Samuel G.", "Megenagna"],
            ["Messaging the owner before pickup saved so much time.", "Mekdes A.", "CMC"],
          ].map(([quote, name, area]) => (
            <Card className="bg-white dark:bg-zinc-950" key={name}>
              <CardHeader>
                <div className="flex text-amber-400">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star className="size-4 fill-current" key={index} aria-hidden="true" />
                  ))}
                </div>
                <CardDescription className="text-base leading-7">&ldquo;{quote}&rdquo;</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-bold text-slate-950 dark:text-white">{name}</p>
                <p className="text-xs text-slate-500 dark:text-zinc-400">{area}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="become-owner" className="scroll-mt-28 bg-slate-950 py-16 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_auto] lg:items-center lg:px-8">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-bold uppercase text-sky-300">
              <CarFront className="size-4" aria-hidden="true" />
              Become an owner
            </p>
            <h2 className="mt-3 max-w-2xl text-4xl font-black leading-tight">
              Turn your parked vehicle into daily income across Addis Ababa.
            </h2>
            <div className="mt-5 grid max-w-2xl gap-2 text-sm text-slate-300 sm:grid-cols-3">
              {["Owner approval controls", "Direct renter messages", "Birr daily rates"].map((item) => (
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
              <Link href="/owner/dashboard">
                <Car aria-hidden="true" />
                Owner dashboard
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="contact" className="mx-auto max-w-7xl scroll-mt-28 px-4 py-16 sm:px-6 lg:px-8">
        <Card className="border-sky-100 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <CardContent className="grid gap-6 p-6 md:grid-cols-3 md:p-8">
            {contactItems.map((item) => (
              <div className="flex items-start gap-3" key={item.title}>
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-primary dark:bg-sky-950">
                  <item.icon className="size-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-bold text-slate-950 dark:text-white">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
