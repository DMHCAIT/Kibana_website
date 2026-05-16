"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown, X, Plus, CheckCircle2, AlertCircle } from "lucide-react";
import Image from "next/image";
import type { Product } from "@/types/product";

type SectionInfo = { id: string; label: string; note?: string };

const PRODUCT_SECTIONS: SectionInfo[] = [
  { id: "new-arrivals",    label: "New Arrivals",    note: "Shows products tagged as New Arrival" },
  { id: "best-sellers",    label: "Best Sellers",    note: "Overrides the Best Sellers banner product" },
  { id: "viral-bags",      label: "Viral Bags",      note: "Shows trending/viral products" },
  { id: "most-trending",   label: "Most Trending",   note: "Shows most trending products" },
  { id: "style-in-motion", label: "Style in Motion", note: "Shows product images as style tiles" },
];

type Props = {
  allProducts: Product[];
  initialAssignments: Record<string, string[]>;
};

export function SectionProductsManager({ allProducts, initialAssignments }: Props) {
  // assignments: sectionId → ordered list of product IDs
  const [assignments, setAssignments] = useState<Record<string, string[]>>(() => {
    const base: Record<string, string[]> = {};
    for (const s of PRODUCT_SECTIONS) {
      base[s.id] = initialAssignments[s.id] ?? [];
    }
    return base;
  });
  const [activeSection, setActiveSection] = useState<string>(PRODUCT_SECTIONS[0].id);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const section = PRODUCT_SECTIONS.find((s) => s.id === activeSection)!;
  const assignedIds = assignments[activeSection] ?? [];
  const assignedProducts = assignedIds
    .map((id) => allProducts.find((p) => p.id === id))
    .filter(Boolean) as Product[];
  const unassigned = allProducts.filter((p) => !assignedIds.includes(p.id));

  const addProduct = (productId: string) => {
    setAssignments((prev) => ({
      ...prev,
      [activeSection]: [...(prev[activeSection] ?? []), productId],
    }));
  };

  const removeProduct = (productId: string) => {
    setAssignments((prev) => ({
      ...prev,
      [activeSection]: (prev[activeSection] ?? []).filter((id) => id !== productId),
    }));
  };

  const moveProduct = (index: number, dir: -1 | 1) => {
    setAssignments((prev) => {
      const list = [...(prev[activeSection] ?? [])];
      const swap = index + dir;
      if (swap < 0 || swap >= list.length) return prev;
      [list[index], list[swap]] = [list[swap], list[index]];
      return { ...prev, [activeSection]: list };
    });
  };

  const save = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/site-config", { method: "GET" });
      const config = await res.json();
      config.sectionProducts = assignments;
      const put = await fetch("/api/admin/site-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      setMsg(put.ok
        ? { type: "ok", text: "Section products saved! Refresh the homepage to see changes." }
        : { type: "err", text: "Error saving. Please try again." }
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-white flex-shrink-0">
        <h1 className="text-lg font-bold text-gray-900">Section Products</h1>
        <p className="text-xs text-gray-400 mt-0.5">Choose which products appear in each homepage section and set their order</p>
      </div>

      {/* Save bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-100 flex-shrink-0">
        {msg ? (
          <div className={`flex items-center gap-2 text-sm ${msg.type === "ok" ? "text-green-600" : "text-red-600"}`}>
            {msg.type === "ok" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            {msg.text}
          </div>
        ) : (
          <p className="text-xs text-gray-500">Changes apply to all sections at once when you save.</p>
        )}
        <button
          onClick={save}
          disabled={saving}
          className="px-5 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors font-medium"
        >
          {saving ? "Saving…" : "Save All Sections"}
        </button>
      </div>

      <div className="flex-1 overflow-hidden flex">
        {/* Section tabs on left */}
        <div className="w-48 flex-shrink-0 border-r border-gray-100 bg-gray-50 p-3 space-y-1 overflow-y-auto">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 px-2 mb-2">Sections</p>
          {PRODUCT_SECTIONS.map((s) => {
            const count = (assignments[s.id] ?? []).length;
            return (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-colors ${
                  activeSection === s.id
                    ? "bg-gray-900 text-white font-medium"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{s.label}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    activeSection === s.id ? "bg-white/20 text-white" : "bg-gray-200 text-gray-500"
                  }`}>{count}</span>
                </div>
                {s.note && (
                  <p className={`text-[10px] mt-0.5 leading-snug ${activeSection === s.id ? "text-white/50" : "text-gray-400"}`}>{s.note}</p>
                )}
              </button>
            );
          })}
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div className="flex gap-5">
            {/* Assigned Products */}
            <div className="flex-1 bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                <p className="text-sm font-bold text-gray-800">{section.label} — Assigned Products</p>
                <p className="text-xs text-gray-400 mt-0.5">Drag arrows to reorder · Click × to remove</p>
              </div>

              {assignedProducts.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <p className="text-sm">No products assigned</p>
                  <p className="text-xs mt-1">Pick from the list on the right →</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {assignedProducts.map((p, i) => (
                    <div key={p.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50/60 transition-colors">
                      <span className="text-xs text-gray-300 font-mono w-5 flex-shrink-0">{i + 1}</span>
                      <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                        <Image src={p.image} alt={p.name} fill className="object-cover" sizes="40px" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 truncate">{p.name}</p>
                        <p className="text-[10px] text-gray-400">₹{p.price.toLocaleString()} · {p.category}</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => moveProduct(i, -1)}
                          disabled={i === 0}
                          className="p-1 text-gray-300 hover:text-gray-600 hover:bg-gray-100 rounded disabled:opacity-20 transition-colors"
                        >
                          <ChevronUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => moveProduct(i, 1)}
                          disabled={i === assignedProducts.length - 1}
                          className="p-1 text-gray-300 hover:text-gray-600 hover:bg-gray-100 rounded disabled:opacity-20 transition-colors"
                        >
                          <ChevronDown className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => removeProduct(p.id)}
                          className="p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Available Products */}
            <div className="w-72 flex-shrink-0 bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                <p className="text-sm font-bold text-gray-800">Available Products</p>
                <p className="text-xs text-gray-400 mt-0.5">Click + to add to this section</p>
              </div>
              <div className="divide-y divide-gray-50 overflow-y-auto max-h-[500px]">
                {unassigned.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50/60 transition-colors">
                    <div className="relative h-8 w-8 rounded-md overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                      <Image src={p.image} alt={p.name} fill className="object-cover" sizes="32px" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate">{p.name}</p>
                      <p className="text-[10px] text-gray-400">₹{p.price.toLocaleString()}</p>
                    </div>
                    <button
                      onClick={() => addProduct(p.id)}
                      className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                {unassigned.length === 0 && (
                  <div className="p-6 text-center text-xs text-gray-400">
                    All products are assigned to this section
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-700">
            <p className="font-semibold mb-1">How this works</p>
            <p>When you assign products here, the homepage section will show exactly these products in this order. If you leave a section empty, it will automatically show all products with the matching tag (New Arrival / Best Seller / Trending).</p>
          </div>
        </div>
      </div>
    </div>
  );
}
