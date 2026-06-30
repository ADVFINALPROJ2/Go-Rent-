import { redirect } from "next/navigation";

export default function LegacyAdminDisabledListingsPage() {
  redirect("/admin/listings/disabled");
}
