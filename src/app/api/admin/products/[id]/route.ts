import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getProduct, saveProduct, deleteProduct } from "@/lib/server-data";
import { db } from "@/lib/db";
import { mediaFiles } from "@/lib/db/schema";
import { like } from "drizzle-orm";
import type { Product } from "@/types/product";

/** Delete all files under a folder prefix in a Supabase bucket */
async function deleteStorageFolder(
  supabase: SupabaseClient,
  bucket: string,
  folderPrefix: string,
) {
  const { data: listed } = await supabase.storage.from(bucket).list(folderPrefix);
  if (listed && listed.length > 0) {
    const paths = listed.map((f) => `${folderPrefix}/${f.name}`);
    await supabase.storage.from(bucket).remove(paths);
  }
}

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
  // ✅ Invalidate cache so website shows fresh data immediately
  const importedInvalidateCache = (await import("@/lib/server-data")).invalidateCache;
  importedInvalidateCache("products");
  importedInvalidateCache(`product-${id}`);
  importedInvalidateCache(`product-slug-${body.slug}`);
  return NextResponse.json({ success: true });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await auth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  // Delete associated storage files before removing the DB record
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );

  await Promise.allSettled([
    deleteStorageFolder(supabase, "product-images", `products/${id}`),
    deleteStorageFolder(supabase, "product-videos", `products/${id}`),
    // Clean up media_files records whose path starts with products/{id}/
    db.delete(mediaFiles).where(like(mediaFiles.path, `products/${id}/%`)),
  ]);

  await deleteProduct(id);
  // ✅ Invalidate cache so website shows fresh data immediately
  const importedInvalidateCache = (await import("@/lib/server-data")).invalidateCache;
  importedInvalidateCache("products");
  importedInvalidateCache(`product-${id}`);
  return NextResponse.json({ success: true });
}
