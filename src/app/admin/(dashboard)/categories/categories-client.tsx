"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Plus, Pencil, Trash2, X, Check, AlertTriangle,
  ChevronUp, ChevronDown, CheckCircle2, AlertCircle,
} from "lucide-react";
import type { AdminCategory } from "@/lib/server-data";

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

type Msg = { type: "ok" | "err"; text: string };

// ─── Modal ────────────────────────────────────────────────────────────────────
function CategoryModal({
  initial,
  isNew,
  onSave,
  onClose,
}: {
  initial: AdminCategory | null;
  isNew: boolean;
  onSave: (cat: AdminCategory) => Promise<void>;
  onClose: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [image, setImage] = useState(initial?.image ?? "");
  const [autoSlug, setAutoSlug] = useState(isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleNameChange = (v: string) => {
    setName(v);
    if (autoSlug) setSlug(slugify(v));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug || !name) { setError("Name and slug are required."); return; }
    setSaving(true);
    setError("");
    try {
      await onSave({ slug, name, image, order: initial?.order ?? 999 });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">{isNew ? "Add New Category" : "Edit Category"}</h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Name *</label>
            <input
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Tote Bags"
              className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition-shadow"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
              Slug (URL) *
            </label>
            <div className="flex gap-2">
              <input
                value={slug}
                onChange={(e) => { setSlug(e.target.value); setAutoSlug(false); }}
                placeholder="e.g. tote-bag"
                disabled={!isNew}
                className="flex-1 border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gray-900 transition-shadow disabled:bg-gray-50 disabled:text-gray-400"
                required
              />
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              {isNew ? "Auto-generated from name. Used in shop URLs." : "Slug cannot be changed after creation."}
            </p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
              Image URL
            </label>
            <input
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="/extracted/img-001.jpg or https://..."
              className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition-shadow"
            />
            {image && (
              <div className="mt-2 relative h-16 w-16 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                <Image src={image} alt="preview" fill className="object-cover" sizes="64px" onError={() => {}} />
              </div>
            )}
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-gray-900 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {saving ? "Saving…" : <><Check className="h-3.5 w-3.5" /> Save Category</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Delete Confirm ──────────────────────────────────────────────────────────
function DeleteConfirm({
  category,
  onConfirm,
  onClose,
}: {
  category: AdminCategory;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}) {
  const [deleting, setDeleting] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-sm mx-4 p-6">
        <div className="flex items-start gap-4 mb-5">
          <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Delete Category</h3>
            <p className="text-sm text-gray-500">
              Are you sure you want to delete <span className="font-semibold text-gray-700">{category.name}</span>?
              This cannot be undone. Products in this category will not be deleted.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
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

// ─── Main Component ───────────────────────────────────────────────────────────
export function CategoriesClient({
  initialCategories,
  productCounts,
}: {
  initialCategories: AdminCategory[];
  productCounts: Record<string, number>;
}) {
  const [categories, setCategories] = useState<AdminCategory[]>(initialCategories);
  const [modal, setModal] = useState<{ mode: "add" | "edit"; cat: AdminCategory | null } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminCategory | null>(null);
  const [msg, setMsg] = useState<Msg | null>(null);
  const [reordering, setReordering] = useState(false);

  const showMsg = (m: Msg) => { setMsg(m); setTimeout(() => setMsg(null), 4000); };

  const handleSave = async (cat: AdminCategory) => {
    const method = modal?.mode === "add" ? "POST" : "PUT";
    const res = await fetch("/api/admin/categories", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cat),
    });
    if (!res.ok) throw new Error((await res.json()).error ?? "Failed to save");
    if (modal?.mode === "add") {
      setCategories((prev) => [...prev, { ...cat, order: prev.length + 1 }]);
      showMsg({ type: "ok", text: `Category "${cat.name}" added successfully.` });
    } else {
      setCategories((prev) => prev.map((c) => (c.slug === cat.slug ? cat : c)));
      showMsg({ type: "ok", text: `Category "${cat.name}" updated successfully.` });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const res = await fetch("/api/admin/categories", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: deleteTarget.slug }),
    });
    if (!res.ok) {
      showMsg({ type: "err", text: "Failed to delete category." });
      setDeleteTarget(null);
      return;
    }
    setCategories((prev) => prev.filter((c) => c.slug !== deleteTarget.slug));
    showMsg({ type: "ok", text: `Category "${deleteTarget.name}" deleted.` });
    setDeleteTarget(null);
  };

  const move = async (index: number, dir: -1 | 1) => {
    const next = [...categories];
    const swap = index + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[index], next[swap]] = [next[swap], next[index]];
    setCategories(next);
    setReordering(true);
    const res = await fetch("/api/admin/categories", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reorder: true, slugs: next.map((c) => c.slug) }),
    });
    setReordering(false);
    if (!res.ok) showMsg({ type: "err", text: "Failed to save order." });
  };

  return (
    <div className="p-6 overflow-y-auto h-full">
      <div className="max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
            <p className="text-sm text-gray-500 mt-1">
              {categories.length} categories · use ↑↓ to reorder
            </p>
          </div>
          <button
            onClick={() => setModal({ mode: "add", cat: null })}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            <Plus className="h-4 w-4" /> Add Category
          </button>
        </div>

        {/* Message */}
        {msg && (
          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm mb-4 border ${
            msg.type === "ok" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"
          }`}>
            {msg.type === "ok" ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
            {msg.text}
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-[10px] text-gray-500 uppercase tracking-wider">
                <th className="px-3 py-3.5 text-left w-16">Order</th>
                <th className="px-4 py-3.5 text-left">Category</th>
                <th className="px-4 py-3.5 text-left">Slug</th>
                <th className="px-4 py-3.5 text-left">Products</th>
                <th className="px-4 py-3.5 text-left">Shop Link</th>
                <th className="px-4 py-3.5 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {categories.map((cat, index) => (
                <tr key={cat.slug} className="hover:bg-gray-50/60 transition-colors">
                  {/* Reorder */}
                  <td className="px-3 py-3">
                    <div className="flex flex-col items-center gap-0.5">
                      <button
                        onClick={() => move(index, -1)}
                        disabled={index === 0 || reordering}
                        className="p-1 text-gray-300 hover:text-gray-600 hover:bg-gray-100 rounded disabled:opacity-20 transition-colors"
                      >
                        <ChevronUp className="h-3.5 w-3.5" />
                      </button>
                      <span className="text-[10px] text-gray-300 font-mono">{index + 1}</span>
                      <button
                        onClick={() => move(index, 1)}
                        disabled={index === categories.length - 1 || reordering}
                        className="p-1 text-gray-300 hover:text-gray-600 hover:bg-gray-100 rounded disabled:opacity-20 transition-colors"
                      >
                        <ChevronDown className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>

                  {/* Category Name + Image */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                        {cat.image ? (
                          <Image src={cat.image} alt={cat.name} fill className="object-cover" sizes="48px" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-gray-300 text-lg">📁</div>
                        )}
                      </div>
                      <span className="font-semibold text-gray-900">{cat.name}</span>
                    </div>
                  </td>

                  {/* Slug */}
                  <td className="px-4 py-3.5">
                    <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                      {cat.slug}
                    </span>
                  </td>

                  {/* Products count */}
                  <td className="px-4 py-3.5">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      (productCounts[cat.slug] ?? 0) > 0
                        ? "bg-green-50 text-green-700 border border-green-100"
                        : "bg-gray-100 text-gray-400"
                    }`}>
                      {productCounts[cat.slug] ?? 0} product{(productCounts[cat.slug] ?? 0) !== 1 ? "s" : ""}
                    </span>
                  </td>

                  {/* Shop Link */}
                  <td className="px-4 py-3.5">
                    <Link
                      href={`/shop?cat=${cat.slug}`}
                      target="_blank"
                      className="text-xs text-gray-400 hover:text-gray-700 transition-colors underline underline-offset-2"
                    >
                      View in shop →
                    </Link>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setModal({ mode: "edit", cat })}
                        className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 rounded-lg transition-colors"
                      >
                        <Pencil className="h-3 w-3" /> Edit
                      </button>
                      <button
                        onClick={() => setDeleteTarget(cat)}
                        className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-3 w-3" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {categories.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400 text-sm">
                    No categories yet. Click "Add Category" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {modal && (
        <CategoryModal
          initial={modal.cat}
          isNew={modal.mode === "add"}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
      {deleteTarget && (
        <DeleteConfirm
          category={deleteTarget}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
