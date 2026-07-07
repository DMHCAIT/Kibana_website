import { config } from "dotenv";
config({ path: ".env.local" });

import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!, { ssl: "require", max: 1 });

async function main() {
  console.log("Creating email OTP table...\n");

  await sql`
    CREATE TABLE IF NOT EXISTS "email_otp_sessions" (
      "id"           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "email"        text NOT NULL,
      "otp"          text NOT NULL,
      "expires_at"   timestamptz NOT NULL,
      "created_at"   timestamptz NOT NULL DEFAULT now()
    )
  `;
  console.log("✓ email_otp_sessions created (or already exists)");

  await sql`
    CREATE INDEX IF NOT EXISTS idx_email_otp_email ON "email_otp_sessions"("email")
  `;
  console.log("✓ Index created");

  await sql.end();
  console.log("\n✅ Email OTP table ready.");
}

main().catch((err) => { console.error(err); process.exit(1); });
