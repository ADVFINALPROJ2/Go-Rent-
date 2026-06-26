import { CarFront, Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";

const footerGroups = [
  {
    title: "Marketplace",
    links: [
      { href: "/browse", label: "Cars" },
      { href: "/how-it-works", label: "How It Works" },
      { href: "/become-an-owner", label: "Become an Owner" },
      { href: "/reviews", label: "Reviews" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/", label: "Home" },
      { href: "/contact", label: "Contact" },
      { href: "/login", label: "Login" },
      { href: "/register", label: "Register" },
    ],
  },
  {
    title: "Support",
    links: [
      { href: "/messages", label: "Messages" },
      { href: "/profile", label: "Profile" },
      { href: "/renter/dashboard", label: "Renter Dashboard" },
      { href: "/owner/dashboard", label: "Owner Dashboard" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/contact", label: "Safety" },
      { href: "/contact", label: "Terms" },
      { href: "/contact", label: "Privacy" },
      { href: "/admin/dashboard", label: "Admin" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-900 bg-slate-950 text-white dark:border-zinc-800">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.25fr_2fr] lg:px-8">
        <div className="space-y-5">
          <Link className="flex items-center gap-2 text-xl font-black" href="/">
            <span className="flex size-10 items-center justify-center rounded-xl bg-sky-500 text-white shadow-lg shadow-sky-500/20">
              <CarFront className="size-5" aria-hidden="true" />
            </span>
            Go<span className="-ml-2 text-sky-400">Rent</span>
            <span className="text-sm font-bold text-slate-400">Ethiopia</span>
          </Link>
          <p className="max-w-md text-sm leading-7 text-slate-400">
            Addis Ababa&apos;s peer-to-peer car rental marketplace. Verified owners,
            transparent pricing in Birr.
          </p>
          <div className="grid gap-3 text-sm text-slate-400">
            <p className="flex items-center gap-2">
              <MapPin className="size-4 text-sky-400" aria-hidden="true" />
              Bole, Addis Ababa
            </p>
            <p className="flex items-center gap-2">
              <Phone className="size-4 text-sky-400" aria-hidden="true" />
              +251 911 000 000
            </p>
            <p className="flex items-center gap-2">
              <Mail className="size-4 text-sky-400" aria-hidden="true" />
              support@gorentaddis.com
            </p>
          </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {footerGroups.map((group) => (
            <div key={group.title}>
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white">
                {group.title}
              </h2>
              <ul className="mt-4 grid gap-3 text-sm text-slate-400">
                {group.links.map((link) => (
                  <li key={`${group.title}-${link.label}`}>
                    <Link className="transition-colors hover:text-sky-300" href={link.href}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© 2026 GoRent Ethiopia. All rights reserved.</p>
          <p>Local owners. Local prices. Trusted Addis pickup areas.</p>
        </div>
      </div>
    </footer>
  );
}
