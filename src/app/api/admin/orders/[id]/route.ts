import { type NextRequest, NextResponse } from "next/server";
import { updateOrderStatus } from "@/lib/server-data";
import type { AdminOrder } from "@/lib/server-data";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
