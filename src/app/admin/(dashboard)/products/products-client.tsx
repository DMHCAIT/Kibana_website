"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertTriangle,
  Package,
  ChevronUp,
  ChevronDown,
  X,
} from "lucide-react";
import { ResponsiveImage } from "@/components/ui/responsive-image";
import type { Product } from "@/types/product";

interface Props {
  initialProducts: Product[];
}

export function ProductsClient({ initialProducts }: Props) {
  const [products, setProducts] = useState(initialProducts);
  const [query, setQuery] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [sortKey, setSortKey] = useState<"name" | "price" | "category">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const router = useRouter();
  const [, startTransition] = useTransition();

  const filtered = products
    .filter(
      (p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase())
    )
    .sort((a, b) => {
      const av = sortKey === "price" ? a.price : (a[sortKey] as string);
      const bv = sortKey === "price" ? b.price : (b[sortKey] as string);
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  function toggleSort(key: typeof sortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  async function handleDelete(id: string) {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProducts((p) => p.filter((pr) => pr.id !== id));
        startTransition(() => router.refresh());
      }
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  }

  const SortIcon = ({ col }: { col: typeof sortKey }) =>
    sortKey === col ? (
      sortDir === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />
    ) : null;

  return (
    <>
      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Products</h1>
            <p className="text-sm text-gray-500 mt-0.5">{products.length} total products</p>
          </div>
          <Link
            href="/admin/products/new"
            className="flex items-center gap-2 bg-gray-900 text-white text-sm px-4 py-2 rounded-xl hover:bg-gray-800 transition-colors font-medium"
          >
            <Plus size={16} />
            Add Product
          </Link>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products by name or category..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 w-16">
                    Image
                  </th>
                  <th
                    className="text-left px-4 py-3 text-xs font-semibold text-gray-500 cursor-pointer hover:text-gray-900 select-none"
                    onClick={() => toggleSort("name")}
                  >
                    <span className="flex items-center gap-1">
                      Name <SortIcon col="name" />
                    </span>
                  </th>
                  <th
                    className="text-left px-4 py-3 text-xs font-semibold text-gray-500 cursor-pointer hover:text-gray-900 select-none"
                    onClick={() => toggleSort("category")}
                  >
                    <span className="flex items-center gap-1">
                      Category <SortIcon col="category" />
                    </span>
                  </th>
                  <th
                    className="text-left px-4 py-3 text-xs font-semibold text-gray-500 cursor-pointer hover:text-gray-900 select-none"
                    onClick={() => toggleSort("price")}
                  >
                    <span className="flex items-center gap-1">
                      Price <SortIcon col="price" />
                    </span>
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Tags</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-3">
                      {product.image ? (
                        <ResponsiveImage src={product.image} alt={product.name} width={48} height={48} className="rounded-xl border border-gray-200" />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                          <Package size={18} className="text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-xs text-gray-400 font-mono">{product.slug}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600 capitalize">{product.category}</td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900">₹{product.price.toLocaleString("en-IN")}</p>
                      {product.compareAtPrice && (
                        <p className="text-xs text-gray-400 line-through">
                          ₹{product.compareAtPrice.toLocaleString("en-IN")}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {product.isNew && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-md font-medium">
                            New
                          </span>
                        )}
                        {product.isBestSeller && (
                          <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-md font-medium">
                            Best Seller
                          </span>
                        )}
                        {product.isTrending && (
                          <span className="text-xs bg-pink-100 text-pink-700 px-1.5 py-0.5 rounded-md font-medium">
                            Trending
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
                        >
                          <Edit2 size={13} /> Edit
                        </Link>
                        <button
                          onClick={() => setDeleteId(product.id)}
                          className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-red-200 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                      {query ? `No products matching "${query}"` : "No products yet"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertTriangle size={20} className="text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Delete Product?</h3>
                <p className="text-sm text-gray-500">This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-xl text-sm hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl text-sm hover:bg-red-700 disabled:opacity-60 transition-colors font-medium"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

