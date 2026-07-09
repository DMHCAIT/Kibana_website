import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

async function fixProductUrls() {
  console.log("🔧 Starting URL migration...\n");

  try {
    // Get all products from database
    const { data: products, error } = await supabase
      .from("products")
      .select("*");

    if (error) throw error;
    if (!products) {
      console.log("No products found");
      process.exit(0);
    }

    console.log(`Found ${products.length} products\n`);

    let updatedCount = 0;

    for (const product of products) {
      let hasChanges = false;
      const updates: any = {};

      // Fix main image
      if (product.image && product.image.startsWith("/kibana_product_images")) {
        const newUrl = product.image.replace(
          /^\/kibana_product_images/,
          "https://opkgstmsfyjzbympczwd.supabase.co/storage/v1/object/public/product-images/products/_kibana_product_images"
        );
        updates.image = newUrl;
        hasChanges = true;
        console.log(`📸 ${product.name}: Updated main image`);
      }

      // Fix gallery
      if (product.gallery && Array.isArray(product.gallery)) {
        const newGallery = product.gallery.map((url: string) => {
          if (typeof url === "string" && url.startsWith("/kibana_product_images")) {
            return url.replace(
              /^\/kibana_product_images/,
              "https://opkgstmsfyjzbympczwd.supabase.co/storage/v1/object/public/product-images/products/_kibana_product_images"
            );
          }
          return url;
        });
        if (JSON.stringify(newGallery) !== JSON.stringify(product.gallery)) {
          updates.gallery = newGallery;
          hasChanges = true;
          console.log(`  📷 Updated gallery (${newGallery.length} images)`);
        }
      }

      // Fix color variants
      if (product.colorVariants && Array.isArray(product.colorVariants)) {
        const newVariants = product.colorVariants.map((variant: any) => {
          const updated = { ...variant };

          if (variant.image && variant.image.startsWith("/kibana_product_images")) {
            updated.image = variant.image.replace(
              /^\/kibana_product_images/,
              "https://opkgstmsfyjzbympczwd.supabase.co/storage/v1/object/public/product-images/products/_kibana_product_images"
            );
            hasChanges = true;
          }

          if (variant.gallery && Array.isArray(variant.gallery)) {
            updated.gallery = variant.gallery.map((url: string) => {
              if (typeof url === "string" && url.startsWith("/kibana_product_images")) {
                return url.replace(
                  /^\/kibana_product_images/,
                  "https://opkgstmsfyjzbympczwd.supabase.co/storage/v1/object/public/product-images/products/_kibana_product_images"
                );
              }
              return url;
            });
          }

          return updated;
        });

        if (JSON.stringify(newVariants) !== JSON.stringify(product.colorVariants)) {
          updates.colorVariants = newVariants;
          hasChanges = true;
          console.log(`  🎨 Updated color variants`);
        }
      }

      // Fix video
      if (product.video && product.video.startsWith("/kibana_product_images")) {
        const newVideo = product.video.replace(
          /^\/kibana_product_images/,
          "https://opkgstmsfyjzbympczwd.supabase.co/storage/v1/object/public/product-images/products/_kibana_product_images"
        );
        updates.video = newVideo;
        hasChanges = true;
        console.log(`  🎬 Updated video`);
      }

      // If there are changes, update the product
      if (hasChanges) {
        const { error: updateError } = await supabase
          .from("products")
          .update(updates)
          .eq("id", product.id);

        if (updateError) {
          console.error(`Error updating ${product.name}:`, updateError.message);
        } else {
          updatedCount++;
        }
      }
    }

    console.log(`\n✅ Updated ${updatedCount} products with Supabase URLs`);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }

  process.exit(0);
}

fixProductUrls();
