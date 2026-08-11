#!/usr/bin/env node
import fs from "fs";

// Load .env.local
const envFile = fs.readFileSync(".env.local", "utf-8");
envFile.split("\n").forEach((line) => {
  if (line.trim() && !line.startsWith("#")) {
    const idx = line.indexOf("=");
    if (idx > -1) {
      const key = line.substring(0, idx).trim();
      const value = line.substring(idx + 1).trim();
      if (value) process.env[key] = value;
    }
  }
});

async function testAdminOrders() {
  console.log("🔍 Testing Admin Orders Functionality\n");
  
  const baseUrl = "http://localhost:3001";
  
  try {
    // Test 1: Check if admin page exists
    console.log("1️⃣  Testing admin orders page...");
    const pageResponse = await fetch(`${baseUrl}/admin/orders`);
    console.log(`   Status: ${pageResponse.status}`);
    if (pageResponse.status === 302 || pageResponse.status === 401 || pageResponse.status === 403) {
      console.log("   ⚠️  Requires authentication (expected)");
    } else if (pageResponse.status === 200) {
      const html = await pageResponse.text();
      if (html.includes("orders")) {
        console.log("   ✅ Admin orders page loads\n");
      }
    }

    // Test 2: Check API endpoint
    console.log("2️⃣  Testing /api/admin/orders endpoint...");
    const apiResponse = await fetch(`${baseUrl}/api/admin/orders`);
    console.log(`   Status: ${apiResponse.status}`);
    
    if (apiResponse.status === 401) {
      console.log("   ⚠️  401 Unauthorized (need admin_token cookie)");
      console.log("   This is expected - admin endpoints need authentication\n");
    } else if (apiResponse.status === 200) {
      const data = await apiResponse.json();
      console.log(`   ✅ Got response: ${Array.isArray(data) ? data.length : 'unknown'} orders\n`);
    } else {
      console.log(`   ❌ Unexpected status\n`);
    }

    // Test 3: Check if dev server is running
    console.log("3️⃣  Testing dev server health...");
    const healthResponse = await fetch(`${baseUrl}/api/health`);
    if (healthResponse.status === 200 || healthResponse.status === 503) {
      const health = await healthResponse.json();
      console.log(`   ✅ Dev server running`);
      console.log(`   Database status: ${health.database ? "✅ Connected" : "❌ Down"}\n`);
    } else {
      console.log(`   ⚠️  Server may not be running (status: ${healthResponse.status})\n`);
    }

  } catch (error) {
    console.error("❌ Error:", error.message);
    console.log("\n💡 Make sure the dev server is running:");
    console.log("   npm run dev");
  }
}

testAdminOrders();
