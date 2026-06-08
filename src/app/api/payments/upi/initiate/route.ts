import { NextResponse } from "next/server";
import Razorpay from "razorpay";

interface UPIPaymentRequest {
  amount: number;
  email: string;
  phone: string;
  name: string;
  orderId: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as UPIPaymentRequest;

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
    console.log(`📱 Creating Razorpay UPI Order: ₹${body.amount} (${amountInPaise} paise)`);

    // Create Razorpay order for UPI payment
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `upi_${body.orderId}`,
      notes: {
        customer_name: body.name,
        customer_email: body.email,
        customer_phone: body.phone,
        payment_method: "UPI",
      },
    });

    console.log(`✅ UPI Order created: ${order.id}`);

    // Return order ID and Razorpay key for frontend to open checkout
    return NextResponse.json({
      success: true,
      message: "UPI order created - opening payment page",
      orderId: order.id,
      razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: amountInPaise,
      currency: "INR",
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ UPI Payment Error:", errorMessage);
    return NextResponse.json(
      { success: false, error: `Failed to create UPI payment: ${errorMessage}` },
      { status: 500 }
    );
  }
}
