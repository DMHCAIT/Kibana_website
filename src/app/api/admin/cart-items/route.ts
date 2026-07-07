import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { users as usersTable, userCart as userCartTable, products as productsTable } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const cookieStore = await cookies();
  const adminUserId = cookieStore.get("kibana-user-id")?.value;
  
  if (!adminUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify user is admin (check if admin folder exists or you can add admin role to users table)
  const adminUser = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, adminUserId))
    .limit(1);

  if (!adminUser.length) {
    return NextResponse.json({ error: "Admin not found" }, { status: 404 });
  }

  // Fetch all cart items with customer details
  const cartItems = await db
    .select({
      id: userCartTable.id,
      userId: userCartTable.userId,
      productId: userCartTable.productId,
      quantity: userCartTable.quantity,
      color: userCartTable.color,
      addedAt: userCartTable.addedAt,
      customerName: usersTable.name,
      customerEmail: usersTable.email,
      customerPhone: usersTable.phone,
      productName: productsTable.name,
      productPrice: productsTable.price,
      productImage: productsTable.image,
    })
    .from(userCartTable)
    .innerJoin(usersTable, eq(userCartTable.userId, usersTable.id))
    .innerJoin(productsTable, eq(userCartTable.productId, productsTable.id))
    .orderBy(desc(userCartTable.addedAt));

  return NextResponse.json(cartItems);
}
