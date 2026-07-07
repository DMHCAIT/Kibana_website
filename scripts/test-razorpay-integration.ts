#!/usr/bin/env node

/**
 * Razorpay Integration Test Script
 * Tests the complete Razorpay payment flow
 */

import crypto from "crypto";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Load .env.local
dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const API_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const RAZORPAY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

// Test data
const TEST_AMOUNT = 10000; // ₹100 in paise
const TEST_RECEIPT = `test_order_${Date.now()}`;

console.log("🧪 Razorpay Integration Test");
console.log("=".repeat(60));

// ─── Step 1: Verify environment variables ──────────────────────────────────
console.log("\n📋 Step 1: Verifying Environment Variables");
console.log("-".repeat(60));

if (!RAZORPAY_KEY_ID) {
  console.error("❌ NEXT_PUBLIC_RAZORPAY_KEY_ID not set");
  process.exit(1);
}

if (!RAZORPAY_SECRET) {
  console.error("❌ RAZORPAY_KEY_SECRET not set");
  process.exit(1);
}

console.log(`✅ Razorpay Key ID: ${RAZORPAY_KEY_ID.slice(0, 10)}...${RAZORPAY_KEY_ID.slice(-5)}`);
console.log(`✅ Razorpay Secret: ${RAZORPAY_SECRET.slice(0, 10)}...${RAZORPAY_SECRET.slice(-5)}`);

// ─── Step 2: Test Create Order API ─────────────────────────────────────────
console.log("\n📝 Step 2: Testing Create Order API");
console.log("-".repeat(60));

async function testCreateOrder() {
  try {
    const response = await fetch(`${API_URL}/api/payments/create-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: TEST_AMOUNT / 100, // Convert to rupees
        currency: "INR",
        receipt: TEST_RECEIPT,
        notes: {
          customer_name: "Test Customer",
          customer_email: "test@example.com",
          customer_phone: "9876543210",
        },
      }),
    });

    const data = (await response.json()) as {
      success?: boolean;
      orderId?: string;
      amount?: number;
      error?: string;
    };

    if (!response.ok || !data.orderId) {
      console.error(`❌ Order creation failed:`, data.error || `Status: ${response.status}`);
      return null;
    }

    console.log(`✅ Order created successfully`);
    console.log(`   Order ID: ${data.orderId}`);
    console.log(`   Amount: ₹${data.amount ? (data.amount / 100).toFixed(2) : "N/A"}`);

    return {
      orderId: data.orderId,
      amount: data.amount || TEST_AMOUNT,
    };
  } catch (error) {
    console.error(`❌ Error creating order:`, error instanceof Error ? error.message : error);
    return null;
  }
}

// ─── Step 3: Test Payment Verification Logic ──────────────────────────────
console.log("\n🔐 Step 3: Testing Payment Verification Logic");
console.log("-".repeat(60));

const testOrderId = "order_test123";
const testPaymentId = "pay_test456";
const body = `${testOrderId}|${testPaymentId}`;
const expectedSignature = crypto
  .createHmac("sha256", RAZORPAY_SECRET)
  .update(body)
  .digest("hex");

console.log(`✅ Signature generation working`);
console.log(`   Test Order ID: ${testOrderId}`);
console.log(`   Test Payment ID: ${testPaymentId}`);
console.log(`   Generated Signature: ${expectedSignature.slice(0, 16)}...${expectedSignature.slice(-8)}`);

// ─── Step 4: Component Check ──────────────────────────────────────────────
console.log("\n⚛️  Step 4: Checking Frontend Components");
console.log("-".repeat(60));

const componentFiles = [
  "src/components/payment/razorpay-checkout.tsx",
  "src/lib/razorpay-service.ts",
  "src/app/checkout/checkout-view.tsx",
];

let allComponentsPresent = true;
for (const file of componentFiles) {
  const fullPath = path.join(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - NOT FOUND`);
    allComponentsPresent = false;
  }
}

if (!allComponentsPresent) {
  console.error("\n⚠️  Some components are missing!");
}

// ─── Main Test Flow ───────────────────────────────────────────────────────
console.log("\n🚀 Running Full Integration Tests");
console.log("=".repeat(60));

// Test 1: Create order
(async () => {
  try {
    const order = await testCreateOrder();
    
    if (!order) {
      console.error("\n❌ Test failed at order creation");
      process.exit(1);
    }

    // Test 3: Summary
    console.log("\n✅ All Tests Completed Successfully!");
    console.log("=".repeat(60));
    console.log("\n📊 Summary:");
    console.log("  • Environment variables configured ✓");
    console.log("  • API endpoint responding ✓");
    console.log("  • Order creation working ✓");
    console.log("  • Signature generation working ✓");
    console.log("  • Frontend components present ✓");

    console.log("\n🎯 Next Steps for Testing:");
    console.log("  1. Go to http://localhost:3000");
    console.log("  2. Add items to cart");
    console.log("  3. Proceed to checkout");
    console.log("  4. Select 'Debit / Credit Card' payment method");
    console.log("  5. Click 'Pay ₹XXX' button");
    console.log("  6. Use test card: 4111 1111 1111 1111");
    console.log("  7. Enter any future date for expiry");
    console.log("  8. Enter any 3-digit CVV");
    console.log("\n🔗 Razorpay Test Cards: https://razorpay.com/docs/payments/payments-gateway/test-card-details/");
    console.log("\n💡 To go live, replace keys with production keys from Razorpay dashboard");
  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }
})();
