import { requireAuth } from "@/lib/auth";
import { DashboardLayout } from "@/components/DashboardLayout";

export const metadata = {
  title: "Risk Analysis - Releason",
  description: "Release Risk Assessment",
};

export default async function RiskPage() {
  await requireAuth("/dashboard/risk");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Risk Analysis</h1>
          <p className="mt-1 text-sm text-gray-600">
            Comprehensive risk assessment for your releases
          </p>
        </div>

        <div className="rounded-xl bg-white p-8 shadow-sm text-center">
          <div className="mx-auto max-w-md">
            <div className="mb-4 text-6xl">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Risk Analysis Page
            </h2>
            <p className="text-gray-600">
              This page will display detailed risk analysis, impact assessments,
              and recommendations for risk mitigation.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
