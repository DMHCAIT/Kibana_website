import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { userCart } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("kibana-user-id")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const items = await db.select().from(userCart).where(eq(userCart.userId, userId));

    return NextResponse.json(items);
  } catch (error) {
    console.error("❌ GET /api/cart error:", error);
    return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("kibana-user-id")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      productId,
      quantity = 1,
      color,
      variantId,
      productName,
      productImage,
    } = await req.json();

    console.log(
      "📦 API CART POST RECEIVED:",
      JSON.stringify(
        {
          productId,
          quantity,
          colorReceived: color,
          variantIdReceived: variantId,
          productNameReceived: productName,
          productImageReceived: productImage,
        },
        null,
        2,
      ),
    );

    if (!productId) {
      return NextResponse.json({ error: "productId required" }, { status: 400 });
    }

    // Check if item already exists - try variantId first, fall back to color
    let existing;
    if (variantId) {
      existing = await db
        .select()
        .from(userCart)
        .where(
          and(
            eq(userCart.userId, userId),
            eq(userCart.productId, productId),
            eq(userCart.variantId, variantId),
          ),
        );
    } else {
      // Fallback to color-based lookup
      existing = await db
        .select()
        .from(userCart)
        .where(
          and(
            eq(userCart.userId, userId),
            eq(userCart.productId, productId),
            ...(color ? [eq(userCart.color, color)] : []),
          ),
        );
    }

    if (existing.length > 0) {
      // Update quantity
      await db
        .update(userCart)
        .set({ quantity: existing[0].quantity + quantity })
        .where(eq(userCart.id, existing[0].id));

      console.log(
        "📦 API CART POST - UPDATED existing:",
        JSON.stringify(
          {
            existingId: existing[0].id,
            newQuantity: existing[0].quantity + quantity,
            variantId: existing[0].variantId,
            color: existing[0].color,
          },
          null,
          2,
        ),
      );

      return NextResponse.json({ success: true, action: "updated" });
    }

    // Add new item
    await db.insert(userCart).values({
      id: randomUUID(),
      userId,
      productId,
      quantity,
      color: color || null,
      variantId: variantId || null,
      productName: productName || null,
      productImage: productImage || null,
    });

    console.log(
      "📦 API CART POST - INSERTED new:",
      JSON.stringify(
        {
          productId,
          quantity,
          colorSaved: color || "null",
          variantIdSaved: variantId || "null",
          productNameSaved: productName || "null",
          productImageSaved: productImage || "null",
        },
        null,
        2,
      ),
    );

    return NextResponse.json({ success: true, action: "added" });
  } catch (error) {
    console.error("❌ POST /api/cart error:", error);
    return NextResponse.json({ error: "Failed to add to cart" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("kibana-user-id")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId, quantity, color, variantId } = await req.json();
    if (!productId || quantity === undefined) {
      return NextResponse.json({ error: "productId and quantity required" }, { status: 400 });
    }

    // Try variantId first, fall back to color
    let existing;
    if (variantId) {
      existing = await db
        .select()
        .from(userCart)
        .where(
          and(
            eq(userCart.userId, userId),
            eq(userCart.productId, productId),
            eq(userCart.variantId, variantId),
          ),
        );
    } else {
      existing = await db
        .select()
        .from(userCart)
        .where(
          and(
            eq(userCart.userId, userId),
            eq(userCart.productId, productId),
            ...(color ? [eq(userCart.color, color)] : []),
          ),
        );
    }

    if (!existing.length) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    await db.update(userCart).set({ quantity }).where(eq(userCart.id, existing[0].id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ PUT /api/cart error:", error);
    return NextResponse.json({ error: "Failed to update cart" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("kibana-user-id")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Support both query params and request body
    const { searchParams } = new URL(req.url);
    const bodyData = await req.json().catch(() => ({}));

    const productId = searchParams.get("productId") || bodyData.productId;
    const color = searchParams.get("color") || bodyData.color;
    const variantId = bodyData.variantId;

    if (!productId) {
      return NextResponse.json({ error: "productId required" }, { status: 400 });
    }

    // Try variantId first, fall back to color
    let existing;
    if (variantId) {
      existing = await db
        .select()
        .from(userCart)
        .where(
          and(
            eq(userCart.userId, userId),
            eq(userCart.productId, productId),
            eq(userCart.variantId, variantId),
          ),
        );
    } else {
      existing = await db
        .select()
        .from(userCart)
        .where(
          and(
            eq(userCart.userId, userId),
            eq(userCart.productId, productId),
            ...(color ? [eq(userCart.color, color)] : []),
          ),
        );
    }

    if (!existing.length) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    await db.delete(userCart).where(eq(userCart.id, existing[0].id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ DELETE /api/cart error:", error);
    return NextResponse.json({ error: "Failed to remove from cart" }, { status: 500 });
  }
}
