import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCategories, saveCategory, reorderCategories } from "@/lib/server-data";
import type { AdminCategory } from "@/lib/server-data";

async function auth() {
  const cookieStore = await cookies();
  return cookieStore.get("admin_token")?.value;
}

export async function GET() {
  if (!(await auth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await getCategories());
}

export async function PUT(req: Request) {
  if (!(await auth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  if (body.reorder && Array.isArray(body.slugs)) {
    await reorderCategories(body.slugs);
  } else {
    await saveCategory(body as AdminCategory);
  }
  return NextResponse.json({ success: true });
}
