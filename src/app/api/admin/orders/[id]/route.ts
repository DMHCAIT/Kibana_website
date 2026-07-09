import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { orders as ordersTable } from "@/lib/db/schema";
import { updateOrderStatus } from "@/lib/server-data";
import { eq } from "drizzle-orm";
import type { AdminOrder } from "@/lib/server-data";

async function isAdmin() {
  const cookieStore = await cookies();
  return cookieStore.get("admin_token")?.value === "authenticated";
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json() as { status?: string };
  if (!body.status) {
    return NextResponse.json({ error: "status is required" }, { status: 400 });
  }
  const validStatuses: AdminOrder["status"][] = [
    "pending", "processing", "shipped", "delivered", "cancelled",
  ];
  if (!validStatuses.includes(body.status as AdminOrder["status"])) {
    return NextResponse.json({ error: "invalid status" }, { status: 400 });
  }
  await updateOrderStatus(id, body.status as AdminOrder["status"]);
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    await db.delete(ordersTable).where(eq(ordersTable.id, id));
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete order" },
      { status: 500 }
    );
  }
}
