import { getSiteConfig } from "@/lib/server-data";
import { ContentEditor } from "@/components/admin/content-editor";

export const dynamic = "force-dynamic";

function withTimeout<T>(p: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([p, new Promise<T>((res) => setTimeout(() => res(fallback), ms))]);
}

export default async function AdminContentPage() {
  const config = await withTimeout(getSiteConfig(), 5000, {} as Awaited<ReturnType<typeof getSiteConfig>>);
  return <ContentEditor config={config} />;
}
