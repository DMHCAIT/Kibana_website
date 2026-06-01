import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { userWishlist } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("kibana-user-id")?.value;
    
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const items = await db
      .select()
      .from(userWishlist)
      .where(eq(userWishlist.userId, userId));

    return NextResponse.json(items.map(i => i.productId));
  } catch (error) {
    console.error("❌ GET /api/wishlist error:", error);
    return NextResponse.json({ error: "Failed to fetch wishlist" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("kibana-user-id")?.value;
    
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { productId } = await req.json();
    if (!productId) {
      return NextResponse.json({ error: "productId required" }, { status: 400 });
    }

    // Check if already in wishlist
    const existing = await db
      .select()
      .from(userWishlist)
      .where(
        and(
          eq(userWishlist.userId, userId),
          eq(userWishlist.productId, productId)
        )
      );

    if (existing.length > 0) {
      return NextResponse.json({ success: true, action: "already_exists" });
    }

    // Add to wishlist
    await db.insert(userWishlist).values({
      id: randomUUID(),
      userId,
      productId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ POST /api/wishlist error:", error);
    return NextResponse.json({ error: "Failed to add to wishlist" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("kibana-user-id")?.value;
    
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ error: "productId required" }, { status: 400 });
    }

    const existing = await db
      .select()
      .from(userWishlist)
      .where(
        and(
          eq(userWishlist.userId, userId),
          eq(userWishlist.productId, productId)
        )
      );

    if (!existing.length) {
      return NextResponse.json({ success: true }); // No error if not found
    }

    await db.delete(userWishlist).where(eq(userWishlist.id, existing[0].id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ DELETE /api/wishlist error:", error);
    return NextResponse.json({ error: "Failed to remove from wishlist" }, { status: 500 });
  }
}
