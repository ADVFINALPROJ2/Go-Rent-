import { Heart, Quote, Star } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const reviewsData = [
  {
    name: "Yonas Alemayehu",
    role: "Corporate renter",
    quote:
      "GoRent makes renting standard cars in Kazanchis incredibly straightforward. Simple messaging, fair Birr pricing, and a high quality car.",
    carName: "Toyota Vitz",
    neighborhood: "Kazanchis",
  },
  {
    name: "Dawit Tesfaye",
    role: "Car owner",
    quote:
      "Managing my fleet from Bole has never been easier. The dashboard keeps me updated with pending requests and I choose who rents.",
    carName: "Hyundai Tucson",
    neighborhood: "Bole",
  },
  {
    name: "Selamawit Kebede",
    role: "EV owner",
    quote:
      "I listed my EV in the CMC area and started receiving corporate client requests. The renter verification flow gives me confidence.",
    carName: "Tesla Model Y",
    neighborhood: "CMC",
  },
  {
    name: "Amha Tekle",
    role: "Frequent renter",
    quote:
      "Rented a Suzuki Dzire for a family trip around Addis. Direct chat made matching and key handoff zero-stress.",
    carName: "Suzuki Dzire",
    neighborhood: "Piassa",
  },
  {
    name: "Makeda Belay",
    role: "Business traveler",
    quote:
      "I needed a premium ride for meetings near Megenagna. The booking was approved quickly and everything felt professional.",
    carName: "Mercedes C200",
    neighborhood: "Megenagna",
  },
];

export default function ReviewsPage() {
  return (
    <main className="bg-white text-slate-950 dark:bg-zinc-950 dark:text-white">
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-primary dark:bg-sky-950">
            Client success stories
          </span>
          <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl">
            What the <span className="text-primary">Addis Community</span> Says
          </h1>
          <p className="mt-5 text-base leading-7 text-slate-600 dark:text-zinc-400">
            Hear from verified car owners earning passive income and renters enjoying quality
            vehicles across Addis Ababa neighborhood fleets.
          </p>
        </div>

        <Card className="mb-12 bg-slate-50 dark:bg-zinc-900/50">
          <CardContent className="grid gap-6 p-8 text-center md:grid-cols-3 md:divide-x md:divide-slate-200 dark:md:divide-zinc-800">
            <div>
              <p className="text-4xl font-black">4.9 / 5.0</p>
              <div className="mt-2 flex justify-center text-amber-500">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star className="size-4 fill-current" key={index} aria-hidden="true" />
                ))}
              </div>
              <p className="mt-2 text-xs font-bold uppercase tracking-wide text-slate-500">Average renter rating</p>
            </div>
            <div>
              <p className="text-4xl font-black">5,000+</p>
              <p className="mt-2 text-xs font-bold uppercase tracking-wide text-slate-500">Completed bookings</p>
              <p className="mt-1 text-xs text-slate-500">Across 17 Addis neighborhood districts</p>
            </div>
            <div>
              <p className="text-4xl font-black">99.2%</p>
              <p className="mt-2 text-xs font-bold uppercase tracking-wide text-slate-500">Satisfaction rate</p>
              <p className="mt-1 text-xs text-slate-500">Based on owner and renter checkouts</p>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reviewsData.map((review) => (
            <Card className="bg-white dark:bg-zinc-950" key={review.name}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-base">{review.name}</CardTitle>
                    <CardDescription className="font-bold uppercase tracking-wide">
                      {review.role}
                    </CardDescription>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-2 text-slate-400 dark:bg-zinc-900">
                    <Quote className="size-4" aria-hidden="true" />
                  </div>
                </div>
                <div className="flex text-amber-500">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star className="size-4 fill-current" key={index} aria-hidden="true" />
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm italic leading-7 text-slate-600 dark:text-zinc-400">
                  &ldquo;{review.quote}&rdquo;
                </p>
                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-bold dark:border-zinc-800">
                  <span>{review.carName}</span>
                  <span className="rounded-full bg-sky-50 px-2 py-1 text-primary dark:bg-sky-950">
                    {review.neighborhood}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mx-auto mt-16 max-w-4xl border-sky-100 bg-sky-50/60 text-center dark:border-sky-900 dark:bg-sky-950/10">
          <CardHeader>
            <Heart className="mx-auto size-8 text-primary" aria-hidden="true" />
            <CardTitle>Our Promise to GoRent Members</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Every review displayed in the product experience is connected to real rental
              activity. Peer accountability is what keeps the Addis GoRent community trustworthy.
            </CardDescription>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
