import { config } from "dotenv";
config({ path: ".env.local" });

import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!, { ssl: "require", max: 1 });

async function main() {
  console.log("Migrating users table for email-based auth...\n");

  // Make phone nullable (previously NOT NULL)
  await sql`ALTER TABLE users ALTER COLUMN phone DROP NOT NULL`;
  console.log("✓ users.phone is now nullable");

  // Add unique index on email (only for non-null values — partial index)
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique
    ON users (email)
    WHERE email IS NOT NULL
  `;
  console.log("✓ Unique index on users.email created");

  await sql.end();
  console.log("\n✅ Migration complete.");
}

main().catch((err) => { console.error(err); process.exit(1); });
