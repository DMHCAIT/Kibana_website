import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getOrders, saveOrder, updateOrderStatus } from "@/lib/server-data";
import type { AdminOrder } from "@/lib/server-data";

async function auth() {
  const cookieStore = await cookies();
  return cookieStore.get("admin_token")?.value;
}

export async function GET() {
  if (!(await auth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const orders = (await getOrders()).sort(
    (a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime()
  );
  return NextResponse.json(orders);
}

export async function POST(req: Request) {
  // Public endpoint — called from cart/checkout
  const body = (await req.json()) as AdminOrder;
  if (!body.id || !Array.isArray(body.items)) {
    return NextResponse.json({ error: "id and items required" }, { status: 400 });
  }
  await saveOrder({ ...body, status: body.status ?? "pending", placedAt: body.placedAt ?? new Date().toISOString() });
  return NextResponse.json({ success: true });
}

export async function PATCH(req: Request) {
  if (!(await auth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, status } = await req.json();
  await updateOrderStatus(id, status);
  return NextResponse.json({ success: true });
}
