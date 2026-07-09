#!/usr/bin/env node

/**
 * Sync the local site-config.json to Supabase
 * Usage: node scripts/sync-site-config.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.join(__dirname, "../src/data/site-config.json");

async function syncConfig() {
  try {
    // Read the local config
    const configContent = fs.readFileSync(configPath, "utf-8");
    const config = JSON.parse(configContent);

    console.log("📋 Local config loaded");
    console.log("🔄 Syncing to Supabase...");

    // Call the API to save the config
    const response = await fetch("http://localhost:3000/api/admin/site-config", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: "admin_token=authenticated", // This will need the actual token in production
      },
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("❌ Failed to sync:", error);
      process.exit(1);
    }

    const result = await response.json();
    console.log("✅ Site config synced to Supabase successfully!");
    if (config.sectionProducts?.["new-arrivals"]) {
      console.log("📝 New Arrivals products:", config.sectionProducts["new-arrivals"]);
    }
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

syncConfig();
