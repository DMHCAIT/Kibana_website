import { config } from "dotenv";
config({ path: ".env.local" });

import postgres from "postgres";

async function deleteGunesWariOrders() {
  console.log("🔍 Finding guneswari's orders...\n");

  const sql = postgres(process.env.DATABASE_URL || "", { ssl: "require", max: 1 });

  try {
    // Fetch all orders
    const allOrders = await sql`
      SELECT id, "user", total, status, placed_at FROM orders ORDER BY placed_at DESC
    `;

    if (!allOrders.length) {
      console.log("❌ No orders found in database\n");
      await sql.end();
      return;
    }

    console.log(`📊 Total orders in database: ${allOrders.length}\n`);

    // Filter orders that belong to guneswari
    const gunesWariOrders = allOrders.filter((order: any) => {
      const user = order.user || {};
      const email = (user.email || "").toLowerCase();
      const name = (user.name || "").toLowerCase();

      return (
        email.includes("guneswari") ||
        name.includes("guneswari") ||
        email.includes("gunesswari") ||
        name.includes("gunesswari")
      );
    });

    if (!gunesWariOrders.length) {
      console.log("✅ No orders found for guneswari\n");
      await sql.end();
      return;
    }

    console.log(`⚠️  Found ${gunesWariOrders.length} order(s) for guneswari:\n`);

    // Display orders before deletion
    gunesWariOrders.forEach((order: any, idx: number) => {
      const user = order.user || {};
      console.log(`  ${idx + 1}. Order ID: ${order.id}`);
      console.log(`     Customer: ${user.name || "N/A"} (${user.email || "N/A"})`);
      console.log(`     Total: ₹${order.total}`);
      console.log(`     Status: ${order.status}`);
      console.log(`     Placed: ${new Date(order.placed_at).toLocaleString()}\n`);
    });

    // Delete each order
    console.log("🗑️  Deleting orders...\n");

    for (const order of gunesWariOrders) {
      await sql`DELETE FROM orders WHERE id = ${order.id}`;
      console.log(`  ✓ Deleted order: ${order.id}`);
    }

    console.log(`\n✅ Successfully deleted ${gunesWariOrders.length} order(s) for guneswari`);
    console.log("   - Removed from admin panel orders");
    console.log("   - Removed from guneswari's account orders\n");

    await sql.end();
  } catch (error) {
    console.error("❌ Error deleting orders:", error);
    await sql.end();
    process.exit(1);
  }
}

deleteGunesWariOrders();
