import { ArrowRight, MessageSquare, Shield, Star } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const renterSteps = [
  {
    title: "Browse the marketplace",
    description:
      "Filter cars by category, pickup area, transmission, and price in Birr across Bole, Kazanchis, Piassa, CMC, and more.",
  },
  {
    title: "Submit a booking request",
    description:
      "Choose your start and end dates, write a short message to the owner, and send the request from the car details page.",
  },
  {
    title: "Chat and align",
    description:
      "Use direct owner messaging to confirm pickup timing, documents, handover details, and Addis pickup location.",
  },
  {
    title: "Complete and review",
    description:
      "Finish the trip, return the car, and leave a review tied to the completed booking to support community trust.",
  },
];

const ownerSteps = [
  {
    title: "Register as an owner",
    description:
      "Create an account, choose Owner as your role, and unlock the fleet management workspace.",
  },
  {
    title: "Post your car listing",
    description:
      "Add make, model, seats, transmission, pickup area, photos, and your daily Ethiopian Birr price.",
  },
  {
    title: "Review renter requests",
    description:
      "Accept or decline pending requests from your dashboard, then message renters to verify details.",
  },
  {
    title: "Earn secure Birr",
    description:
      "Hand over keys only after you are comfortable. You stay in control of your pricing, dates, and approvals.",
  },
];

const standards = [
  {
    title: "Profile checks",
    description: "Owners and renters build trust through contact details, profiles, and booking history.",
    icon: Shield,
  },
  {
    title: "Secure chat threads",
    description: "Keep pickup, booking, and handover details in one private conversation space.",
    icon: MessageSquare,
  },
  {
    title: "Community ratings",
    description: "Real reviews from completed bookings help Addis renters choose quality cars.",
    icon: Star,
  },
];

export default function HowItWorksPage() {
  return (
    <main className="bg-white text-slate-950 dark:bg-zinc-950 dark:text-white">
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-primary dark:bg-sky-950">
            Easiest P2P rental system
          </span>
          <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl">
            How <span className="text-primary">GoRent</span> Works
          </h1>
          <p className="mt-5 text-base leading-7 text-slate-600 dark:text-zinc-400">
            Our peer-to-peer car renting framework is simple, safe, and optimized for Addis
            Ababa communities. No long queues, no confusing paperwork, just local owners and
            local renters working together.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <Card className="border-sky-100 bg-sky-50/50 dark:border-sky-900 dark:bg-sky-950/10">
            <CardHeader>
              <span className="w-fit rounded-xl bg-sky-100 px-4 py-2 text-sm font-black text-primary dark:bg-sky-950">
                Renting a Car
              </span>
              <CardDescription>
                Find and secure standard or premium cars near you. Coordinate directly with
                verified local car owners.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5">
              {renterSteps.map((step, index) => (
                <div className="flex gap-4" key={step.title}>
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-black text-white">
                    {index + 1}
                  </span>
                  <div>
                    <h2 className="font-black">{step.title}</h2>
                    <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-zinc-400">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
              <Button asChild className="mt-2 w-fit">
                <Link href="/browse">
                  Start searching cars
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-emerald-100 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/10">
            <CardHeader>
              <span className="w-fit rounded-xl bg-emerald-100 px-4 py-2 text-sm font-black text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                Listing Your Car
              </span>
              <CardDescription>
                List your vehicle, control availability, approve renters, and earn passive
                income in Birr safely.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5">
              {ownerSteps.map((step, index) => (
                <div className="flex gap-4" key={step.title}>
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-sm font-black text-white">
                    {index + 1}
                  </span>
                  <div>
                    <h2 className="font-black">{step.title}</h2>
                    <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-zinc-400">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
              <Button asChild className="mt-2 w-fit bg-emerald-600 hover:bg-emerald-700">
                <Link href="/become-an-owner">
                  Learn fleet earnings
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <section className="mt-16 border-t border-slate-100 pt-10 dark:border-zinc-800">
          <h2 className="text-center text-xs font-black uppercase tracking-[0.2em] text-slate-400">
            The GoRent safety standards
          </h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {standards.map((item) => (
              <Card className="bg-white dark:bg-zinc-950" key={item.title}>
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
      </section>
    </main>
  );
}
