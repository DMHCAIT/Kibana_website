#!/usr/bin/env node
import { config } from "dotenv";
config({ path: ".env.local" });

import postgres from "postgres";

console.log("╔════════════════════════════════════════════════════════════════╗");
console.log("║           DATABASE CONNECTION DIAGNOSIS                       ║");
console.log("╚════════════════════════════════════════════════════════════════╝\n");

// Test 1: Check environment variables
console.log("1️⃣ CHECKING DATABASE CREDENTIALS");
console.log("─".repeat(60));

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("❌ DATABASE_URL not set");
  process.exit(1);
}

console.log("✅ DATABASE_URL set");

// Parse the URL
try {
  const url = new URL(dbUrl);
  console.log(`📍 Host: ${url.hostname}`);
  console.log(`📍 Port: ${url.port}`);
  console.log(`📍 Database: ${url.pathname.split("/").pop()}`);
  console.log(`📍 User: ${url.username}`);
  console.log(`📍 SSL: Yes (required)\n`);
} catch (err) {
  console.error("❌ Invalid DATABASE_URL format:", err.message);
  process.exit(1);
}

// Test 2: Try to connect
console.log("2️⃣ TESTING CONNECTION");
console.log("─".repeat(60));

let sql;
try {
  sql = postgres(dbUrl, {
    ssl: "require",
    max: 1,
  });
  console.log("✅ Postgres client created\n");
} catch (err) {
  console.error("❌ Failed to create postgres client:", err.message);
  process.exit(1);
}

// Test 3: Execute a simple query
console.log("3️⃣ TESTING QUERY EXECUTION");
console.log("─".repeat(60));

try {
  const start = Date.now();
  const result = await sql`SELECT NOW() as current_time`;
  const duration = Date.now() - start;
  
  console.log(`✅ Query successful (${duration}ms)`);
  console.log(`📍 Server time: ${result[0].current_time}\n`);
} catch (err) {
  console.error("❌ Query failed:", err.message);
  console.error("Error details:", {
    code: err.code,
    severity: err.severity_local,
  });
  process.exit(1);
}

// Test 4: Check tables
console.log("4️⃣ CHECKING TABLES");
console.log("─".repeat(60));

try {
  const tables = await sql`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name
  `;
  
  if (tables.length === 0) {
    console.warn("⚠️ No tables found in public schema");
  } else {
    console.log(`✅ Found ${tables.length} tables:`);
    tables.forEach((t) => {
      console.log(`   • ${t.table_name}`);
    });
  }
  console.log();
} catch (err) {
  console.error("❌ Failed to list tables:", err.message);
}

// Test 5: Check specific tables
console.log("5️⃣ CHECKING KEY TABLES");
console.log("─".repeat(60));

const keyTables = ["users", "products", "user_cart", "orders"];

for (const table of keyTables) {
  try {
    const result = await sql`SELECT COUNT(*) as count FROM ${sql(table)}`;
    console.log(`✅ ${table}: ${result[0].count} records`);
  } catch (err) {
    console.log(`❌ ${table}: ${err.message.split("\n")[0]}`);
  }
}

console.log("\n6️⃣ CONNECTION STATUS");
console.log("─".repeat(60));
console.log("🟢 DATABASE CONNECTION IS WORKING PROPERLY!\n");

await sql.end();
process.exit(0);
