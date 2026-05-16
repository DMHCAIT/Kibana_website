"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Pencil, ChevronUp, ChevronDown, ExternalLink, CheckCircle2, AlertCircle, Trash2, AlertTriangle, X } from "lucide-react";
import type { Product } from "@/types/product";

type P = Product & { order?: number };

function DeleteConfirm({
  product,
  onConfirm,
  onClose,
}: {
  product: P;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}) {
  const [deleting, setDeleting] = useState(false);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-sm mx-4 p-6">
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <X className="h-4 w-4" />
        </button>
        <div className="flex items-start gap-4 mb-5">
          <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Delete Product</h3>
            <p className="text-sm text-gray-500">
              Delete <span className="font-semibold text-gray-700">{product.name}</span>? This cannot be undone and will remove it from the storefront immediately.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button
            onClick={async () => { setDeleting(true); await onConfirm(); }}
            disabled={deleting}
            className="flex-1 bg-red-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProductsListClient({ initialProducts }: { initialProducts: P[] }) {
  const [products, setProducts] = useState<P[]>(initialProducts);
  const [reorderSaving, setReorderSaving] = useState(false);
  const [reorderMsg, setReorderMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<P | null>(null);

  const move = async (index: number, dir: -1 | 1) => {
    const next = [...products];
    const swap = index + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[index], next[swap]] = [next[swap], next[index]];
    setProducts(next);
    // Auto-save reorder
    setReorderSaving(true);
    setReorderMsg(null);
    try {
      const res = await fetch("/api/admin/products/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: next.map((p) => p.id) }),
      });
      setReorderMsg(res.ok
        ? { type: "ok", text: "Display order saved! Refresh the storefront to see changes." }
        : { type: "err", text: "Error saving order." }
      );
    } finally {
      setReorderSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const res = await fetch(`/api/admin/products/${deleteTarget.id}`, { method: "DELETE" });
    if (res.ok) {
      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setReorderMsg({ type: "ok", text: `"${deleteTarget.name}" deleted successfully.` });
    } else {
      setReorderMsg({ type: "err", text: "Failed to delete product." });
    }
    setDeleteTarget(null);
  };

  return (
    <>
      <div className="p-6 overflow-y-auto h-full">
      <div className="max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Products</h1>
            <p className="text-sm text-gray-500 mt-1">{products.length} products · use ↑↓ arrows to reorder</p>
          </div>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            <Plus className="h-4 w-4" /> Add Product
          </Link>
        </div>

        {/* Reorder message */}
        {reorderMsg && (
          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm mb-4 border ${
            reorderMsg.type === "ok" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"
          }`}>
            {reorderMsg.type === "ok" ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
            {reorderMsg.text}
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-[10px] text-gray-500 uppercase tracking-wider">
                  <th className="px-3 py-3.5 text-left w-16">Order</th>
                  <th className="px-4 py-3.5 text-left">Product</th>
                  <th className="px-4 py-3.5 text-left">Category</th>
                  <th className="px-4 py-3.5 text-left">Price</th>
                  <th className="px-4 py-3.5 text-left">MRP</th>
                  <th className="px-4 py-3.5 text-left">Colors</th>
                  <th className="px-4 py-3.5 text-left">Tags</th>
                  <th className="px-4 py-3.5 text-left">Rating</th>
                  <th className="px-4 py-3.5 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((p, index) => (
                  <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                    {/* Reorder controls */}
                    <td className="px-3 py-3">
                      <div className="flex flex-col items-center gap-0.5">
                        <button
                          onClick={() => move(index, -1)}
                          disabled={index === 0 || reorderSaving}
                          className="p-1 text-gray-300 hover:text-gray-600 hover:bg-gray-100 rounded disabled:opacity-20 transition-colors"
                          title="Move up"
                        >
                          <ChevronUp className="h-3.5 w-3.5" />
                        </button>
                        <span className="text-[10px] text-gray-300 font-mono">{index + 1}</span>
                        <button
                          onClick={() => move(index, 1)}
                          disabled={index === products.length - 1 || reorderSaving}
                          className="p-1 text-gray-300 hover:text-gray-600 hover:bg-gray-100 rounded disabled:opacity-20 transition-colors"
                          title="Move down"
                        >
                          <ChevronDown className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Product info */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-11 w-11 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                          <Image src={p.image} alt={p.name} fill className="object-cover" sizes="44px" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-xs leading-snug">{p.name}</p>
                          <p className="text-[10px] text-gray-400 font-mono mt-0.5">{p.id} · /{p.slug}</p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3">
                      <span className="text-xs capitalize text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
                        {p.category.replace(/-/g, " ")}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="px-4 py-3">
                      <span className="font-bold text-gray-900 text-xs">₹{p.price.toLocaleString()}</span>
                    </td>

                    {/* MRP */}
                    <td className="px-4 py-3">
                      {p.compareAtPrice ? (
                        <span className="text-xs text-gray-400 line-through">₹{p.compareAtPrice.toLocaleString()}</span>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>

                    {/* Colors */}
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {(p.colorVariants && p.colorVariants.length > 0
                          ? p.colorVariants.map((v) => v.hex)
                          : p.colors
                        ).slice(0, 5).map((c, i) => (
                          <span key={i} className="h-4 w-4 rounded-full ring-1 ring-black/10 flex-shrink-0" style={{ backgroundColor: c }} title={c} />
                        ))}
                        {(p.colorVariants?.length ?? p.colors.length) > 5 && (
                          <span className="text-[10px] text-gray-400">+{(p.colorVariants?.length ?? p.colors.length) - 5}</span>
                        )}
                      </div>
                    </td>

                    {/* Tags */}
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap min-w-[70px]">
                        {p.isBestSeller && <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-100 px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap">Best Seller</span>}
                        {p.isNew && <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-100 px-1.5 py-0.5 rounded-full font-medium">New</span>}
                        {p.isTrending && <span className="text-[10px] bg-pink-50 text-pink-700 border border-pink-100 px-1.5 py-0.5 rounded-full font-medium">Trending</span>}
                        {!p.isBestSeller && !p.isNew && !p.isTrending && <span className="text-gray-300 text-[10px]">—</span>}
                      </div>
                    </td>

                    {/* Rating */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <span className="text-amber-400 text-xs">★</span>
                        <span className="text-xs font-medium text-gray-700">{p.rating}</span>
                        <span className="text-[10px] text-gray-400">({p.reviewCount})</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/admin/products/${p.id}`}
                          className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 rounded-lg transition-colors"
                        >
                          <Pencil className="h-3 w-3" /> Edit
                        </Link>
                        <Link
                          href={`/shop/${p.slug}`}
                          target="_blank"
                          className="p-1.5 text-gray-300 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="View on store"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                        <button
                          onClick={() => setDeleteTarget(p)}
                          className="p-1.5 text-red-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete product"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      </div>

      {deleteTarget && (
        <DeleteConfirm
          product={deleteTarget}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}
