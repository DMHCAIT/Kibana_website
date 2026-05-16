import { getSiteConfig } from "@/lib/server-data";
import { ReturnsEditor } from "@/components/admin/page-content-editor";

export default async function AdminReturnsPage() {
  const config = await getSiteConfig();
  return <ReturnsEditor initialData={config.pages.returns} />;
}
