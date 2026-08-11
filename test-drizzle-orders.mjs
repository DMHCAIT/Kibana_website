#!/usr/bin/env node
import fs from "fs";
import postgres from "postgres";

// Load .env.local
const envFile = fs.readFileSync(".env.local", "utf-8");
envFile.split("\n").forEach((line) => {
  if (line.trim() && !line.startsWith("#")) {
    const idx = line.indexOf("=");
    if (idx > -1) {
      const key = line.substring(0, idx).trim();
      const value = line.substring(idx + 1).trim();
      if (value) process.env[key] = value;
    }
  }
});

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("❌ DATABASE_URL not found");
  process.exit(1);
}

async function testOrdersQuery() {
  console.log("🔍 Testing Orders Query from Next.js\n");
  
  const sql = postgres(dbUrl, {
    max: 10,
    connect_timeout: 15,
    idle_timeout: 20,
    max_lifetime: 120,
    ssl: "require",
    transform: postgres.camel, // Convert snake_case to camelCase
  });

  try {
    console.log("⏳ Testing raw SQL query...");
    const rawOrders = await sql`SELECT COUNT(*) as count FROM orders`;
    console.log(`✅ Raw query works - ${rawOrders[0].count} orders\n`);

    console.log("⏳ Checking if cache is the issue...");
    const orders = await sql`SELECT id, status, "user", total, placed_at FROM orders LIMIT 5`;
    console.log(`✅ Found ${orders.length} orders in database\n`);
    
    if (orders.length > 0) {
      console.log("📋 Sample orders:");
      orders.forEach((order, i) => {
        console.log(`   ${i + 1}. ${order.id} - ${order.user?.name || "Unknown"} - ₹${order.total} (${order.status})`);
      });
    }

    console.log("\n💡 Analysis:");
    console.log("   ✅ Database connection: WORKING");
    console.log("   ✅ Orders table: ACCESSIBLE");
    console.log("   ✅ Query execution: SUCCESSFUL");
    console.log("   ⚠️  Admin panel should be able to fetch these orders");
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await sql.end();
  }
}

testOrdersQuery();
