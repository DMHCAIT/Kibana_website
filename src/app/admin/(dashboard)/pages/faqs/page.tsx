import { getSiteConfig } from "@/lib/server-data";
import { FaqsEditor } from "@/components/admin/page-content-editor";

export default async function AdminFaqsPage() {
  const config = await getSiteConfig();
  return <FaqsEditor initialData={config.pages.faqs} />;
}
