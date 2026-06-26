export function SiteFooter() {
  return (
    <footer className="border-t border-slate-900 bg-slate-950 text-white dark:border-zinc-800">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 text-sm sm:grid-cols-[1fr_auto] sm:items-end sm:px-6 lg:px-8">
        <div>
          <p className="text-lg font-bold">Go<span className="text-sky-400">Rent</span></p>
          <p className="mt-2 max-w-md text-slate-400">
            Peer-to-peer car rentals with clean listings, owner tools, and renter-ready booking flows.
          </p>
        </div>
        <p className="text-slate-500">SQLite-backed local demo foundation.</p>
      </div>
    </footer>
  );
}
