/**
 * Backfill script: scans all Supabase Storage buckets and inserts any missing
 * records into the media_files table.
 *
 * Run once after the media_files table is created:
 *   node scripts/sync-media-files.mjs
 */

import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";
import postgres from "postgres";

// Load .env.local
const env = readFileSync(".env.local", "utf8");
for (const line of env.split("\n")) {
  const [key, ...rest] = line.split("=");
  if (key && rest.length) process.env[key.trim()] = rest.join("=").trim();
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const databaseUrl = process.env.DATABASE_URL;

if (!supabaseUrl || !serviceKey || !databaseUrl) {
  console.error("Missing required env vars in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false },
});

const sql = postgres(databaseUrl, { ssl: "require", connect_timeout: 10 });

const BUCKETS = [
  "product-images",
  "product-videos",
  "category-images",
  "site-media",
  "site-assets",
];

/** Recursively list all files in a bucket folder */
async function listAllFiles(bucket, prefix = "") {
  const { data, error } = await supabase.storage.from(bucket).list(prefix, {
    limit: 1000,
    offset: 0,
  });

  if (error) {
    console.warn(`  ⚠ Could not list "${bucket}/${prefix}": ${error.message}`);
    return [];
  }
  if (!data || data.length === 0) return [];

  const files = [];
  for (const item of data) {
    if (item.id === null) {
      // It's a folder — recurse
      const subPath = prefix ? `${prefix}/${item.name}` : item.name;
      const subFiles = await listAllFiles(bucket, subPath);
      files.push(...subFiles);
    } else {
      // It's a file
      const filePath = prefix ? `${prefix}/${item.name}` : item.name;
      files.push({ name: item.name, path: filePath, metadata: item.metadata });
    }
  }
  return files;
}

async function main() {
  console.log("Syncing Supabase Storage files → media_files table...\n");

  let totalInserted = 0;
  let totalSkipped = 0;

  for (const bucket of BUCKETS) {
    console.log(`Scanning bucket: ${bucket}`);
    const files = await listAllFiles(bucket);

    if (files.length === 0) {
      console.log(`  (empty)\n`);
      continue;
    }

    for (const file of files) {
      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(file.path);

      // Determine type from extension
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
      const videoExts = ["mp4", "webm", "mov", "avi"];
      const type = videoExts.includes(ext) ? "video" : "image";
      const size = file.metadata?.size ?? 0;

      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      try {
        await sql`
          INSERT INTO media_files (id, name, url, bucket, path, type, size)
          VALUES (${id}, ${file.name}, ${publicUrl}, ${bucket}, ${file.path}, ${type}, ${size})
          ON CONFLICT DO NOTHING
        `;
        console.log(`  ✓ ${file.path}`);
        totalInserted++;
      } catch (e) {
        console.warn(`  ✗ ${file.path}: ${e.message}`);
        totalSkipped++;
      }
    }
    console.log();
  }

  console.log(`Done. Inserted: ${totalInserted}, Skipped/errors: ${totalSkipped}`);
  await sql.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
