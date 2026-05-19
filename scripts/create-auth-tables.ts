import { config } from "dotenv";
config({ path: ".env.local" });

import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!, { ssl: "require", max: 1 });

async function main() {
  console.log("Creating auth tables...\n");

  await sql`
    CREATE TABLE IF NOT EXISTS "otp_sessions" (
      "phone"                   text PRIMARY KEY NOT NULL,
      "two_factor_session_id"   text,
      "dev_otp"                 text,
      "expires_at"              timestamptz NOT NULL,
      "created_at"              timestamptz NOT NULL DEFAULT now()
    )
  `;
  console.log("✓ otp_sessions created (or already exists)");

  await sql`
    CREATE TABLE IF NOT EXISTS "user_sessions" (
      "token"       text PRIMARY KEY NOT NULL,
      "user_id"     text NOT NULL,
      "phone"       text NOT NULL,
      "name"        text NOT NULL,
      "expires_at"  timestamptz NOT NULL,
      "created_at"  timestamptz NOT NULL DEFAULT now()
    )
  `;
  console.log("✓ user_sessions created (or already exists)");

  await sql.end();
  console.log("\n✅ Auth tables ready.");
}

main().catch((err) => { console.error(err); process.exit(1); });
