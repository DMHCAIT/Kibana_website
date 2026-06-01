import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(request: Request) {
  try {
    // Validate configuration at runtime
    if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error("❌ Razorpay keys not configured");
      return NextResponse.json(
        { error: "Payment gateway not configured. Please contact support." },
        { status: 503 }
      );
    }

    // Initialize Razorpay at runtime only
    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const { amount, currency, receipt, notes } = await request.json() as {
      amount: number;
      currency?: string;
      receipt?: string;
      notes?: Record<string, string>;
    };

    // Validate amount
    if (!amount || amount <= 0) {
      console.warn("❌ Invalid amount provided:", amount);
      return NextResponse.json(
        { error: "Invalid amount. Must be greater than 0." },
        { status: 400 }
      );
    }

    // Validate amount is reasonable (min 1 rupee, max 100,000 rupees)
    if (amount < 1 || amount > 100000) {
      console.warn("❌ Amount out of range:", amount);
      return NextResponse.json(
        { error: "Amount must be between ₹1 and ₹100,000" },
        { status: 400 }
      );
    }

    const amountInPaise = Math.round(amount * 100);
    console.log(`💰 Creating Razorpay order: ₹${amount} (${amountInPaise} paise)`);

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: currency || "INR",
      receipt: receipt || `order_${Date.now()}`,
      notes: notes || {},
    });

    console.log(`✅ Order created: ${order.id}`);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Error creating Razorpay order:", errorMessage);
    
    // Check for authentication errors
    if (errorMessage.includes("Authentication") || errorMessage.includes("401")) {
      return NextResponse.json(
        { error: "Payment gateway authentication failed. Check your API keys." },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to create order: " + errorMessage },
      { status: 500 }
    );
  }
}
