import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

const env = readFileSync(".env.local", "utf8");
for (const line of env.split("\n")) {
  const [key, ...rest] = line.split("=");
  if (key && rest.length) process.env[key.trim()] = rest.join("=").trim();
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

// Fetch current config
const { data, error } = await supabase
  .from("site_config")
  .select("value")
  .eq("key", "config")
  .single();

if (error) { console.error("Fetch error:", error.message); process.exit(1); }

const config = data.value;

// Update leftImage for best sellers
if (!config.sectionContent) config.sectionContent = {};
if (!config.sectionContent.bestSellers) config.sectionContent.bestSellers = {};
const oldVal = config.sectionContent.bestSellers.leftImage;
config.sectionContent.bestSellers.leftImage = "/mv/best-seller-B.jpg.jpeg";

const { error: updateError } = await supabase
  .from("site_config")
  .update({ value: config, updated_at: new Date().toISOString() })
  .eq("key", "config");

if (updateError) { console.error("Update error:", updateError.message); process.exit(1); }

console.log(`✓ Updated: "${oldVal}" → "/mv/best-seller-B.jpg.jpeg"`);
