import { NextResponse } from "next/server";
import Razorpay from "razorpay";

interface CardPaymentRequest {
  amount: number;
  email: string;
  name: string;
  phone: string;
  orderId: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CardPaymentRequest;

    // Validate configuration
    if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error("❌ Razorpay keys not configured");
      return NextResponse.json(
        { success: false, error: "Payment gateway not configured" },
        { status: 503 }
      );
    }

    if (!body.amount || body.amount < 1) {
      return NextResponse.json(
        { success: false, error: "Invalid amount" },
        { status: 400 }
      );
    }

    // Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const amountInPaise = Math.round(body.amount * 100);
    console.log(`💳 Creating Razorpay Card Order: ₹${body.amount} (${amountInPaise} paise)`);

    // Create Razorpay order for card payment
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `card_${body.orderId}`,
      notes: {
        customer_name: body.name,
        customer_email: body.email,
        customer_phone: body.phone,
        payment_method: "Card",
      },
    });

    console.log(`✅ Card Order created: ${order.id}`);

    // Return order ID and Razorpay key for frontend to open checkout
    return NextResponse.json({
      success: true,
      message: "Card order created - opening payment page",
      orderId: order.id,
      razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: amountInPaise,
      currency: "INR",
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Card Payment Error:", errorMessage);
    return NextResponse.json(
      { success: false, error: `Failed to create card payment order: ${errorMessage}` },
      { status: 500 }
    );
  }
}
