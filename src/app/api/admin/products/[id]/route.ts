import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getProduct, saveProduct, deleteProduct } from "@/lib/server-data";
import type { Product } from "@/types/product";

async function auth() {
  const cookieStore = await cookies();
  return cookieStore.get("admin_token")?.value;
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await auth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const p = await getProduct(id);
  if (!p) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(p);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await auth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = (await req.json()) as Product & { order?: number };
  await saveProduct({ ...body, id });
  return NextResponse.json({ success: true });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await auth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await deleteProduct(id);
  return NextResponse.json({ success: true });
}
