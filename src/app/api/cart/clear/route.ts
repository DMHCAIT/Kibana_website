import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { userCart } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * DELETE /api/cart/clear
 * Clears all items from the user's cart
 */
export async function DELETE() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("kibana-user-id")?.value;
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete all cart items for this user
    await db.delete(userCart).where(eq(userCart.userId, userId));

    console.log(`✅ Cart cleared for user ${userId}`);
    return NextResponse.json({ success: true, message: "Cart cleared" });
  } catch (error) {
    console.error("❌ DELETE /api/cart/clear error:", error);
    return NextResponse.json({ error: "Failed to clear cart" }, { status: 500 });
  }
}
