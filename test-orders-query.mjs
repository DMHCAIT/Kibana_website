#!/usr/bin/env node
import fs from "fs";
import postgres from "postgres";

// Load .env.local properly
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
  console.error("❌ DATABASE_URL not found in .env.local");
  process.exit(1);
}

const sql = postgres(dbUrl, {
  max: 10,
  connect_timeout: 15,
  idle_timeout: 20,
  max_lifetime: 120,
  ssl: "require",
  transform: postgres.camel,
});

async function testOrders() {
  console.log("🔍 Testing Orders Query\n");
  const dbUrl = process.env.DATABASE_URL;
  console.log(`📍 Database URL: ${dbUrl?.substring(0, 50)}...`);
  
  try {
    console.log("\n⏳ Connecting to database...");
    const result = await sql`SELECT NOW()`;
    console.log("✅ Database connection successful");
    console.log(`   Server time: ${result[0].now}\n`);

    console.log("📦 Querying orders table...");
    const orders = await sql`SELECT * FROM orders`;
    console.log(`✅ Query successful - Found ${orders.length} orders\n`);

    if (orders.length > 0) {
      console.log("📋 Sample orders:");
      orders.slice(0, 3).forEach((order, i) => {
        console.log(`\n   Order ${i + 1}:`);
        console.log(`     ID: ${order.id}`);
        console.log(`     User: ${order.user?.name || "N/A"}`);
        console.log(`     Total: ₹${order.total}`);
        console.log(`     Status: ${order.status}`);
        console.log(`     Items: ${order.items?.length || 0}`);
      });
    } else {
      console.log("   ⚠️  No orders found in database");
    }

    console.log("\n✅ Test completed successfully");
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    if (error.code === "ECONNREFUSED") {
      console.error("   Cannot connect to database. Check DATABASE_URL.");
    } else if (error.code === "42P01") {
      console.error("   'orders' table does not exist.");
    }
  } finally {
    await sql.end();
  }
}

testOrders();
