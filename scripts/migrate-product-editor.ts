import { config } from "dotenv";
import postgres from "postgres";

config({ path: ".env.local" });

async function migrate() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");
  const client = postgres(process.env.DATABASE_URL, {
    prepare: false,
    max: 1,
    connect_timeout: 10,
  });
  try {
    await client`ALTER TABLE products ADD COLUMN IF NOT EXISTS shipping_returns TEXT`;
    console.log("Product editor migration complete: shipping_returns is available.");
  } finally {
    await client.end();
  }
}

migrate().catch((error) => {
  console.error("Product editor migration failed:", error);
  process.exitCode = 1;
});
