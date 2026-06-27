import { redirect } from "next/navigation";

export default function LegacyAdminPendingBookingsPage() {
  redirect("/admin/bookings/pending");
}
