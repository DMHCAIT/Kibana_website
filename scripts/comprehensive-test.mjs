#!/usr/bin/env node

console.log("╔════════════════════════════════════════════════════════════════╗");
console.log("║          COMPREHENSIVE SYSTEM VERIFICATION                    ║");
console.log("╚════════════════════════════════════════════════════════════════╝\n");

const baseUrl = "http://localhost:3000";
let testsPassed = 0;
let testsFailed = 0;

async function test(name, fn) {
  try {
    await fn();
    console.log(`✅ ${name}`);
    testsPassed++;
  } catch (error) {
    console.log(`❌ ${name}`);
    console.log(`   Error: ${error.message}`);
    testsFailed++;
  }
}

// Test 1: Homepage
await test("Homepage loads", async () => {
  const res = await fetch(`${baseUrl}/`);
  if (res.status !== 200) throw new Error(`Status ${res.status}`);
});

// Test 2: Send OTP
let testOtp = null;
await test("Send OTP API", async () => {
  const res = await fetch(`${baseUrl}/api/auth/send-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: `user${Date.now()}@test.com`,
      type: "signup",
      name: "Test User",
    }),
  });
  if (res.status !== 200) throw new Error(`Status ${res.status}`);
  const data = await res.json();
  if (!data.success) throw new Error("Not successful");
  testOtp = data;
});

// Test 3: Get OTP (dev)
await test("Get OTP (dev endpoint)", async () => {
  const email = `user${Date.now()}@test.com`;
  
  // First send OTP
  await fetch(`${baseUrl}/api/auth/send-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      type: "signup",
      name: "Test User",
    }),
  });
  
  // Then retrieve it
  const res = await fetch(`${baseUrl}/api/auth/dev-get-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (res.status !== 200) throw new Error(`Status ${res.status}`);
  const data = await res.json();
  if (!data.otp) throw new Error("No OTP returned");
});

// Test 4: Verify OTP
await test("Verify OTP API", async () => {
  const email = `verify${Date.now()}@test.com`;
  
  // Send OTP
  await fetch(`${baseUrl}/api/auth/send-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      type: "signup",
      name: "Test User",
    }),
  });
  
  // Get OTP
  const getRes = await fetch(`${baseUrl}/api/auth/dev-get-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const { otp } = await getRes.json();
  
  // Verify OTP
  const verifyRes = await fetch(`${baseUrl}/api/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      otp,
      signupData: { name: "Test User", phone: "9876543210" },
    }),
  });
  if (verifyRes.status !== 200) throw new Error(`Status ${verifyRes.status}`);
  const data = await verifyRes.json();
  if (!data.success) throw new Error("Verification failed");
});

// Test 5: Check Email
await test("Check Email API", async () => {
  const res = await fetch(`${baseUrl}/api/auth/check-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "test@example.com" }),
  });
  if (res.status !== 200) throw new Error(`Status ${res.status}`);
});

// Test 6: Products API
await test("Products API", async () => {
  const res = await fetch(`${baseUrl}/api/products`);
  if (res.status !== 200) throw new Error(`Status ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) throw new Error("No products");
});

// Test 7: Cart API
await test("Cart API", async () => {
  const res = await fetch(`${baseUrl}/api/cart`);
  if (res.status !== 200 && res.status !== 401) throw new Error(`Status ${res.status}`);
});

// Test 8: Wishlist API
await test("Wishlist API", async () => {
  const res = await fetch(`${baseUrl}/api/wishlist`);
  if (res.status !== 200 && res.status !== 401) throw new Error(`Status ${res.status}`);
});

// Test 9: Shop page
await test("Shop page loads", async () => {
  const res = await fetch(`${baseUrl}/shop`);
  if (res.status !== 200) throw new Error(`Status ${res.status}`);
});

// Test 10: About page
await test("About page loads", async () => {
  const res = await fetch(`${baseUrl}/about`);
  if (res.status !== 200) throw new Error(`Status ${res.status}`);
});

// Test 11: FAQs page
await test("FAQs page loads", async () => {
  const res = await fetch(`${baseUrl}/faqs`);
  if (res.status !== 200) throw new Error(`Status ${res.status}`);
});

// Test 12: Contact page
await test("Contact page loads", async () => {
  const res = await fetch(`${baseUrl}/contact`);
  if (res.status !== 200) throw new Error(`Status ${res.status}`);
});

// Test 13: Admin login page
await test("Admin panel loads", async () => {
  const res = await fetch(`${baseUrl}/admin/login`);
  if (res.status !== 200) throw new Error(`Status ${res.status}`);
});

// Test 14: Order confirmation email
await test("Order confirmation email API", async () => {
  const res = await fetch(`${baseUrl}/api/orders/send-confirmation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "test@example.com",
      name: "Test User",
      orderId: "TEST123",
      items: [{ name: "Test Item", price: 100, quantity: 1 }],
      total: 100,
      paymentMethod: "card",
      shippingAddress: "Test Address",
      placedAt: new Date().toISOString(),
    }),
  });
  if (res.status !== 200) throw new Error(`Status ${res.status}`);
});

// Summary
console.log("\n" + "─".repeat(60));
console.log("📊 TEST SUMMARY");
console.log("─".repeat(60));
console.log(`✅ Passed: ${testsPassed}`);
console.log(`❌ Failed: ${testsFailed}`);

if (testsFailed === 0) {
  console.log("\n🟢 ALL TESTS PASSED! SYSTEM IS FULLY OPERATIONAL!\n");
  process.exit(0);
} else {
  console.log("\n🔴 SOME TESTS FAILED. CHECK ERRORS ABOVE.\n");
  process.exit(1);
}
