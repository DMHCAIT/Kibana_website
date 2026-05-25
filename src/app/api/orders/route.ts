import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOrders } from "@/lib/server-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const sb = await createSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const all = await getOrders();
  // Match by user.id or user.email stored in the order's user field
  const mine = all.filter(
    (o) => o.user?.id === user.id || o.user?.email === user.email
  );
  const sorted = mine.sort(
    (a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime()
  );
  return NextResponse.json(sorted);
}
