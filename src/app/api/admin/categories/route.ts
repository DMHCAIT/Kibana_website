import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCategories, saveCategory, reorderCategories, deleteCategory } from "@/lib/server-data";
import type { AdminCategory } from "@/lib/server-data";

async function auth() {
  const cookieStore = await cookies();
  return cookieStore.get("admin_token")?.value === "authenticated";
}

export async function GET() {
  if (!(await auth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await getCategories());
}

export async function POST(req: Request) {
  if (!(await auth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await req.json()) as AdminCategory;
  if (!body.slug || !body.name) {
    return NextResponse.json({ error: "slug and name required" }, { status: 400 });
  }
  await saveCategory(body);
  return NextResponse.json({ success: true });
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

export async function DELETE(req: Request) {
  if (!(await auth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { slug } = await req.json();
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });
  await deleteCategory(slug);
  return NextResponse.json({ success: true });
}
