import { sendOrderConfirmationEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { email, name, orderId, items, total, paymentMethod, shippingAddress, placedAt } =
      body;

    if (!email || !orderId || !items || !total) {
      return Response.json(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      );
    }

    const success = await sendOrderConfirmationEmail({
      email,
      name,
      orderId,
      items,
      total,
      paymentMethod,
      shippingAddress,
      placedAt,
    });

    if (!success) {
      return Response.json(
        { success: false, error: "Failed to send email" },
        { status: 500 },
      );
    }

    return Response.json({ success: true, message: "Order confirmation email sent" });
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
