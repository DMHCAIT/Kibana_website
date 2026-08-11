#!/usr/bin/env node

import postgres from "postgres";

const DATABASE_URL =
  "postgresql://postgres.opkgstmsfyjzbympczwd:Rubeena%231234@aws-1-ap-south-1.pooler.supabase.com:6543/postgres";

const sql = postgres(DATABASE_URL, { ssl: "require" });

async function test() {
  console.log("🔍 Testing Admin Product Save Flow\n");

  try {
    // Step 1: Get a product from database
    console.log("📦 STEP 1: Fetching a product from database...");
    const result = await sql`SELECT * FROM products LIMIT 1`;
    const getResult = { rows: result };
    
    if (getResult.rows.length === 0) {
      console.log("❌ No products found in database");
      await pool.end();
      return;
    }

    const product = getResult.rows[0];
    console.log(`✅ Found product: ${product.name} (ID: ${product.id})\n`);

    // Step 2: Check the colorVariants structure
    console.log("🎨 STEP 2: Checking colorVariants structure...");
    console.log("colorVariants raw type:", typeof product.colorVariants);
    console.log("colorVariants content:", JSON.stringify(product.colorVariants, null, 2));

    if (Array.isArray(product.colorVariants)) {
      console.log(`✅ colorVariants is array with ${product.colorVariants.length} items`);
      product.colorVariants.forEach((v, i) => {
        console.log(`  [${i}] ${v.color || v.slug}: inStock=${v.inStock !== false ? "YES" : "NO"}`);
      });
    } else {
      console.log("⚠️ colorVariants is not an array:", product.colorVariants);
    }

    // Step 3: Simulate admin update - toggle first variant to out of stock
    console.log("\n💾 STEP 3: Simulating admin update (toggle stock)...");
    if (Array.isArray(product.colorVariants) && product.colorVariants.length > 0) {
      const firstVariant = product.colorVariants[0];
      console.log(`Before: ${firstVariant.color || firstVariant.slug} inStock=${firstVariant.inStock !== false ? "YES" : "NO"}`);
      
      // Toggle inStock
      firstVariant.inStock = !firstVariant.inStock;
      
      console.log(`After: ${firstVariant.color || firstVariant.slug} inStock=${firstVariant.inStock !== false ? "YES" : "NO"}`);

      // Update the database directly
      console.log("📝 Updating database...");
      await sql`UPDATE products 
         SET "colorVariants" = ${JSON.stringify(product.colorVariants)}, "updatedAt" = NOW() 
         WHERE id = ${product.id}`;
      console.log("✅ Database update successful\n");
    } else {
      console.log("⚠️ No variants to test\n");
      await sql.end();
      return;
    }

    // Step 4: Fetch updated product from database
    console.log("🔄 STEP 4: Fetching updated product...");
    const getUpdatedResult = await sql`SELECT "colorVariants" FROM products WHERE id = ${product.id}`;

    const updatedVariants = getUpdatedResult[0].colorVariants;
    console.log("Updated colorVariants:", JSON.stringify(updatedVariants, null, 2));

    const firstUpdatedVariant = updatedVariants[0];
    console.log(
      `✅ First variant after update: ${firstUpdatedVariant.color || firstUpdatedVariant.slug} inStock=${firstUpdatedVariant.inStock !== false ? "YES" : "NO"}`
    );

    // Step 5: Check via API
    console.log("\n🌐 STEP 5: Testing via /api/products...");
    const apiResponse = await fetch("http://localhost:3001/api/products");
    if (!apiResponse.ok) {
      console.log(`❌ API returned status ${apiResponse.status}`);
      await pool.end();
      return;
    }

    const products = await apiResponse.json();
    const apiProduct = products.find((p) => p.id === product.id);

    if (!apiProduct) {
      console.log(`❌ Product ${product.id} not found in API response`);
      await sql.end();
      return;
    }

    console.log("API response colorVariants:", JSON.stringify(apiProduct.colorVariants, null, 2));
    const apiFirstVariant = apiProduct.colorVariants[0];
    console.log(
      `API: First variant ${apiFirstVariant.color || apiFirstVariant.slug} inStock=${apiFirstVariant.inStock !== false ? "YES" : "NO"}`
    );

    // Summary
    console.log("\n📊 SUMMARY:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`✅ Database: Stock updated = ${firstUpdatedVariant.inStock !== firstVariant.inStock ? "YES" : "NO"}`);
    console.log(`✅ API: Shows updated stock = ${apiFirstVariant.inStock === firstUpdatedVariant.inStock ? "YES" : "NO"}`);

    if (
      firstUpdatedVariant.inStock === firstVariant.inStock &&
      apiFirstVariant.inStock === firstUpdatedVariant.inStock
    ) {
      console.log("\n✅ ADMIN SAVE FLOW WORKING CORRECTLY");
    } else {
      console.log("\n❌ ISSUE DETECTED: Data not syncing");
    }

    await sql.end();
  } catch (error) {
    console.error("❌ Error:", error.message);
    await sql.end();
    process.exit(1);
  }
}

test();
