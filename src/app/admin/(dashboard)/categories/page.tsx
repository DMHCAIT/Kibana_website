import { getCategories, getProducts } from "@/lib/server-data";
import Image from "next/image";
import Link from "next/link";

export default async function AdminCategoriesPage() {
  const categories = await getCategories();
  const products = await getProducts();
  return (
    <div className="p-6 overflow-y-auto h-full">
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-sm text-gray-500 mt-1">{categories.length} categories · sorted by display order</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wide">
              <th className="px-6 py-3.5 text-left">Category</th>
              <th className="px-6 py-3.5 text-left">Slug</th>
              <th className="px-6 py-3.5 text-left">Products</th>
              <th className="px-6 py-3.5 text-left">Product Names</th>
              <th className="px-6 py-3.5 text-left">Shop Link</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {categories.map((c) => {
              const categoryProducts = products.filter((p) => p.category === c.slug);
              return (
                <tr key={c.slug} className="hover:bg-gray-50/60 transition-colors">
                  {/* Category Image + Name */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                        <Image src={c.image} alt={c.name} fill className="object-cover" sizes="48px" />
                      </div>
                      <span className="font-semibold text-gray-900">{c.name}</span>
                    </div>
                  </td>

                  {/* Slug */}
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                      {c.slug}
                    </span>
                  </td>

                  {/* Count */}
                  <td className="px-6 py-4">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        categoryProducts.length > 0
                          ? "bg-green-50 text-green-700 border border-green-100"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {categoryProducts.length} product{categoryProducts.length !== 1 ? "s" : ""}
                    </span>
                  </td>

                  {/* Product names */}
                  <td className="px-6 py-4 max-w-xs">
                    <div className="flex flex-wrap gap-1">
                      {categoryProducts.length > 0 ? (
                        categoryProducts.map((p) => (
                          <span key={p.id} className="text-[10px] text-gray-500 bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded">
                            {p.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] text-gray-400">No products yet</span>
                      )}
                    </div>
                  </td>

                  {/* Shop link */}
                  <td className="px-6 py-4">
                    <Link
                      href={`/shop?cat=${c.slug}`}
                      target="_blank"
                      className="text-xs text-gray-400 hover:text-gray-700 transition-colors underline underline-offset-2"
                    >
                      View in shop →
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      </div>
    </div>
  );
}
