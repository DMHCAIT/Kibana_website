import { readFileSync } from "fs";
import postgres from "postgres";

const env = readFileSync(".env.local", "utf8");
for (const line of env.split("\n")) {
  const [key, ...rest] = line.split("=");
  if (key && rest.length) process.env[key.trim()] = rest.join("=").trim();
}

const sql = postgres(process.env.DATABASE_URL, { ssl: "require", connect_timeout: 10 });

const [row] = await sql`SELECT value FROM site_config WHERE key = 'config'`;
if (!row) { console.log("No config found"); await sql.end(); process.exit(0); }

const config = row.value;

// Update best sellers leftImage to the new image
if (!config.sectionContent) config.sectionContent = {};
if (!config.sectionContent.bestSellers) config.sectionContent.bestSellers = {};
config.sectionContent.bestSellers.leftImage = "/mv/best-seller-B.jpg.jpeg";

await sql`UPDATE site_config SET value = ${JSON.stringify(config)}::jsonb, updated_at = NOW() WHERE key = 'config'`;
console.log("✓ Best sellers leftImage updated to /mv/best-seller-B.jpg.jpeg");
await sql.end();
