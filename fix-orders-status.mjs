import postgres from "postgres";

const DATABASE_URL = "postgresql://postgres.opkgstmsfyjzbympczwd:Rubeena%231234@aws-1-ap-south-1.pooler.supabase.com:6543/postgres";

console.log("Fixing orders status...\n");

const sql = postgres(DATABASE_URL, {
  prepare: false,
  max: 1,
  ssl: "require",
  connect_timeout: 10,
});

try {
  // Check current statuses
  console.log("1. Checking current order statuses...");
  const orders = await sql`SELECT id, status FROM orders`;
  console.log("Current statuses:", orders.map(o => ({ id: o.id, status: o.status })));

  // Update invalid statuses
  console.log("\n2. Updating invalid statuses...");
  const result = await sql`
    UPDATE orders 
    SET status = 'pending' 
    WHERE status NOT IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')
    RETURNING id, status
  `;
  console.log("Updated records:", result);

  // Verify
  console.log("\n3. Verifying updated statuses...");
  const updatedOrders = await sql`SELECT id, status FROM orders`;
  console.log("Updated statuses:", updatedOrders.map(o => ({ id: o.id, status: o.status })));

  console.log("\n✅ All orders status fixed!");
} catch (error) {
  console.error("❌ Error:", error.message);
} finally {
  await sql.end();
}
