import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { orders as ordersTable, users as usersTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("kibana-user-id")?.value;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json() as { orderId: string };
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    // Get user info
    const userRecord = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (!userRecord.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userEmail = userRecord[0].email;

    // Get the order
    const orderRecord = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.id, orderId))
      .limit(1);

    if (!orderRecord.length) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const order = orderRecord[0];

    // Verify the order belongs to the user
    if (order.user?.id !== userId && order.user?.email !== userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Check if order can be cancelled (only pending and processing orders can be cancelled)
    if (order.status !== "pending" && order.status !== "processing") {
      return NextResponse.json(
        { error: `Cannot cancel order with status: ${order.status}` },
        { status: 400 }
      );
    }

    // Update order status to cancelled
    await db
      .update(ordersTable)
      .set({ status: "cancelled" })
      .where(eq(ordersTable.id, orderId));

    // Invalidate cache if available
    try {
      await fetch(new URL("/api/cache-invalidate", req.url), {
        method: "POST",
        body: JSON.stringify({ key: "orders" }),
      }).catch(() => {
        // Non-fatal
      });
    } catch {
      // Non-fatal
    }

    return NextResponse.json({
      success: true,
      message: "Order cancelled successfully",
      orderId,
    });
  } catch (error) {
    console.error("Cancel order error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to cancel order" },
      { status: 500 }
    );
  }
}
