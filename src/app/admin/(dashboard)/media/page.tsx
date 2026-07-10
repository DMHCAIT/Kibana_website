import { MediaClient } from "@/components/admin/media-client";

export const dynamic = "force-dynamic";

export default function AdminMediaPage() {
  return <MediaClient initialMedia={[]} />;
}
