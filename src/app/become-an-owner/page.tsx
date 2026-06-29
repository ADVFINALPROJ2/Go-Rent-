import { ArrowRight, CheckCircle2, Flame, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/session";

const ownerBenefits = [
  "Set your own daily price in Ethiopian Birr",
  "Approve or decline every renter request",
  "Message renters before handover",
  "Control pickup areas, dates, and availability",
];

const ownerSteps = [
  {
    title: "Create your profile",
    description:
      "Register as an owner and complete your profile so renters know where in Addis you are located.",
  },
  {
    title: "List your vehicle",
    description:
      "Upload photos, set the manufacture year, seats, transmission, and your ideal daily rate in ETB.",
  },
  {
    title: "Accept and coordinate",
    description:
      "Receive booking requests in your workspace, chat with renters, and finalize pickup details.",
  },
];

export default async function BecomeAnOwnerPage() {
  const user = await getCurrentUser();

  if (user?.role === "owner") {
    redirect("/owner/dashboard");
  }

  if (user?.role === "admin") {
    redirect("/admin");
  }

  return (
    <main className="bg-white text-slate-950 dark:bg-zinc-950 dark:text-white">
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-12 lg:items-center lg:px-8">
        <div className="space-y-6 lg:col-span-7">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            <Flame className="size-4" aria-hidden="true" />
            Make Passive Income in Addis Ababa
          </span>
          <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-6xl">
            Rent Out Your Vehicle on <span className="text-emerald-500">GoRent</span>
          </h1>
          <p className="max-w-2xl text-base leading-8 text-slate-600 dark:text-zinc-400">
            Do you have a vehicle sitting idle in Bole, Sar Bet, or Kazanchis? List your car on
            GoRent, stay in complete control of pricing and dates, and generate substantial
            passive income from the local renter community.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700">
              <Link href="/register">
                List your car now
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/owner/dashboard">Open owner dashboard</Link>
            </Button>
          </div>
        </div>
        <div className="relative lg:col-span-5">
          <div className="absolute -inset-4 rounded-3xl bg-emerald-500/10 blur-xl" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=900&q=80"
            alt="Car owner listing vehicle on GoRent"
            className="relative aspect-[4/3] w-full rounded-2xl border border-slate-100 object-cover shadow-2xl dark:border-zinc-800"
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <Card className="border-emerald-100 bg-emerald-50/60 dark:border-emerald-900 dark:bg-emerald-950/10">
          <CardContent className="grid gap-8 p-8 text-center md:grid-cols-3 md:divide-x md:divide-emerald-200 dark:md:divide-emerald-900">
            <div>
              <p className="text-4xl font-black">Br 45,000+</p>
              <p className="mt-2 text-xs font-bold uppercase tracking-wide text-slate-500">Avg. monthly earnings</p>
              <p className="mt-1 text-xs text-slate-500">Based on standard SUV listings in Bole</p>
            </div>
            <div>
              <p className="text-4xl font-black">100% Free</p>
              <p className="mt-2 text-xs font-bold uppercase tracking-wide text-slate-500">No listing fees</p>
              <p className="mt-1 text-xs text-slate-500">No upfront costs or hidden subscriptions</p>
            </div>
            <div>
              <p className="text-4xl font-black">Complete Control</p>
              <p className="mt-2 text-xs font-bold uppercase tracking-wide text-slate-500">Your rules and pricing</p>
              <p className="mt-1 text-xs text-slate-500">Set your price and coordinate availability</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="text-3xl font-black">Listing is Simple</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400">
            Go from sign up to earning in under 10 minutes.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {ownerSteps.map((step, index) => (
            <Card className="relative bg-white dark:bg-zinc-950" key={step.title}>
              <span className="absolute -left-3 -top-3 flex size-9 items-center justify-center rounded-xl bg-emerald-500 text-sm font-black text-white shadow-md">
                {index + 1}
              </span>
              <CardHeader>
                <CardTitle>{step.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{step.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 rounded-3xl border border-slate-100 bg-slate-50 p-8 dark:border-zinc-800 dark:bg-zinc-900/40 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-black">Owner benefits</h2>
            <div className="mt-5 grid gap-3">
              {ownerBenefits.map((benefit) => (
                <p className="flex items-center gap-2 text-sm text-slate-600 dark:text-zinc-300" key={benefit}>
                  <CheckCircle2 className="size-4 text-emerald-500" aria-hidden="true" />
                  {benefit}
                </p>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-white p-6 dark:border-emerald-900 dark:bg-zinc-950">
            <h3 className="flex items-center gap-2 text-sm font-black text-emerald-600 dark:text-emerald-300">
              <ShieldCheck className="size-5" aria-hidden="true" />
              Owner Protection
            </h3>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-zinc-400">
              We check renter profile history and contact lines before requests reach owners.
              You always have the final word on whether to accept or decline any booking.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
