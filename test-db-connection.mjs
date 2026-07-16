import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;

console.log("🔍 Testing Database Connection...\n");
console.log("DATABASE_URL:", databaseUrl ? "✓ Set" : "✗ Not set");

if (!databaseUrl) {
  console.error("❌ DATABASE_URL environment variable is not set");
  process.exit(1);
}

try {
  const sql = postgres(databaseUrl, {
    connect_timeout: 5,
    ssl: "require",
  });

  console.log("⏳ Attempting to connect to Supabase...\n");

  // Test query
  const result = await sql`SELECT NOW() as current_time, version() as version;`;
  
  console.log("✅ CONNECTION SUCCESSFUL!\n");
  console.log("Database Info:");
  console.log("  Current Time:", result[0].current_time);
  console.log("  PostgreSQL:", result[0].version?.split(",")[0] || "Unknown");

  // Check tables
  console.log("\n📊 Checking tables...\n");
  const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `;

  if (tables.length === 0) {
    console.log("⚠️  No tables found. Database may be empty.");
  } else {
    console.log("Found tables:");
    tables.forEach((t) => console.log(`  • ${t.table_name}`));
  }

  await sql.end();
  console.log("\n✅ All checks passed!");

} catch (error) {
  console.error("❌ CONNECTION FAILED!");
  console.error("Error:", error.message);
  console.error("\nFull Error:", error);
  process.exit(1);
}
