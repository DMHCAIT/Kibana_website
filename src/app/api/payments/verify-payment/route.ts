import { NextResponse } from "next/server";
import crypto from "crypto";
import Razorpay from "razorpay";

export async function POST(request: Request) {
  try {
    // Validate configuration at runtime
    if (!process.env.RAZORPAY_KEY_SECRET) {
      console.error("❌ Razorpay secret key not configured");
      return NextResponse.json(
        { error: "Payment gateway not configured" },
        { status: 503 }
      );
    }

    // Initialize Razorpay at runtime only
    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature 
    } = await request.json() as {
      razorpay_order_id?: string;
      razorpay_payment_id?: string;
      razorpay_signature?: string;
    };

    // Validate input
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      console.warn("❌ Missing payment verification details");
      return NextResponse.json(
        { error: "Missing payment details" },
        { status: 400 }
      );
    }

    console.log(`🔐 Verifying payment: Order=${razorpay_order_id.slice(-8)}, Payment=${razorpay_payment_id.slice(-8)}`);

    // Verify signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      console.error("❌ Signature verification failed");
      console.error(`Expected: ${expectedSignature}`);
      console.error(`Received: ${razorpay_signature}`);
      return NextResponse.json(
        { error: "Payment signature verification failed" },
        { status: 401 }
      );
    }

    console.log(`✅ Signature verified successfully`);

    // Signature verified - fetch payment details
    let payment;
    try {
      payment = await razorpay.payments.fetch(razorpay_payment_id);
    } catch (err) {
      console.error("❌ Failed to fetch payment details:", err instanceof Error ? err.message : err);
      return NextResponse.json(
        { error: "Failed to fetch payment details" },
        { status: 500 }
      );
    }

    console.log(`✅ Payment verified: Status=${payment.status}, Amount=${payment.amount}`);

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      method: payment.method,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Error verifying payment:", errorMessage);
    
    return NextResponse.json(
      { error: "Payment verification failed: " + errorMessage },
      { status: 500 }
    );
  }
}
