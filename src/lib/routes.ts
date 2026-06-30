import type { ProfileRole } from "@/lib/local-types";

export type NavigationItem = {
  href: string;
  label: string;
  hideForRoles?: ProfileRole[];
};

export const mainNavigation: NavigationItem[] = [
  { href: "/", label: "Home" },
  { href: "/browse", label: "Cars" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/become-an-owner", label: "Become an Owner", hideForRoles: ["owner", "admin"] },
  { href: "/reviews", label: "Reviews" },
  { href: "/contact", label: "Contact" },
];

export const authNavigation = [
  { href: "/login", label: "Login" },
  { href: "/register", label: "Register" },
];
