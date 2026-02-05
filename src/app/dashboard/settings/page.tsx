import { requireAuth } from "@/lib/auth";
import { DashboardLayout } from "@/components/DashboardLayout";

export const metadata = {
  title: "Settings - Releason",
  description: "Application Settings",
};

export default async function SettingsPage() {
  const user = await requireAuth("/dashboard/settings");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your account and application preferences
          </p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Account Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Name</label>
              <p className="mt-1 text-gray-900">
                {user.name || user.login || "N/A"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-gray-900">{user.email || "N/A"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                GitHub Username
              </label>
              <p className="mt-1 text-gray-900">{user.login || "N/A"}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-8 shadow-sm text-center">
          <div className="mx-auto max-w-md">
            <div className="mb-4 text-6xl">⚙️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Settings Page
            </h2>
            <p className="text-gray-600">
              Additional settings for notifications, integrations, and
              preferences will be available here.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
