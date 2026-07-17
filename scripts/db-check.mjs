import { config } from "dotenv";
config({ path: ".env.local" });

import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL, { ssl: "require", max: 1 });

console.log("\n╔════════════════════════════════════════╗");
console.log("║      DATABASE HEALTH CHECK            ║");
console.log("╚════════════════════════════════════════╝\n");

try {
  const start = Date.now();
  
  // Test 1: Connection
  const result = await sql`SELECT NOW() as time`;
  const time = Date.now() - start;
  
  console.log("✅ DATABASE CONNECTION: WORKING");
  console.log(`   Response time: ${time}ms`);
  console.log(`   Server time: ${result[0].time}\n`);
  
  // Test 2: Count all data
  const tables = await sql`SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'public'`;
  const users = await sql`SELECT COUNT(*) as count FROM users`;
  const products = await sql`SELECT COUNT(*) as count FROM products`;
  const cart = await sql`SELECT COUNT(*) as count FROM user_cart`;
  const wishlist = await sql`SELECT COUNT(*) as count FROM user_wishlist`;
  const orders = await sql`SELECT COUNT(*) as count FROM orders`;
  
  console.log("📊 DATA SUMMARY:");
  console.log(`   Tables: ${tables[0].count}`);
  console.log(`   Users: ${users[0].count}`);
  console.log(`   Products: ${products[0].count}`);
  console.log(`   Cart Items: ${cart[0].count}`);
  console.log(`   Wishlist Items: ${wishlist[0].count}`);
  console.log(`   Orders: ${orders[0].count}\n`);
  
  console.log("🟢 DATABASE STATUS: ALL SYSTEMS OPERATIONAL\n");
  
  await sql.end();
} catch (err) {
  console.error("❌ DATABASE ERROR:", err.message);
  console.error("\nDetails:", err);
  process.exit(1);
}
