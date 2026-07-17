#!/usr/bin/env node
import { config } from "dotenv";
config({ path: ".env.local" });

const baseUrl = "http://localhost:3000";

async function testAuthFlow() {
  console.log("╔════════════════════════════════════════════════════════════════╗");
  console.log("║              AUTHENTICATION FLOW TEST                          ║");
  console.log("╚════════════════════════════════════════════════════════════════╝\n");

  const testEmail = `test${Date.now()}@example.com`;
  const testName = "Test User";
  const testPhone = "9876543210";
  let testOtp = null;

  // Step 1: Send OTP for signup
  console.log("1️⃣ STEP 1: SEND OTP (SIGNUP)");
  console.log("─".repeat(60));
  console.log(`Email: ${testEmail}`);
  console.log(`Name: ${testName}`);
  console.log(`Phone: ${testPhone}\n`);

  try {
    const response = await fetch(`${baseUrl}/api/auth/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        type: "signup",
        name: testName,
      }),
    });

    const data = await response.json();
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, data);

    if (!response.ok) {
      console.error("❌ Failed to send OTP");
      return;
    }

    console.log("✅ OTP sent successfully\n");
  } catch (err) {
    console.error("❌ Error:", err.message);
    return;
  }

  // Step 2: Get OTP from dev endpoint
  console.log("2️⃣ STEP 2: RETRIEVE OTP (DEV)");
  console.log("─".repeat(60));

  try {
    const response = await fetch(`${baseUrl}/api/auth/dev-get-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail }),
    });

    const data = await response.json();

    if (response.ok && data.otp) {
      testOtp = data.otp;
      console.log(`✅ OTP retrieved: ${testOtp}\n`);
    } else {
      console.error("❌ Failed to retrieve OTP");
      console.log("Response:", data);
      return;
    }
  } catch (err) {
    console.error("❌ Error:", err.message);
    return;
  }

  // Step 3: Verify OTP
  console.log("3️⃣ STEP 3: VERIFY OTP");
  console.log("─".repeat(60));
  console.log(`OTP to verify: ${testOtp}\n`);

  try {
    const response = await fetch(`${baseUrl}/api/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        otp: testOtp,
        signupData: {
          name: testName,
          phone: testPhone,
        },
      }),
    });

    const data = await response.json();
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, data);

    if (!response.ok) {
      console.error("❌ Failed to verify OTP");
      return;
    }

    console.log("✅ OTP verified successfully\n");
  } catch (err) {
    console.error("❌ Error:", err.message);
    return;
  }

  // Step 4: Test login OTP
  console.log("4️⃣ STEP 4: TEST LOGIN OTP");
  console.log("─".repeat(60));
  console.log(`Email: ${testEmail}\n`);

  try {
    const response = await fetch(`${baseUrl}/api/auth/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        type: "login",
      }),
    });

    const data = await response.json();
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, data);

    if (!response.ok) {
      console.error("❌ Failed to send login OTP");
      return;
    }

    console.log("✅ Login OTP sent successfully\n");
  } catch (err) {
    console.error("❌ Error:", err.message);
    return;
  }

  // Step 5: Get login OTP
  console.log("5️⃣ STEP 5: RETRIEVE LOGIN OTP");
  console.log("─".repeat(60));

  try {
    const response = await fetch(`${baseUrl}/api/auth/dev-get-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail }),
    });

    const data = await response.json();

    if (response.ok && data.otp) {
      testOtp = data.otp;
      console.log(`✅ Login OTP retrieved: ${testOtp}\n`);
    } else {
      console.error("❌ Failed to retrieve login OTP");
      console.log("Response:", data);
      return;
    }
  } catch (err) {
    console.error("❌ Error:", err.message);
    return;
  }

  // Step 6: Verify login OTP
  console.log("6️⃣ STEP 6: VERIFY LOGIN OTP");
  console.log("─".repeat(60));
  console.log(`OTP to verify: ${testOtp}\n`);

  try {
    const response = await fetch(`${baseUrl}/api/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        otp: testOtp,
      }),
    });

    const data = await response.json();
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, data);

    if (!response.ok) {
      console.error("❌ Failed to verify login OTP");
      return;
    }

    console.log("✅ Login OTP verified successfully\n");
  } catch (err) {
    console.error("❌ Error:", err.message);
    return;
  }

  // Summary
  console.log("7️⃣ TEST SUMMARY");
  console.log("─".repeat(60));
  console.log("✅ Send signup OTP: PASSED");
  console.log("✅ Retrieve signup OTP: PASSED");
  console.log("✅ Verify signup OTP: PASSED");
  console.log("✅ Send login OTP: PASSED");
  console.log("✅ Retrieve login OTP: PASSED");
  console.log("✅ Verify login OTP: PASSED");
  console.log("\n🟢 COMPLETE AUTHENTICATION FLOW VERIFIED!\n");
}

testAuthFlow();
