import { getSiteConfig } from "@/lib/server-data";
import { HeroEditor } from "@/components/admin/settings-form";

export default async function AdminHeroPage() {
  const config = await getSiteConfig();
  return <HeroEditor initialConfig={config} />;
}
