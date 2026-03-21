import { redirect } from "next/navigation";

/** Old URL — use /ops instead. */
export default function DashboardOpsRedirectPage() {
  redirect("/ops");
}
