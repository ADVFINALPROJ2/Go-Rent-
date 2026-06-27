import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/admin/dashboard",
        destination: "/admin",
        permanent: false,
      },
      {
        source: "/admin/dashboard/users",
        destination: "/admin/users",
        permanent: false,
      },
      {
        source: "/admin/dashboard/users/:id",
        destination: "/admin/users/:id",
        permanent: false,
      },
      {
        source: "/admin/dashboard/listings",
        destination: "/admin/listings",
        permanent: false,
      },
      {
        source: "/admin/dashboard/listings/available",
        destination: "/admin/listings/available",
        permanent: false,
      },
      {
        source: "/admin/dashboard/listings/disabled",
        destination: "/admin/listings/disabled",
        permanent: false,
      },
      {
        source: "/admin/dashboard/bookings/pending",
        destination: "/admin/bookings/pending",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
