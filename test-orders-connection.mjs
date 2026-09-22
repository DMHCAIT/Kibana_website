import postgres from "postgres";

const DATABASE_URL = "postgresql://postgres.opkgstmsfyjzbympczwd:Rubeena%231234@aws-1-ap-south-1.pooler.supabase.com:6543/postgres";

console.log("Testing database connection...\n");

const sql = postgres(DATABASE_URL, {
  prepare: false,
  max: 1,
  ssl: "require",
  connect_timeout: 10,
});

try {
  // Test connection
  console.log("1. Testing basic connection...");
  const result1 = await sql`SELECT 1 as test`;
  console.log("✅ Connection successful:", result1);

  // Test orders table existence
  console.log("\n2. Checking if orders table exists...");
  const result2 = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'orders'
  `;
  console.log("✅ Table check:", result2.length > 0 ? "Orders table exists" : "Orders table NOT found");

  // Count orders
  console.log("\n3. Counting orders...");
  const result3 = await sql`SELECT COUNT(*) as count FROM orders`;
  console.log("✅ Orders count:", result3[0].count);

  // Get first 5 orders
  console.log("\n4. Fetching first 5 orders...");
  const result4 = await sql`SELECT id, status, placed_at FROM orders LIMIT 5`;
  console.log("✅ Orders fetched:", result4.length);
  if (result4.length > 0) {
    console.log("Sample order:", result4[0]);
  }

  console.log("\n✅ All tests passed!");
} catch (error) {
  console.error("❌ Error:", error.message);
} finally {
  await sql.end();
}
