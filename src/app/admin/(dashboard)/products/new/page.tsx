import { ProductEditForm } from "@/components/admin/product-edit-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const BLANK_PRODUCT = {
  id: `p${Date.now()}`,
  slug: "",
  name: "",
  description: "",
  price: 0,
  compareAtPrice: undefined,
  image: "/extracted/img-010.jpg",
  gallery: [],
  category: "tote-bag",
  gender: "women",
  isBestSeller: false,
  isTrending: false,
  isNew: false,
  colors: [],
  colorVariants: [],
  features: [],
  specs: {},
  rating: 4.5,
  reviewCount: 0,
  order: 99,
};

export default function NewProductPage() {
  return (
    <div className="p-6 overflow-y-auto h-full">
      <div className="mb-6">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Products
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
        <p className="text-sm text-gray-500 mt-1">
          Fill in the details below. The product will appear on the storefront after saving.
        </p>
      </div>
      <ProductEditForm product={BLANK_PRODUCT as Parameters<typeof ProductEditForm>[0]["product"]} isNew />
    </div>
  );
}
