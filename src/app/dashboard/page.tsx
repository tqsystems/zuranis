import { requireAuth } from "@/lib/auth";
import { DashboardLayout } from "@/components/DashboardLayout";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export const metadata = {
  title: "Dashboard - Releason",
  description: "Release Confidence Intelligence Dashboard",
};

export default async function DashboardPage() {
  // Require authentication - will redirect to sign-in if not authenticated
  const user = await requireAuth("/dashboard");

  return (
    <DashboardLayout>
      <DashboardClient user={user} />
    </DashboardLayout>
  );
}
