"use client";

import { useEffect, useState, useTransition } from "react";
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
  const [error, setError] = useState("");
  const [sortKey, setSortKey] = useState<"name" | "price" | "category">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const router = useRouter();
  const [, startTransition] = useTransition();
  useEffect(() => setProducts(initialProducts), [initialProducts]);

  const filtered = products
    .filter(
      (p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.slug.toLowerCase().includes(query.toLowerCase()) ||
        p.colorVariants.some((variant) =>
          `${variant.slug} ${variant.pageSlug ?? ""} ${variant.productTitle ?? ""}`
            .toLowerCase()
            .includes(query.toLowerCase()),
        ) ||
        p.category.toLowerCase().includes(query.toLowerCase()),
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
    setError("");
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error || "Could not delete product.");
      }
      setProducts((p) => p.filter((pr) => pr.id !== id));
      startTransition(() => router.refresh());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not delete product.");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  }

  const SortIcon = ({ col }: { col: typeof sortKey }) =>
    sortKey === col ? (
      sortDir === "asc" ? (
        <ChevronUp size={14} />
      ) : (
        <ChevronDown size={14} />
      )
    ) : null;

  return (
    <>
      <div className="space-y-5 p-6">
        {error && (
          <p
            role="alert"
            className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Products</h1>
            <p className="mt-0.5 text-sm text-gray-500">{products.length} total products</p>
          </div>
          <Link
            href="/admin/products/new"
            className="flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
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
            placeholder="Search by product name, product/colour slug or category..."
            className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
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
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="w-16 px-6 py-3 text-left text-xs font-semibold text-gray-500">
                    Image
                  </th>
                  <th
                    className="cursor-pointer select-none px-4 py-3 text-left text-xs font-semibold text-gray-500 hover:text-gray-900"
                    onClick={() => toggleSort("name")}
                  >
                    <span className="flex items-center gap-1">
                      Name <SortIcon col="name" />
                    </span>
                  </th>
                  <th
                    className="cursor-pointer select-none px-4 py-3 text-left text-xs font-semibold text-gray-500 hover:text-gray-900"
                    onClick={() => toggleSort("category")}
                  >
                    <span className="flex items-center gap-1">
                      Category <SortIcon col="category" />
                    </span>
                  </th>
                  <th
                    className="cursor-pointer select-none px-4 py-3 text-left text-xs font-semibold text-gray-500 hover:text-gray-900"
                    onClick={() => toggleSort("price")}
                  >
                    <span className="flex items-center gap-1">
                      Price <SortIcon col="price" />
                    </span>
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((product) => (
                  <tr key={product.id} className="group transition-colors hover:bg-gray-50/50">
                    <td className="px-6 py-3">
                      {product.image ? (
                        <ResponsiveImage
                          src={product.image}
                          alt={product.name}
                          width={48}
                          height={48}
                          className="rounded-xl border border-gray-200"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
                          <Package size={18} className="text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="font-mono text-xs text-gray-400">{product.slug}</p>
                      <p className="mt-1 text-xs text-gray-500">
                        {product.inStock === false ? "Sold Out · " : ""}
                        {[
                          product.isNew && "New",
                          product.isBestSeller && "Best Seller",
                          product.isTrending && "Most Trending",
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                      {product.colorVariants.map((variant) => (
                        <p key={variant.slug} className="text-xs text-gray-500">
                          {variant.color}:{" "}
                          {variant.pageSlug || `${product.slug}?color=${variant.slug}`}
                          {variant.inStock === false ? " · Sold Out" : ""}
                        </p>
                      ))}
                    </td>
                    <td className="px-4 py-3 capitalize text-gray-600">{product.category}</td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900">
                        ₹{product.price.toLocaleString("en-IN")}
                      </p>
                      {product.compareAtPrice && (
                        <p className="text-xs text-gray-400 line-through">
                          ₹{product.compareAtPrice.toLocaleString("en-IN")}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-700 transition-colors hover:bg-gray-50"
                        >
                          <Edit2 size={13} /> Edit
                        </Link>
                        <button
                          onClick={() => setDeleteId(product.id)}
                          className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-600 transition-colors hover:bg-red-50"
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100">
                <AlertTriangle size={20} className="text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Delete Product?</h3>
                <p className="text-sm text-gray-500">This action cannot be undone.</p>
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 rounded-xl border border-gray-300 px-4 py-2 text-sm transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                disabled={deleting}
                className="flex-1 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-60"
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
