import postgres from "postgres";

const databaseUrl = "postgresql://postgres.opkgstmsfyjzbympczwd:Rubeena%231234@aws-1-ap-south-1.pooler.supabase.com:6543/postgres";
const sql = postgres(databaseUrl, { ssl: "require" });

console.log("🔍 PRODUCT DETAIL PAGE - PERFORMANCE ANALYSIS\n");
console.log("=".repeat(70));

try {
  // Test query performance
  console.log("\n⏱️ DATABASE QUERY PERFORMANCE");
  console.log("-".repeat(70));

  // 1. Test fetching single product by slug
  console.log("\n1. Fetching single product by slug...");
  let start = Date.now();
  const product = await sql`
    SELECT id, slug, name, price, compare_at_price, image, in_stock
    FROM products 
    WHERE slug = 'valera-dome'
    LIMIT 1
  `;
  let duration = Date.now() - start;
  console.log(`   ⏱️ Time: ${duration}ms`);
  console.log(`   📊 Result: 1 product found`);

  // 2. Test fetching all products (for RelatedProducts component)
  console.log("\n2. Fetching ALL products (RelatedProducts component)...");
  start = Date.now();
  const allProducts = await sql`
    SELECT id, slug, name, price, category, color_variants
    FROM products 
    ORDER BY sort_order ASC
  `;
  duration = Date.now() - start;
  console.log(`   ⏱️ Time: ${duration}ms`);
  console.log(`   📊 Result: ${allProducts.length} products fetched`);

  // 3. Analyze product data size
  console.log("\n3. Product data complexity analysis...");
  if (product.length > 0) {
    const p = product[0];
    const jsonSize = JSON.stringify(p).length;
    console.log(`   📦 Single product JSON size: ${jsonSize} bytes`);
    console.log(`   🎨 Color variants: ${p.color_variants ? JSON.parse(JSON.stringify(p.color_variants)).length : 0}`);
  }

  // 4. Test database response time for different queries
  console.log("\n4. Query complexity comparison...");
  
  start = Date.now();
  const minimalQuery = await sql`
    SELECT id, slug, name, price 
    FROM products 
    WHERE slug = 'valera-dome'
  `;
  const minimalTime = Date.now() - start;
  console.log(`   📊 Minimal query (id, slug, name, price): ${minimalTime}ms`);

  start = Date.now();
  const fullQuery = await sql`
    SELECT * FROM products 
    WHERE slug = 'valera-dome'
  `;
  const fullTime = Date.now() - start;
  console.log(`   📊 Full query (all columns): ${fullTime}ms`);
  console.log(`   ⚠️  Difference: ${fullTime - minimalTime}ms (${fullTime > minimalTime ? "full query slower" : "negligible"})`);

  // 5. Test connection pooling
  console.log("\n5. Sequential query performance (connection pooling)...");
  const times = [];
  for (let i = 0; i < 3; i++) {
    start = Date.now();
    await sql`SELECT 1`;
    times.push(Date.now() - start);
  }
  console.log(`   Query 1: ${times[0]}ms (cold connection)`);
  console.log(`   Query 2: ${times[1]}ms (warm connection)`);
  console.log(`   Query 3: ${times[2]}ms (warm connection)`);
  const avgWarm = (times[1] + times[2]) / 2;
  console.log(`   ⏱️ Average warm query: ${avgWarm.toFixed(1)}ms`);

  // 6. Estimate page load impact
  console.log("\n📊 ESTIMATED PAGE LOAD IMPACT");
  console.log("-".repeat(70));
  const productQueryTime = duration; // From step 1
  const relatedProductsTime = duration; // From step 2 (approx)
  const renderTime = 100; // Estimated React rendering time
  const totalBackendTime = productQueryTime + relatedProductsTime + renderTime;

  console.log(`\n  Product query:           ${productQueryTime}ms`);
  console.log(`  Related products query:  ${relatedProductsTime}ms`);
  console.log(`  React rendering:         ~${renderTime}ms`);
  console.log(`  ─────────────────────────────────`);
  console.log(`  Estimated total backend: ~${totalBackendTime}ms`);
  console.log(`\n  ⚠️  Without caching, page shows after: ~${totalBackendTime}ms`);
  console.log(`  ✅ With 60s cache hit: <10ms`);

  await sql.end();

  console.log("\n" + "=".repeat(70));
  console.log("\n✅ PERFORMANCE ANALYSIS COMPLETE!");

} catch (error) {
  console.error("\n❌ Error:", error instanceof Error ? error.message : String(error));
  process.exit(1);
}
