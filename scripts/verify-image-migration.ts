import { db } from "@/lib/db";
import { products, mediaFiles } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

async function main() {
  console.log("=== Image Migration Verification ===\n");

  try {
    // Check media files count
    const mediaCount = await db.select({ count: sql<number>`count(*)` }).from(mediaFiles);
    console.log(`📊 Media files in database: ${mediaCount[0]?.count || 0}`);

    // Check products with Supabase URLs
    const productsWithUrls = await db
      .select({
        name: products.name,
        image: products.image,
        gallery: products.gallery,
        colorVariants: products.colorVariants,
      })
      .from(products);

    console.log(`\n📦 Products using Supabase URLs:\n`);

    let supabaseCount = 0;
    let localCount = 0;

    for (const product of productsWithUrls) {
      let hasSupabase = false;
      let hasLocal = false;

      if (product.image?.includes("supabase.co")) hasSupabase = true;
      if (product.image?.startsWith("/")) hasLocal = true;

      if (product.gallery && Array.isArray(product.gallery)) {
        if (product.gallery.some(img => img?.includes("supabase.co"))) hasSupabase = true;
        if (product.gallery.some(img => img?.startsWith("/"))) hasLocal = true;
      }

      if (product.colorVariants && Array.isArray(product.colorVariants)) {
        product.colorVariants.forEach(variant => {
          if (variant?.image?.includes("supabase.co")) hasSupabase = true;
          if (variant?.image?.startsWith("/")) hasLocal = true;
          if (variant?.gallery && Array.isArray(variant.gallery)) {
            if (variant.gallery.some(img => img?.includes("supabase.co"))) hasSupabase = true;
            if (variant.gallery.some(img => img?.startsWith("/"))) hasLocal = true;
          }
        });
      }

      if (hasSupabase) supabaseCount++;
      if (hasLocal) localCount++;

      console.log(`${hasSupabase ? "✅" : "⚠️"} ${product.name}`);
      if (hasLocal) console.log(`   (Still has ${localCount} local image paths)`);
    }

    console.log(`\n📊 Summary:`);
    console.log(`✅ Products using Supabase: ${supabaseCount}/${productsWithUrls.length}`);
    console.log(`⚠️ Products still using local paths: ${localCount}/${productsWithUrls.length}`);

    // Sample URLs
    console.log(`\n📍 Sample Supabase URLs:\n`);
    const sample = productsWithUrls[0];
    if (sample?.image?.includes("supabase.co")) {
      console.log(`Image: ${sample.image.substring(0, 100)}...`);
    }
    if (sample?.gallery && sample.gallery[0]?.includes("supabase.co")) {
      console.log(`Gallery: ${sample.gallery[0].substring(0, 100)}...`);
    }

    console.log(`\n🎉 Verification complete!`);
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
}

main();
