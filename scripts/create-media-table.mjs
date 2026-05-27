import postgres from "postgres";
import { readFileSync } from "fs";

// Load .env.local manually
const env = readFileSync(".env.local", "utf8");
for (const line of env.split("\n")) {
  const [key, ...rest] = line.split("=");
  if (key && rest.length) process.env[key.trim()] = rest.join("=").trim();
}

const sql = postgres(process.env.DATABASE_URL, { ssl: "require", connect_timeout: 10 });

try {
  await sql`
    CREATE TABLE IF NOT EXISTS media_files (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      url         TEXT NOT NULL,
      bucket      TEXT NOT NULL,
      path        TEXT NOT NULL,
      type        TEXT NOT NULL DEFAULT 'image',
      size        INTEGER NOT NULL DEFAULT 0,
      uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  console.log("✓ media_files table created (or already exists)");

  // Index on url for fast lookup during DELETE by URL
  await sql`
    CREATE INDEX IF NOT EXISTS media_files_url_idx ON media_files (url)
  `;
  console.log("✓ media_files_url_idx index created (or already exists)");

  // Index on path for fast lookup during product folder cleanup
  await sql`
    CREATE INDEX IF NOT EXISTS media_files_path_idx ON media_files (path)
  `;
  console.log("✓ media_files_path_idx index created (or already exists)");
} catch (e) {
  console.error("Error:", e.message);
  process.exit(1);
} finally {
  await sql.end();
}
