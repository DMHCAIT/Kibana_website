import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getProducts, saveProduct, invalidateCache } from "@/lib/server-data";
import { invalidateProductsCache } from "@/lib/api/products-cache";
import { AdminProductSchema, normalizeProductImages } from "@/lib/admin-product";

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
  try {
    const parsed = AdminProductSchema.safeParse(await req.json());
    if (!parsed.success)
      return NextResponse.json(
        {
          error: parsed.error.issues
            .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
            .join("\n"),
        },
        { status: 400 },
      );
    const body = parsed.data;
    await saveProduct({ ...normalizeProductImages(body), order: body.order });

    // ✅ Invalidate cache so website shows fresh data immediately
    invalidateCache();
    invalidateProductsCache(); // Also invalidate API cache

    // ✅ Revalidate all product-related pages
    revalidatePath("/shop/[slug]", "page");
    revalidatePath("/shop", "page");
    revalidatePath("/", "page");
    revalidatePath("/category/[slug]", "page");
    revalidatePath("/new-arrivals", "page");
    revalidatePath("/admin/products", "page");

    return NextResponse.json({ success: true, message: "Product created and website revalidated" });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create product" },
      { status: error instanceof SyntaxError ? 400 : 500 },
    );
  }
}
