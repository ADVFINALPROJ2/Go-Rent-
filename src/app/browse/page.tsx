import { BrowseCarsClient } from "@/components/cars/browse-cars-client";
import { PageHeading } from "@/components/page-heading";

export default function BrowseCarsPage() {
  return (
    <div>
      <section className="border-b border-sky-100 bg-[linear-gradient(180deg,#ffffff_0%,#eef8ff_100%)]">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_360px] lg:items-end lg:px-8">
          <PageHeading
            eyebrow="Browse cars"
            title="Cars for Rent"
            description="Explore available owner listings by location and daily price, then open a car page to request your rental."
          />
          <div className="rounded-lg border border-sky-100 bg-white p-5 shadow-xl shadow-sky-950/10">
            <p className="text-sm font-semibold uppercase text-primary">Marketplace status</p>
            <p className="mt-2 text-3xl font-bold text-slate-950">Available now</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Listings are loaded from Supabase and filtered to cars marked available.
            </p>
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <BrowseCarsClient />
      </div>
    </div>
  );
}
