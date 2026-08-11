#!/usr/bin/env node

/**
 * This test:
 * 1. Logs in to admin panel (gets admin_token cookie)
 * 2. Fetches a product to edit
 * 3. Modifies the product (toggles inStock on first variant)
 * 4. Sends PUT request to update
 * 5. Verifies the change in database
 * 6. Verifies the change appears via /api/products
 */

import postgres from "postgres";

const ADMIN_EMAIL = "admin@kibanalife.com";
const ADMIN_PASSWORD = "Kibana@2026";  // From .env.local
const sql = postgres(
  "postgresql://postgres.opkgstmsfyjzbympczwd:Rubeena%231234@aws-1-ap-south-1.pooler.supabase.com:6543/postgres",
  { ssl: "require" }
);

async function test() {
  console.log("🔍 Testing Admin Login & Product Update\n");

  try {
    // Step 1: Login to admin panel
    console.log("🔐 STEP 1: Logging in to admin panel...");
    
    const loginResponse = await fetch("http://localhost:3001/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
      credentials: "include",
    });

    console.log(`  Response status: ${loginResponse.status}`);
    
    if (!loginResponse.ok) {
      const error = await loginResponse.json();
      console.log(`  Error: ${JSON.stringify(error)}`);
      console.log("  ❌ Login failed - admin password may be wrong\n");
      await sql.end();
      return;
    }

    const loginResult = await loginResponse.json();
    console.log(`  ${loginResult.message}\n`);

    // Step 2: Get admin cookies from response
    // Note: Node fetch doesn't auto-store cookies, we need to extract and manually send them
    let adminToken = null;
    const setCookieHeaders = loginResponse.headers.getSetCookie ? 
      loginResponse.headers.getSetCookie() : 
      [loginResponse.headers.get("set-cookie")];
    
    console.log(`  Set-Cookie headers found: ${setCookieHeaders.filter(Boolean).length}`);
    
    if (setCookieHeaders && setCookieHeaders[0]) {
      // Extract admin_token from Set-Cookie header
      const cookieMatch = setCookieHeaders[0].match(/admin_token=([^;]+)/);
      if (cookieMatch) {
        adminToken = cookieMatch[1];
        console.log(`  ✅ Extracted admin_token: ${adminToken.substring(0, 20)}...\n`);
      }
    }

    if (!adminToken) {
      console.log("  ❌ Could not extract admin_token from response\n");
      await sql.end();
      return;
    }

    // Step 3: Fetch a product from the database
    console.log("\n📦 STEP 2: Fetching product from database...");
    const products = await sql`SELECT * FROM products LIMIT 1`;
    
    if (products.length === 0) {
      console.log("  ❌ No products in database");
      await sql.end();
      return;
    }

    const product = products[0];
    console.log(`  ✅ Found: ${product.name} (ID: ${product.id})\n`);

    // Step 4: Show current stock status
    console.log("🎨 STEP 3: Current product stock:");
    if (product.color_variants && Array.isArray(product.color_variants)) {
      product.color_variants.forEach((v, i) => {
        console.log(`  [${i}] ${v.color || v.slug}: inStock=${v.inStock}`);
      });
    }

    // Step 5: Toggle first variant
    console.log("\n💾 STEP 4: Toggling stock status...");
    if (product.color_variants && product.color_variants.length > 0) {
      const oldStatus = product.color_variants[0].inStock;
      product.color_variants[0].inStock = !oldStatus;
      
      console.log(`  ${product.color_variants[0].color || product.color_variants[0].slug}`);
      console.log(`    Before: inStock=${oldStatus}`);
      console.log(`    After: inStock=${!oldStatus}\n`);

      // Step 6: Send update request
      console.log("🌐 STEP 5: Sending authenticated PUT request...");
      
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
        colorVariants: product.color_variants,  // With toggled inStock
        features: product.features,
        specs: product.specs,
        rating: product.rating,
        reviewCount: product.review_count,
      };

      const updateResponse = await fetch(`http://localhost:3001/api/admin/products/${product.id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Cookie": `admin_token=${adminToken}`  // Manually send the cookie
        },
        body: JSON.stringify(payload),
      });

      console.log(`  Response status: ${updateResponse.status}`);
      
      if (!updateResponse.ok) {
        const error = await updateResponse.json();
        console.log(`  ❌ Error: ${JSON.stringify(error)}`);
        
        if (updateResponse.status === 401) {
          console.log("  ⚠️ ISSUE: Not authenticated - cookies not being sent");
        }
        
        await sql.end();
        return;
      }

      const updateResult = await updateResponse.json();
      console.log(`  ✅ ${updateResult.message}\n`);

      // Step 7: Verify in database
      console.log("🔄 STEP 6: Checking database for changes...");
      const updated = await sql`SELECT * FROM products WHERE id = ${product.id}`;
      const updatedProduct = updated[0];
      
      if (updatedProduct.color_variants && updatedProduct.color_variants[0]) {
        const firstVariant = updatedProduct.color_variants[0];
        const changed = firstVariant.inStock !== oldStatus;
        console.log(`  ${firstVariant.color || firstVariant.slug}: inStock=${firstVariant.inStock}`);
        console.log(`  Database updated: ${changed ? "✅ YES" : "❌ NO"}\n`);
      }

      // Step 8: Check via API
      console.log("🌐 STEP 7: Checking via /api/products...");
      
      // Add delay to allow cache invalidation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const apiResponse = await fetch("http://localhost:3001/api/products");
      const allProducts = await apiResponse.json();
      const apiProduct = allProducts.find(p => p.id === product.id);
      
      if (apiProduct && apiProduct.colorVariants && apiProduct.colorVariants[0]) {
        const apiFirstVariant = apiProduct.colorVariants[0];
        const matches = apiFirstVariant.inStock === !oldStatus;
        console.log(`  ${apiFirstVariant.color || apiFirstVariant.slug}: inStock=${apiFirstVariant.inStock}`);
        console.log(`  Matches updated database: ${matches ? "✅ YES" : "❌ NO"}\n`);

        if (matches) {
          console.log("✅ SUCCESS: Admin updates are working correctly!");
        } else {
          console.log("❌ ISSUE: API is not showing updated data");
        }
      } else {
        console.log("  ❌ Product not found in API response");
      }
    }

    await sql.end();
  } catch (error) {
    console.error("❌ Error:", error.message);
    await sql.end();
    process.exit(1);
  }
}

test();
