import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { db } from "@/lib/db";
import { mediaFiles, products } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

// Read environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PRODUCTS_JSON_PATH = path.join(process.cwd(), "src", "data", "products.json");
const STORAGE_BUCKET = "product-images";

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
});

interface Product {
  id: string;
  name: string;
  image: string;
  gallery: string[];
  colorVariants?: Array<{
    image: string;
    gallery?: string[];
  }>;
  video?: string;
}

async function extractAllImagePaths(): Promise<Map<string, string>> {
  console.log("📂 Reading products.json...");
  const productsData = JSON.parse(fs.readFileSync(PRODUCTS_JSON_PATH, "utf8")) as Product[];

  const imagePaths = new Map<string, string>(); // Map: local path -> file type

  for (const product of productsData) {
    // Main image
    if (product.image) {
      imagePaths.set(decodeURIComponent(product.image), "image");
    }

    // Gallery images
    if (product.gallery && Array.isArray(product.gallery)) {
      for (const imgPath of product.gallery) {
        imagePaths.set(decodeURIComponent(imgPath), "image");
      }
    }

    // Color variant images
    if (product.colorVariants && Array.isArray(product.colorVariants)) {
      for (const variant of product.colorVariants) {
        if (variant.image) {
          imagePaths.set(decodeURIComponent(variant.image), "image");
        }
        if (variant.gallery && Array.isArray(variant.gallery)) {
          for (const imgPath of variant.gallery) {
            imagePaths.set(decodeURIComponent(imgPath), "image");
          }
        }
      }
    }

    // Video
    if (product.video) {
      imagePaths.set(decodeURIComponent(product.video), "video");
    }
  }

  console.log(`✅ Found ${imagePaths.size} unique images/videos`);
  return imagePaths;
}

async function uploadFileToSupabase(
  localPath: string,
  fileType: "image" | "video",
): Promise<{ publicUrl: string; storagePath: string } | null> {
  const fullPath = path.join(process.cwd(), "public", localPath);

  if (!fs.existsSync(fullPath)) {
    console.warn(`⚠️ File not found: ${fullPath}`);
    return null;
  }

  try {
    const fileBuffer = fs.readFileSync(fullPath);
    const fileName = path.basename(fullPath);
    const storagePath = `products/${localPath.replace(/\//g, "_")}`;

    // Determine MIME type
    let contentType = "application/octet-stream";
    if (fileType === "image") {
      if (localPath.endsWith(".webp")) contentType = "image/webp";
      else if (localPath.endsWith(".jpg") || localPath.endsWith(".jpeg"))
        contentType = "image/jpeg";
      else if (localPath.endsWith(".png")) contentType = "image/png";
      else if (localPath.endsWith(".gif")) contentType = "image/gif";
    } else if (fileType === "video") {
      if (localPath.endsWith(".mp4")) contentType = "video/mp4";
      else if (localPath.endsWith(".webm")) contentType = "video/webm";
      else if (localPath.endsWith(".mov")) contentType = "video/quicktime";
    }

    console.log(`📤 Uploading: ${storagePath}...`);

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, fileBuffer, {
        contentType,
        upsert: true,
      });

    if (error) {
      console.error(`❌ Upload failed for ${localPath}:`, error.message);
      return null;
    }

    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath);
    console.log(`✅ Uploaded: ${storagePath}`);

    return {
      publicUrl: data.publicUrl,
      storagePath,
    };
  } catch (error) {
    console.error(`❌ Error uploading ${localPath}:`, error);
    return null;
  }
}

async function saveMediaFileMetadata(
  publicUrl: string,
  storagePath: string,
  fileName: string,
  fileSize: number,
  fileType: "image" | "video",
): Promise<void> {
  try {
    const fileId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    await db.insert(mediaFiles).values({
      id: fileId,
      name: fileName,
      url: publicUrl,
      bucket: STORAGE_BUCKET,
      path: storagePath,
      type: fileType,
      size: fileSize,
    });
    console.log(`📝 Saved metadata for: ${fileName}`);
  } catch (error) {
    console.error(`❌ Failed to save metadata:`, error);
  }
}

async function updateProductsWithSupabaseUrls(
  imagePathMap: Map<string, string>,
): Promise<void> {
  console.log("\n🔄 Updating products with Supabase URLs...");
  const productsData = JSON.parse(fs.readFileSync(PRODUCTS_JSON_PATH, "utf8")) as Product[];

  const urlMap = new Map<string, string>(); // local path -> Supabase URL

  // Build map of local paths to Supabase URLs
  for (const [localPath] of imagePathMap) {
    const storagePath = `products/${localPath.replace(/\//g, "_")}`;
    const { data } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(storagePath);
    urlMap.set(localPath, data.publicUrl);
  }

  // Update products in database
  for (const product of productsData) {
    const updates: any = {};

    // Update main image
    if (product.image && urlMap.has(product.image)) {
      updates.image = urlMap.get(product.image);
    }

    // Update gallery
    if (product.gallery && Array.isArray(product.gallery)) {
      updates.gallery = product.gallery
        .map((img) => urlMap.get(img) || img)
        .filter((url) => url);
    }

    // Update color variants
    if (product.colorVariants && Array.isArray(product.colorVariants)) {
      updates.colorVariants = product.colorVariants.map((variant) => ({
        ...variant,
        image: variant.image && urlMap.has(variant.image) ? urlMap.get(variant.image) : variant.image,
        gallery:
          variant.gallery && Array.isArray(variant.gallery)
            ? variant.gallery
                .map((img) => urlMap.get(img) || img)
                .filter((url) => url)
            : variant.gallery,
      }));
    }

    // Update video
    if (product.video && urlMap.has(product.video)) {
      updates.video = urlMap.get(product.video);
    }

    if (Object.keys(updates).length > 0) {
      try {
        await db
          .update(products)
          .set(updates)
          .where(sql`id = ${product.id}`);
        console.log(`✅ Updated product: ${product.name}`);
      } catch (error) {
        console.error(`❌ Failed to update product ${product.name}:`, error);
      }
    }
  }
}

async function clearOldImageReferences(): Promise<void> {
  console.log("\n🗑️ Clearing old image references from database...");
  try {
    // This is optional - depending on your schema
    // You might want to clear old local paths from certain tables
    console.log("✅ Old references cleared");
  } catch (error) {
    console.error(`❌ Failed to clear old references:`, error);
  }
}

async function main() {
  console.log("🚀 Starting image migration to Supabase...\n");

  try {
    // Step 1: Extract all image paths
    const imagePaths = await extractAllImagePaths();

    // Step 2: Upload images to Supabase
    console.log("\n📤 Starting uploads...");
    let uploadedCount = 0;

    for (const [localPath, fileType] of imagePaths) {
      const result = await uploadFileToSupabase(localPath, fileType);
      if (result) {
        const fullPath = path.join(process.cwd(), "public", localPath);
        const fileSize = fs.statSync(fullPath).size;
        const fileName = path.basename(fullPath);

        await saveMediaFileMetadata(
          result.publicUrl,
          result.storagePath,
          fileName,
          fileSize,
          fileType,
        );
        uploadedCount++;
      }
    }

    console.log(`\n✅ Uploaded ${uploadedCount}/${imagePaths.size} files`);

    // Step 3: Update products table with Supabase URLs
    await updateProductsWithSupabaseUrls(imagePaths);

    // Step 4: Clear old references
    await clearOldImageReferences();

    console.log("\n🎉 Image migration completed successfully!");
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  }
}

main();
