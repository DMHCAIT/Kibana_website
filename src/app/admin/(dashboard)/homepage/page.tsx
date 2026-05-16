import { getSiteConfig, getProducts } from "@/lib/server-data";
import { HomepageTabs } from "./HomepageTabs";

export const dynamic = "force-dynamic";

export default async function HomepagePage() {
  const [config, allProducts] = await Promise.all([getSiteConfig(), getProducts()]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-6 pt-6 pb-3 flex-shrink-0">
        <h1 className="text-2xl font-bold text-gray-900">Homepage</h1>
        <p className="text-sm text-gray-500 mt-1">
          Edit every homepage section — layout, images, text and product assignments.
        </p>
      </div>
      <HomepageTabs config={config as Parameters<typeof HomepageTabs>[0]["config"]} allProducts={allProducts} />
    </div>
  );
}
