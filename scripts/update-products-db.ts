import dotenv from "dotenv";
import path from "path";

// Load .env.local before importing anything else
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import fs from "fs";

async function main() {
  console.log("=== Updating Products Database with Supabase URLs ===\n");

  try {
    // Read the updated products.json
    const productsJsonPath = path.join(process.cwd(), "src", "data", "products.json");
    const productsData = JSON.parse(fs.readFileSync(productsJsonPath, "utf8"));

    console.log(`📊 Found ${productsData.length} products to update\n`);

    let updateCount = 0;

    for (const product of productsData) {
      try {
        await db
          .update(products)
          .set({
            image: product.image,
            gallery: product.gallery,
            colorVariants: product.colorVariants,
            video: product.video,
          })
          .where(eq(products.id, product.id));

        console.log(`✅ Updated: ${product.name} (${product.id})`);
        updateCount++;
      } catch (err) {
        console.error(`❌ Failed to update ${product.name}:`, err);
      }
    }

    console.log(`\n✨ Successfully updated ${updateCount}/${productsData.length} products`);
    console.log("\n🎉 Database update complete!");
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
}

main();
