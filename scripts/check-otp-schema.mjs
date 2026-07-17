#!/usr/bin/env node
import { config } from "dotenv";
config({ path: ".env.local" });

import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL || "", {
  ssl: "require",
  max: 1,
});

console.log("Checking email_otp_sessions table schema...\n");

try {
  const result = await sql`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'email_otp_sessions'
    ORDER BY ordinal_position
  `;
  
  console.log("email_otp_sessions columns:");
  result.forEach((col, idx) => {
    console.log(`${idx + 1}. ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
  });
  
  console.log("\n--- Sample data ---");
  const samples = await sql`SELECT * FROM email_otp_sessions LIMIT 3`;
  console.log(JSON.stringify(samples, null, 2));
  
} catch (err) {
  console.error("Error:", err.message);
}

await sql.end();
