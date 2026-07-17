#!/usr/bin/env node
import { config } from "dotenv";
config({ path: ".env.local" });

import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL || "", {
  ssl: "require",
  max: 1,
});

console.log("Checking all OTP-related tables...\n");

try {
  const tables = await sql`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name LIKE '%otp%'
    ORDER BY table_name
  `;
  
  console.log(`Found ${tables.length} OTP-related tables:\n`);
  
  for (const table of tables) {
    const tableName = table.table_name;
    console.log(`\n📋 Table: ${tableName}`);
    console.log("─".repeat(50));
    
    const columns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = ${tableName}
      ORDER BY ordinal_position
    `;
    
    columns.forEach((col) => {
      console.log(`  • ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    const count = await sql`SELECT COUNT(*) as count FROM ${sql(tableName)}`;
    console.log(`  📊 Records: ${count[0].count}`);
  }
  
} catch (err) {
  console.error("Error:", err.message);
}

await sql.end();
