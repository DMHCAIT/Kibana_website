import { getSiteConfig } from "@/lib/server-data";
import { ContentEditor } from "@/components/admin/content-editor";

export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  const config = await getSiteConfig();
  return <ContentEditor config={config} />;
}
