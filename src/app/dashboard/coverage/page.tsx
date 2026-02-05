import { requireAuth } from "@/lib/auth";
import { DashboardLayout } from "@/components/DashboardLayout";

export const metadata = {
  title: "Coverage - Releason",
  description: "Test Coverage Analysis",
};

export default async function CoveragePage() {
  await requireAuth("/dashboard/coverage");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Coverage Analysis</h1>
          <p className="mt-1 text-sm text-gray-600">
            Detailed test coverage metrics and trends
          </p>
        </div>

        <div className="rounded-xl bg-white p-8 shadow-sm text-center">
          <div className="mx-auto max-w-md">
            <div className="mb-4 text-6xl">📊</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Coverage Page
            </h2>
            <p className="text-gray-600">
              This page will display detailed test coverage analysis,
              historical trends, and coverage breakdown by module.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
