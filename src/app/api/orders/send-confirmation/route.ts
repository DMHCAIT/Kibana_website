import { sendOrderConfirmationEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      email,
      name,
      orderId,
      items,
      subtotal,
      shipping,
      codCharges,
      firstOrderDiscount,
      onlinePaymentDiscount,
      total,
      paymentMethod,
      shippingAddress,
      placedAt,
    } = body;

    if (
      !email ||
      !orderId ||
      !Array.isArray(items) ||
      !Number.isFinite(subtotal) ||
      !Number.isFinite(shipping) ||
      !Number.isFinite(codCharges) ||
      !Number.isFinite(firstOrderDiscount) ||
      !Number.isFinite(onlinePaymentDiscount) ||
      !Number.isFinite(total)
    ) {
      return Response.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const success = await sendOrderConfirmationEmail({
      email,
      name,
      orderId,
      items,
      subtotal,
      shipping,
      codCharges,
      firstOrderDiscount,
      onlinePaymentDiscount,
      total,
      paymentMethod,
      shippingAddress,
      placedAt,
    });

    if (!success) {
      return Response.json({ success: false, error: "Failed to send email" }, { status: 500 });
    }

    return Response.json({ success: true, message: "Order confirmation email sent" });
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
    return Response.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
