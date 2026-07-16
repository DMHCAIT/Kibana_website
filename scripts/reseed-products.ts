import { config } from "dotenv";
config({ path: ".env.local" });
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { products as productsTable } from "../src/lib/db/schema";

const client = postgres(process.env.DATABASE_URL!, { prepare: false, max: 1 });
const db = drizzle(client);

async function clearAndReseed() {
  try {
    console.log("🔧 Clearing old products from database...\n");

    // Delete all products
    await client`DELETE FROM products`;
    console.log("✅ Deleted all old products");

    // Read and insert fresh products with variantIds
    const fs = await import("fs");
    const path = await import("path");
    const products = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), "src/data/products.json"), "utf-8"),
    );

    console.log(`\n📝 Re-inserting ${products.length} products with variantIds...\n`);

    let insertedCount = 0;
    for (const product of products) {
      await db.insert(productsTable).values({
        id: product.id,
        slug: product.slug,
        name: product.name ?? "",
        description: product.description ?? "",
        price: product.price ?? 0,
        compareAtPrice: product.compareAtPrice ?? null,
        image: product.image ?? "",
        gallery: product.gallery ?? [],
        category: product.category ?? "",
        gender: product.gender ?? "women",
        isNew: product.isNew ?? false,
        isBestSeller: product.isBestSeller ?? false,
        isTrending: product.isTrending ?? false,
        colors: product.colors ?? [],
        colorVariants: product.colorVariants ?? [], // Now includes variantId!
        features: product.features ?? [],
        specs: product.specs ?? {},
        rating: product.rating ?? 0,
        reviewCount: product.reviewCount ?? 0,
        sortOrder: product.order ?? insertedCount + 1,
      });

      const variantIds = (product.colorVariants ?? []).map((v: any) => v.variantId).filter(Boolean);
      console.log(`✅ ${product.id}: ${product.slug} (${variantIds.length} variants with IDs)`);
      insertedCount++;
    }

    console.log(`\n✅ Successfully inserted ${insertedCount} products!`);

    // Verify
    const result = await client`SELECT id, color_variants FROM products LIMIT 1`;
    if (result.length > 0) {
      const variants = result[0].color_variants as any[];
      console.log(`\n🔍 VERIFICATION - Sample product variants:`);
      console.log(`   Variant count: ${variants.length}`);
      if (variants.length > 0) {
        console.log(`   Sample variant ID: ${variants[0].variantId || "(missing)"}`);
        console.log(
          `   All have variantId? ${variants.every((v: any) => v.variantId) ? "✅ YES" : "❌ NO"}`,
        );
      }
    }

    console.log("\n✅ Database re-seeding complete!");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await client.end();
  }
}

clearAndReseed();
