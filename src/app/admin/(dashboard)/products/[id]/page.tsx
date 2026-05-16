import { notFound } from "next/navigation";
import { getProduct } from "@/lib/server-data";
import { ProductEditForm } from "@/components/admin/product-edit-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  return (
    <div className="p-6 overflow-y-auto h-full">
      <div className="mb-6">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Products
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
        <p className="text-sm text-gray-500 mt-1">
          Changes save immediately to the database — the storefront reflects them on next page load.
        </p>
      </div>
      <ProductEditForm product={product as Parameters<typeof ProductEditForm>[0]["product"]} />
    </div>
  );
}
