import { getSiteConfig } from "@/lib/server-data";
import { ShopPageEditor } from "@/components/admin/page-content-editor";

export default async function AdminShopPageEditor() {
  const config = await getSiteConfig();
  return <ShopPageEditor initialData={config.pages.shop} />;
}
