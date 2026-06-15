import { BrowseCarsClient } from "@/components/cars/browse-cars-client";
import { PageHeading } from "@/components/page-heading";

export default function BrowseCarsPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <PageHeading
        eyebrow="Browse cars"
        title="Available vehicles"
        description="Search available listings and open a car page to review details before requesting a rental."
      />
      <BrowseCarsClient />
    </div>
  );
}
