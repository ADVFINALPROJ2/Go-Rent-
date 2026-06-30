import { redirect } from "next/navigation";

export default function LegacyAdminListingsPage() {
  redirect("/admin/listings");
}
