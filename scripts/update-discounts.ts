import dotenv from "dotenv";
import path from "path";

// Load .env.local before importing anything else
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import postgres from "postgres";

async function main() {
  console.log("=== Updating Product Discounts ===\n");

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("❌ DATABASE_URL not found in environment variables");
    process.exit(1);
  }

  // Create a direct connection to the database
  const sql = postgres(databaseUrl, {
    ssl: "require",
  });

  try {
    // Fetch all products
    const allProducts = await sql`
      SELECT id, slug, name, price, compare_at_price
      FROM products
      ORDER BY id
    `;

    console.log(`📊 Found ${allProducts.length} products\n`);

    if (allProducts.length === 0) {
      console.log("❌ No products found in database");
      await sql.end();
      process.exit(1);
    }

    // Distribute discounts
    // Most products: 60% off
    // Some products: 55% off
    // Rest: 50% off

    const twoThirds = Math.floor((allProducts.length * 2) / 3);
    const oneThird = Math.floor(allProducts.length / 3);
    const rest = allProducts.length - twoThirds - oneThird;

    console.log(`📈 Discount Distribution:`);
    console.log(`   🔥 60% off: ${twoThirds} products`);
    console.log(`   🌟 55% off: ${oneThird} products`);
    console.log(`   ⭐ 50% off: ${rest} products\n`);

    let successCount = 0;

    for (let i = 0; i < allProducts.length; i++) {
      const product = allProducts[i];
      let discountPercent = 50; // Default: 50% off

      if (i < twoThirds) {
        discountPercent = 60; // Most products: 60% off
      } else if (i < twoThirds + oneThird) {
        discountPercent = 55; // Some products: 55% off
      }

      // Calculate compareAtPrice from current price and discount
      // Formula: compareAtPrice = price / (1 - discount/100)
      const compareAtPrice = Math.round(product.price / (1 - discountPercent / 100));

      try {
        await sql`
          UPDATE products
          SET compare_at_price = ${compareAtPrice}
          WHERE id = ${product.id}
        `;

        console.log(
          `✅ ${product.name} (₹${product.price}): ${discountPercent}% off → Compare at ₹${compareAtPrice}`,
        );
        successCount++;
      } catch (err) {
        console.error(`❌ Failed to update ${product.name}:`, err);
      }
    }

    console.log(`\n✨ Successfully updated ${successCount}/${allProducts.length} products`);
    console.log("\n🎉 Discount update complete!");

    await sql.end();
  } catch (err) {
    console.error("❌ Error:", err);
    await sql.end();
    process.exit(1);
  }
}

main();
