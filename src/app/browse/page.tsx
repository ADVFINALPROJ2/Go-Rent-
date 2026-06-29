import { BrowseCarsClient } from "@/components/cars/browse-cars-client";
import { PageHeading } from "@/components/page-heading";

export default function BrowseCarsPage() {
  return (
    <div>
      <section className="relative overflow-hidden border-b border-sky-100 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(180deg,transparent,rgba(14,165,233,0.08))] dark:bg-[linear-gradient(180deg,transparent,rgba(14,165,233,0.12))]" />
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <PageHeading
            eyebrow="MARKETPLACE"
            title="Cars for rent in Addis Ababa"
            description="Filter by area, category, transmission, and price in Birr."
          />
        </div>
      </section>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <BrowseCarsClient />
      </div>
    </div>
  );
}
