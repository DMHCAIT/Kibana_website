#!/usr/bin/env node
/**
 * Bulk upload script for images to Supabase
 * Uploads all product images concurrently
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PRODUCTS_JSON = path.join(__dirname, "..", "src", "data", "products.json");
const PUBLIC_DIR = path.join(__dirname, "..", "public");

const SUPABASE_URL = "https://opkgstmsfyjzbympczwd.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET_NAME = "product-images";
const MAX_CONCURRENT = 5; // Limit concurrent uploads

if (!SUPABASE_KEY) {
  console.error("❌ SUPABASE_SERVICE_ROLE_KEY environment variable not set");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
});

async function uploadFileToSupabase(localPath, fileName) {
  const fullPath = path.join(PUBLIC_DIR, localPath);
  
  if (!fs.existsSync(fullPath)) {
    console.warn(`⚠️ File not found: ${fileName}`);
    return { success: false, error: "File not found", fileName };
  }

  try {
    const buffer = fs.readFileSync(fullPath);
    const storagePath = `products/${localPath.replace(/\//g, "_")}`;

    // Determine MIME type
    let contentType = "application/octet-stream";
    if (fileName.endsWith(".webp")) contentType = "image/webp";
    else if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) contentType = "image/jpeg";
    else if (fileName.endsWith(".png")) contentType = "image/png";
    else if (fileName.endsWith(".gif")) contentType = "image/gif";
    else if (fileName.endsWith(".mp4")) contentType = "video/mp4";
    else if (fileName.endsWith(".webm")) contentType = "video/webm";

    const { error } = await supabase.storage.from(BUCKET_NAME).upload(storagePath, buffer, {
      contentType,
      upsert: true,
    });

    if (error) {
      return { success: false, error: error.message, fileName };
    }

    return { success: true, fileName, storagePath };
  } catch (err) {
    return { success: false, error: err.message, fileName };
  }
}

async function uploadFilesInParallel(filesList, maxConcurrent = MAX_CONCURRENT) {
  const results = [];
  let processing = 0;
  let currentIndex = 0;

  const processNext = async () => {
    if (currentIndex >= filesList.length) return;

    const [localPath, fileName] = filesList[currentIndex++];
    processing++;

    try {
      const result = await uploadFileToSupabase(localPath, fileName);
      results.push(result);
      if (result.success) {
        process.stdout.write(".");
      } else {
        process.stdout.write("x");
      }
    } finally {
      processing--;
      if (currentIndex < filesList.length) {
        await processNext();
      }
    }
  };

  // Start maxConcurrent tasks
  const tasks = [];
  for (let i = 0; i < Math.min(maxConcurrent, filesList.length); i++) {
    tasks.push(processNext());
  }

  await Promise.all(tasks);
  return results;
}

async function main() {
  console.log("=== Bulk Image Upload to Supabase ===\n");

  // Read products.json
  const productsData = JSON.parse(fs.readFileSync(PRODUCTS_JSON, "utf8"));

  // Extract all unique image paths (now with old paths for reference)
  const backupPath = PRODUCTS_JSON + ".backup";
  let oldProductsData = null;
  
  if (fs.existsSync(backupPath)) {
    oldProductsData = JSON.parse(fs.readFileSync(backupPath, "utf8"));
  }

  const filesList = new Map();

  // Extract from backup (old paths)
  if (oldProductsData) {
    for (const product of oldProductsData) {
      if (product.image) {
        const decoded = decodeURIComponent(product.image);
        filesList.set(decoded, path.basename(decoded));
      }
      if (product.gallery && Array.isArray(product.gallery)) {
        product.gallery.forEach(img => {
          const decoded = decodeURIComponent(img);
          filesList.set(decoded, path.basename(decoded));
        });
      }
      if (product.colorVariants && Array.isArray(product.colorVariants)) {
        product.colorVariants.forEach(variant => {
          if (variant.image) {
            const decoded = decodeURIComponent(variant.image);
            filesList.set(decoded, path.basename(decoded));
          }
          if (variant.gallery && Array.isArray(variant.gallery)) {
            variant.gallery.forEach(img => {
              const decoded = decodeURIComponent(img);
              filesList.set(decoded, path.basename(decoded));
            });
          }
        });
      }
      if (product.video) {
        const decoded = decodeURIComponent(product.video);
        filesList.set(decoded, path.basename(decoded));
      }
    }
  }

  const files = Array.from(filesList.entries());
  console.log(`📊 Uploading ${files.length} files to Supabase...\n`);

  const startTime = Date.now();
  const results = await uploadFilesInParallel(files, MAX_CONCURRENT);

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log(`\n\n📊 Upload Summary:`);
  console.log(`✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⏱️ Duration: ${duration}s`);
  console.log(`📈 Speed: ${(successful / duration).toFixed(2)} files/sec`);

  if (failed > 0) {
    console.log(`\n⚠️ Failed uploads:`);
    results.filter(r => !r.success).forEach(r => {
      console.log(`   - ${r.fileName}: ${r.error}`);
    });
  }

  console.log("\n✨ Upload complete!");
}

main().catch(err => {
  console.error("❌ Error:", err);
  process.exit(1);
});
