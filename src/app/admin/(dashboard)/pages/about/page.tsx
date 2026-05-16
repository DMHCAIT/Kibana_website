import { getSiteConfig } from "@/lib/server-data";
import { AboutEditor } from "@/components/admin/page-content-editor";

export default async function AdminAboutPage() {
  const config = await getSiteConfig();
  return <AboutEditor initialData={config.pages.about} />;
}
