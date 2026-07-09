import { getMediaFiles } from "@/lib/server-data";
import { MediaClient } from "@/components/admin/media-client";

export const dynamic = "force-dynamic";

function withTimeout<T>(p: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([p, new Promise<T>((res) => setTimeout(() => res(fallback), ms))]);
}

export default async function AdminMediaPage() {
  const files = await withTimeout(getMediaFiles(), 2500, []);
  return <MediaClient initialFiles={files} />;
}
