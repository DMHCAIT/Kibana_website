#!/usr/bin/env node

import postgres from "postgres";

const sql = postgres(
  "postgresql://postgres.opkgstmsfyjzbympczwd:Rubeena%231234@aws-1-ap-south-1.pooler.supabase.com:6543/postgres",
  { ssl: "require" }
);

async function test() {
  console.log("🔍 End-to-End Admin Update Test\n");

  try {
    // Step 1: Get product ID
    console.log("📦 STEP 1: Fetching a product...");
    const products = await sql`SELECT * FROM products LIMIT 1`;
    
    if (products.length === 0) {
      console.log("❌ No products in database");
      await sql.end();
      return;
    }

    const product = products[0];
    console.log(`✅ Found: ${product.name} (ID: ${product.id})\n`);

    // Step 2: Get current stock status
    console.log("🎨 STEP 2: Current stock status:");
    if (product.color_variants && Array.isArray(product.color_variants)) {
      product.color_variants.forEach((v, i) => {
        console.log(`  [${i}] ${v.color || v.slug}: inStock=${v.inStock}`);
      });
    } else {
      console.log("  ⚠️ No variants data");
    }

    // Step 3: Simulate admin form submission
    console.log("\n💾 STEP 3: Simulating admin form submission...");
    
    // Toggle first variant
    if (product.color_variants && product.color_variants.length > 0) {
      const firstVariantBefore = product.color_variants[0].inStock;
      product.color_variants[0].inStock = !firstVariantBefore;
      console.log(`  Toggle: ${product.color_variants[0].color || product.color_variants[0].slug}`);
      console.log(`    Before: inStock=${firstVariantBefore}`);
      console.log(`    After: inStock=${product.color_variants[0].inStock}\n`);

      // Step 4: Send PUT request to admin API
      console.log("🌐 STEP 4: Sending PUT request to admin API...");
      
      const payload = {
        id: product.id,
        slug: product.slug,
        name: product.name,
        description: product.description,
        price: product.price,
        compareAtPrice: product.compare_at_price,
        image: product.image,
        gallery: product.gallery,
        category: product.category,
        gender: product.gender,
        isNew: product.is_new,
        isBestSeller: product.is_best_seller,
        isTrending: product.is_trending,
        inStock: product.in_stock,
        colors: product.colors,
        colorVariants: product.color_variants,  // Updated with toggled inStock
        features: product.features,
        specs: product.specs,
        rating: product.rating,
        reviewCount: product.review_count,
      };

      console.log(`  Sending to: PUT /api/admin/products/${product.id}`);
      console.log(`  Payload colorVariants: ${JSON.stringify(payload.colorVariants, null, 2)}\n`);

      const response = await fetch(`http://localhost:3001/api/admin/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",  // Include cookies for authentication
      });

      console.log(`  Response status: ${response.status}`);
      const result = await response.json();
      console.log(`  Response body: ${JSON.stringify(result)}\n`);

      if (!response.ok) {
        console.log("❌ API request failed");
        await sql.end();
        return;
      }

      // Step 5: Check database directly
      console.log("🔄 STEP 5: Checking database after update...");
      const updated = await sql`SELECT * FROM products WHERE id = ${product.id}`;
      const updatedProduct = updated[0];
      
      console.log(`  Database check: ${updatedProduct.name}`);
      if (updatedProduct.color_variants && updatedProduct.color_variants.length > 0) {
        const firstVariantAfter = updatedProduct.color_variants[0];
        console.log(`  First variant: ${firstVariantAfter.color || firstVariantAfter.slug}`);
        console.log(`  Database inStock: ${firstVariantAfter.inStock}`);
        console.log(`  Changed: ${firstVariantAfter.inStock !== firstVariantBefore ? "✅ YES" : "❌ NO"}\n`);
      }

      // Step 6: Check via /api/products
      console.log("🌐 STEP 6: Checking via /api/products...");
      const apiResponse = await fetch("http://localhost:3001/api/products");
      const allProducts = await apiResponse.json();
      const apiProduct = allProducts.find(p => p.id === product.id);
      
      if (apiProduct && apiProduct.colorVariants && apiProduct.colorVariants.length > 0) {
        const apiFirstVariant = apiProduct.colorVariants[0];
        console.log(`  API: ${apiFirstVariant.color || apiFirstVariant.slug}`);
        console.log(`  API inStock: ${apiFirstVariant.inStock}`);
        console.log(`  Matches database: ${apiFirstVariant.inStock === (firstVariantAfter?.inStock) ? "✅ YES" : "❌ NO"}\n`);
      }
    }

    console.log("✅ Test complete!");
    await sql.end();
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error.stack);
    await sql.end();
    process.exit(1);
  }
}

test();
