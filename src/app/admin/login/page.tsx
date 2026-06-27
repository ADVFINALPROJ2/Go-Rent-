import { redirect } from "next/navigation";

import { AdminLoginForm } from "@/app/admin/login/admin-login-form";
import { getCurrentUser } from "@/lib/auth/session";

export default async function AdminLoginPage() {
  const currentUser = await getCurrentUser();

  if (currentUser?.role === "admin" && currentUser.status === "active") {
    redirect("/admin");
  }

  return (
    <main className="grid min-h-[calc(100vh-4.25rem)] place-items-center px-4 py-12">
      <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-[1fr_420px] lg:items-center">
        <section className="hidden rounded-3xl border border-sky-100 bg-[linear-gradient(135deg,#0f172a,#0369a1)] p-8 text-white shadow-2xl shadow-sky-950/20 dark:border-zinc-800 lg:block">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-200">
            GoRent operations
          </p>
          <h1 className="mt-4 text-5xl font-black leading-tight">
            Dedicated admin access for platform control.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-sky-100">
            Review Addis users, owner listings, booking activity, and marketplace quality from
            a private admin portal.
          </p>
          <div className="mt-10 grid gap-3 text-sm text-sky-100 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="font-bold text-white">Users</p>
              <p className="mt-1">Roles and account health</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="font-bold text-white">Listings</p>
              <p className="mt-1">Cars and availability</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="font-bold text-white">Bookings</p>
              <p className="mt-1">Pending owner actions</p>
            </div>
          </div>
        </section>
        <AdminLoginForm />
      </div>
    </main>
  );
}
