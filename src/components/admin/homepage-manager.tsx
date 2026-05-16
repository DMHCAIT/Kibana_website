"use client";

import { useState } from "react";
import { Eye, EyeOff, GripVertical, ChevronUp, ChevronDown } from "lucide-react";

type Section = { id: string; label: string; visible: boolean; order: number };

export function HomepageManager({ initialSections }: { initialSections: Section[] }) {
  const [sections, setSections] = useState(
    [...initialSections].sort((a, b) => a.order - b.order)
  );
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const toggle = (id: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, visible: !s.visible } : s))
    );
  };

  const move = (index: number, dir: -1 | 1) => {
    const next = [...sections];
    const swap = index + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[index], next[swap]] = [next[swap], next[index]];
    setSections(next.map((s, i) => ({ ...s, order: i + 1 })));
  };

  const save = async () => {
    setSaving(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/site-config", { method: "GET" });
      const config = await res.json();
      config.sections = sections.map((s, i) => ({ ...s, order: i + 1 }));
      const put = await fetch("/api/admin/site-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      setMsg(put.ok ? "Saved! Refresh the storefront to see changes." : "Error saving.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl space-y-3">
      <p className="text-sm text-gray-500 mb-4">
        Toggle visibility and drag sections up/down to reorder them on the homepage.
      </p>

      <div className="space-y-2">
        {sections.map((s, i) => (
          <div
            key={s.id}
            className={`flex items-center gap-3 bg-white border rounded-xl px-4 py-3 transition-all ${
              s.visible ? "border-gray-200" : "border-gray-100 opacity-60"
            }`}
          >
            <GripVertical className="h-4 w-4 text-gray-300 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800">{s.label}</p>
              <p className="text-[10px] text-gray-400 font-mono">{s.id}</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => move(i, -1)}
                disabled={i === 0}
                className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-20 hover:bg-gray-100 rounded"
              >
                <ChevronUp className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => move(i, 1)}
                disabled={i === sections.length - 1}
                className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-20 hover:bg-gray-100 rounded"
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </div>
            <button
              onClick={() => toggle(s.id)}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors ${
                s.visible
                  ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  : "bg-gray-50 text-gray-400 hover:bg-gray-100"
              }`}
            >
              {s.visible ? (
                <>
                  <Eye className="h-3.5 w-3.5" /> Visible
                </>
              ) : (
                <>
                  <EyeOff className="h-3.5 w-3.5" /> Hidden
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      {msg && (
        <p className={`text-sm px-4 py-2 rounded-lg ${msg.includes("Error") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
          {msg}
        </p>
      )}

      <button
        onClick={save}
        disabled={saving}
        className="px-6 py-2.5 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors font-medium"
      >
        {saving ? "Saving…" : "Save Section Order"}
      </button>
    </div>
  );
}
