export function SiteFooter() {
  return (
    <footer className="border-t border-slate-900 bg-slate-950 text-white dark:border-zinc-800">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 text-sm md:grid-cols-[1.2fr_0.8fr_0.8fr] sm:px-6 lg:px-8">
        <div>
          <p className="text-lg font-bold">Go<span className="text-sky-400">Rent</span></p>
          <p className="mt-2 max-w-md text-slate-400">
            Peer-to-peer car rentals in Addis Ababa with verified local owners, direct messaging,
            and transparent Ethiopian Birr pricing.
          </p>
        </div>
        <div>
          <p className="font-bold text-white">Popular pickup areas</p>
          <p className="mt-2 text-slate-400">Bole, Kazanchis, CMC, Ayat, Piassa, Merkato</p>
        </div>
        <div>
          <p className="font-bold text-white">Local support</p>
          <p className="mt-2 text-slate-400">Format: +251 9XX XXX XXX or 09XX XXX XXX</p>
        </div>
      </div>
    </footer>
  );
}
