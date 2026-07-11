import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getProducts, saveProduct, invalidateCache } from "@/lib/server-data";
import type { Product } from "@/types/product";

async function auth() {
  const cookieStore = await cookies();
  return cookieStore.get("admin_token")?.value;
}

export async function GET() {
  if (!(await auth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await getProducts());
}

export async function POST(req: Request) {
  if (!(await auth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await req.json()) as Product & { order?: number };
  if (!body.id || !body.slug || !body.name) {
    return NextResponse.json({ error: "id, slug, name required" }, { status: 400 });
  }
  await saveProduct(body);
  // ✅ Invalidate cache so website shows fresh data immediately
  invalidateCache("products");
  invalidateCache(`product-${body.id}`);
  invalidateCache(`product-slug-${body.slug}`);
  return NextResponse.json({ success: true });
}
