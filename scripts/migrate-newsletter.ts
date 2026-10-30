import { config } from "dotenv";
config({ path: ".env.local" });

import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to create the newsletter subscribers table.");
}

const sql = postgres(databaseUrl, { ssl: "require", max: 1 });

async function main() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS "newsletter_subscribers" (
        "email" text PRIMARY KEY NOT NULL,
        "subscribed_at" timestamptz NOT NULL DEFAULT now()
      )
    `;
    console.log("Newsletter subscribers table is ready.");
  } finally {
    await sql.end();
  }
}

main().catch((error) => {
  console.error("Failed to create newsletter subscribers table:", error);
  process.exitCode = 1;
});
