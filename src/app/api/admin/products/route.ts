import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
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

  try {
    await saveProduct(body);

    // ✅ Invalidate cache so website shows fresh data immediately
    invalidateCache("products");
    invalidateCache(`product-${body.id}`);
    invalidateCache(`product-slug-${body.slug}`);

    // ✅ Revalidate all product-related pages
    revalidatePath("/shop/[slug]", "page");
    revalidatePath("/shop", "page");
    revalidatePath("/", "page");

    return NextResponse.json({ success: true, message: "Product created and website revalidated" });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create product" },
      { status: 500 },
    );
  }
}
