import { redirect } from "next/navigation";

export default function LegacyAdminAvailableListingsPage() {
  redirect("/admin/listings/available");
}
