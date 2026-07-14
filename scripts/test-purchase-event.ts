/**
 * Test Purchase Event Validation
 * Tests that the purchase event tracking includes all required fields:
 * - value (order total)
 * - currency (INR)
 * - content_type (product)
 * - content_ids (product IDs)
 * - email (customer email - for hashing)
 */

async function testPurchaseEvent() {
  console.log("🧪 Testing Purchase Event Validation\n");

  const testCases = [
    {
      name: "✅ Valid Purchase Event - All fields present",
      data: {
        eventName: "Purchase",
        data: {
          user_id: "user_123",
          email: "test@example.com",
          value: 5000,
          currency: "INR",
          order_id: "ORDER_001",
          num_items: 2,
          content_type: "product",
          content_ids: "product_1,product_2",
          content_name: "Order ORDER_001",
          payment_method: "razorpay",
        },
        timestamp: Math.floor(Date.now() / 1000),
      },
      expectedStatus: 200,
    },
    {
      name: "❌ Missing 'value' field",
      data: {
        eventName: "Purchase",
        data: {
          user_id: "user_123",
          email: "test@example.com",
          // Missing value
          currency: "INR",
          order_id: "ORDER_002",
          num_items: 1,
          content_type: "product",
          content_ids: "product_1",
        },
        timestamp: Math.floor(Date.now() / 1000),
      },
      expectedStatus: 400,
    },
    {
      name: "❌ Missing 'currency' field",
      data: {
        eventName: "Purchase",
        data: {
          user_id: "user_123",
          email: "test@example.com",
          value: 5000,
          // Missing currency
          order_id: "ORDER_003",
          num_items: 1,
          content_type: "product",
          content_ids: "product_1",
        },
        timestamp: Math.floor(Date.now() / 1000),
      },
      expectedStatus: 400,
    },
    {
      name: "❌ Missing 'content_type' field",
      data: {
        eventName: "Purchase",
        data: {
          user_id: "user_123",
          email: "test@example.com",
          value: 5000,
          currency: "INR",
          order_id: "ORDER_004",
          num_items: 1,
          // Missing content_type
          content_ids: "product_1",
        },
        timestamp: Math.floor(Date.now() / 1000),
      },
      expectedStatus: 400,
    },
    {
      name: "❌ Missing 'content_ids' field",
      data: {
        eventName: "Purchase",
        data: {
          user_id: "user_123",
          email: "test@example.com",
          value: 5000,
          currency: "INR",
          order_id: "ORDER_005",
          num_items: 1,
          content_type: "product",
          // Missing content_ids
        },
        timestamp: Math.floor(Date.now() / 1000),
      },
      expectedStatus: 400,
    },
    {
      name: "❌ Empty 'content_ids' field",
      data: {
        eventName: "Purchase",
        data: {
          user_id: "user_123",
          email: "test@example.com",
          value: 5000,
          currency: "INR",
          order_id: "ORDER_006",
          num_items: 1,
          content_type: "product",
          content_ids: "", // Empty string
        },
        timestamp: Math.floor(Date.now() / 1000),
      },
      expectedStatus: 400,
    },
  ];

  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    console.log(`\n📋 Test: ${testCase.name}`);
    console.log(`   Expected Status: ${testCase.expectedStatus}`);

    try {
      const response = await fetch("http://localhost:3001/api/analytics/conversion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testCase.data),
      });

      const responseData = await response.json();
      const status = response.status;

      console.log(`   Actual Status: ${status}`);

      if (status === testCase.expectedStatus) {
        console.log(`   ✅ PASSED`);
        passed++;

        if (status === 200) {
          console.log(`   Response:`, responseData);
        } else {
          console.log(`   Error:`, responseData.error || responseData.message);
        }
      } else {
        console.log(`   ❌ FAILED - Expected ${testCase.expectedStatus}, got ${status}`);
        console.log(`   Response:`, responseData);
        failed++;
      }
    } catch (error) {
      console.log(`   ❌ FAILED - Error:`, error);
      failed++;
    }
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log(`📊 Test Results: ${passed} passed, ${failed} failed`);
  console.log(`${"=".repeat(60)}`);

  if (failed === 0) {
    console.log("✅ All tests passed! Purchase event validation is working correctly.");
  } else {
    console.log(`❌ ${failed} test(s) failed.`);
  }
}

// Run tests
testPurchaseEvent().catch(console.error);
