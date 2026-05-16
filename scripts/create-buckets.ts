import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false },
});

const buckets = [
  { name: "product-images", public: true },
  { name: "product-videos", public: true },
  { name: "category-images", public: true },
  { name: "site-assets", public: true },
];

async function main() {
  console.log("Creating Supabase Storage buckets...\n");

  for (const bucket of buckets) {
    const { data: existing } = await supabase.storage.getBucket(bucket.name);
    if (existing) {
      console.log(`✓ Bucket "${bucket.name}" already exists — skipping`);
      continue;
    }

    const { error } = await supabase.storage.createBucket(bucket.name, {
      public: bucket.public,
      fileSizeLimit: bucket.name.includes("video") ? 50 * 1024 * 1024 : 10 * 1024 * 1024, // 50MB for video, 10MB for images
      allowedMimeTypes: bucket.name.includes("video")
        ? ["video/mp4", "video/webm", "video/quicktime"]
        : ["image/jpeg", "image/png", "image/webp", "image/gif"],
    });

    if (error) {
      console.error(`✗ Failed to create "${bucket.name}":`, error.message);
    } else {
      console.log(`✓ Created bucket "${bucket.name}" (public: ${bucket.public})`);
    }
  }

  console.log("\nDone. Buckets are ready for use.");
}

main().catch(console.error);
