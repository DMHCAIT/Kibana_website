import { getSiteConfig } from "@/lib/server-data";
import { HomepageManager } from "@/components/admin/homepage-manager";

export default async function HomepagePage() {
  const config = await getSiteConfig();

  return (
    <div className="p-6 overflow-y-auto h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Homepage Sections</h1>
        <p className="text-sm text-gray-500 mt-1">
          Control which sections are visible and their display order.
        </p>
      </div>
      <HomepageManager initialSections={config.sections} />
    </div>
  );
}
