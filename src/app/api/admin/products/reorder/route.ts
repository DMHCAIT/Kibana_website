import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { reorderProducts } from "@/lib/server-data";

async function auth() {
  const cookieStore = await cookies();
  return cookieStore.get("admin_token")?.value;
}

export async function PUT(req: Request) {
  if (!(await auth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { ids } = (await req.json()) as { ids: string[] };
  await reorderProducts(ids);
  return NextResponse.json({ success: true });
}
