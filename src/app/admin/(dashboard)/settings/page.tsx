import { getSiteConfig } from "@/lib/server-data";
import { SettingsForm } from "@/components/admin/settings-form";

export default async function SettingsPage() {
  const config = await getSiteConfig();

  return (
    <div className="p-6 overflow-y-auto h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Site Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Edit hero text, brand colors, fonts, and announcement bar.
        </p>
      </div>
      <SettingsForm initialConfig={config} />
    </div>
  );
}
