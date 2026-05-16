import { getSiteConfig } from "@/lib/server-data";
import { ContactEditor } from "@/components/admin/page-content-editor";

export default async function AdminContactPage() {
  const config = await getSiteConfig();
  return <ContactEditor initialData={config.pages.contact} />;
}
