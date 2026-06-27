"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";
import type { Map as LeafletMap } from "leaflet";

type PickupLocation = {
  area: string;
  coordinates: [number, number];
  note: string;
};

const pickupLocations: PickupLocation[] = [
  { area: "Bole", coordinates: [8.9806, 38.7992], note: "Airport and hotel pickups" },
  { area: "Kazanchis", coordinates: [9.0185, 38.7636], note: "Business district access" },
  { area: "Piassa", coordinates: [9.0369, 38.7527], note: "Central Addis handovers" },
  { area: "Megenagna", coordinates: [9.0205, 38.8024], note: "East-side connections" },
  { area: "Mexico", coordinates: [9.0108, 38.7466], note: "City-center pickup area" },
  { area: "Sar Bet", coordinates: [8.9899, 38.7333], note: "Southwest Addis access" },
  { area: "CMC", coordinates: [9.0192, 38.8542], note: "Residential owner listings" },
  { area: "Ayat", coordinates: [9.0167, 38.889], note: "Eastern Addis pickup" },
  { area: "Gerji", coordinates: [8.9976, 38.8204], note: "Near Bole and CMC" },
  { area: "Summit", coordinates: [9.0198, 38.8862], note: "East corridor rentals" },
  { area: "Lebu", coordinates: [8.9453, 38.7116], note: "Southwest route access" },
  { area: "Kality", coordinates: [8.9127, 38.768], note: "Southern Addis pickups" },
  { area: "Arat Kilo", coordinates: [9.0373, 38.7612], note: "University area rentals" },
  { area: "Lideta", coordinates: [9.0106, 38.7392], note: "Central-west pickup" },
  { area: "Jemo", coordinates: [8.9194, 38.7], note: "Southwest residential listings" },
  { area: "Gulele", coordinates: [9.0506, 38.7359], note: "North Addis access" },
  { area: "Merkato", coordinates: [9.0322, 38.738], note: "Market district pickup" },
];

function browseHref(area: string) {
  return `/browse?location=${encodeURIComponent(area)}`;
}

export function AddisPickupMap() {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadMap() {
      const L = await import("leaflet");

      if (!isMounted || !mapElementRef.current || mapRef.current) {
        return;
      }

      const map = L.map(mapElementRef.current, {
        attributionControl: true,
        scrollWheelZoom: false,
        zoomControl: true,
      });

      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);

      const bounds = L.latLngBounds(pickupLocations.map((location) => location.coordinates));

      pickupLocations.forEach((location) => {
        const href = browseHref(location.area);
        const icon = L.divIcon({
          className: "gorent-map-pin",
          html: `<span class="gorent-map-pin-dot"><span class="gorent-map-pin-label">${location.area.slice(0, 1)}</span></span>`,
          iconAnchor: [18, 38],
          iconSize: [36, 38],
          popupAnchor: [0, -32],
        });

        L.marker(location.coordinates, { icon })
          .addTo(map)
          .bindPopup(
            `<strong>${location.area}</strong><br/><span>${location.note}</span><br/><a href="${href}">Browse cars here</a>`,
          );
      });

      map.fitBounds(bounds, { padding: [32, 32] });
    }

    loadMap();

    return () => {
      isMounted = false;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div className="grid gap-4">
      <div className="overflow-hidden rounded-3xl border border-sky-200 bg-slate-950 shadow-2xl shadow-sky-950/15 dark:border-zinc-800">
        <div className="relative">
          <div
            ref={mapElementRef}
            className="h-[420px] min-h-[360px] w-full"
            aria-label="Interactive map of Addis Ababa pickup areas"
          />
          <div className="pointer-events-none absolute left-4 top-4 rounded-2xl border border-white/15 bg-slate-950/85 px-4 py-3 text-white shadow-xl backdrop-blur">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-sky-300">
              Live pickup map
            </p>
            <p className="mt-1 text-sm font-semibold">17 pinned Addis areas</p>
          </div>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        {pickupLocations.map((location) => (
          <Link
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:border-sky-200 hover:bg-sky-50 hover:text-primary dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
            href={browseHref(location.area)}
            key={location.area}
          >
            <MapPin className="size-4 text-primary" aria-hidden="true" />
            {location.area}
          </Link>
        ))}
      </div>
    </div>
  );
}
