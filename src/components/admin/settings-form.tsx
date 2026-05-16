"use client";

import { useState } from "react";
import type { SiteConfig } from "@/lib/server-data";

export function SettingsForm({ initialConfig }: { initialConfig: SiteConfig }) {
  const [config, setConfig] = useState(initialConfig);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const setHero = (field: string, val: string) =>
    setConfig((c) => ({ ...c, hero: { ...c.hero, [field]: val } }));

  const setTheme = (field: string, val: string) =>
    setConfig((c) => ({ ...c, theme: { ...c.theme, [field]: val } }));

  const save = async () => {
    setSaving(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/site-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      setMsg(res.ok ? "Settings saved! Refresh the storefront to see changes." : "Error saving settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      {msg && (
        <div className={`px-4 py-2 rounded text-sm ${msg.includes("Error") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
          {msg}
        </div>
      )}

      {/* Announcement bar */}
      <Card title="Announcement Bar">
        <Field
          label="Announcement Text"
          value={config.announcementBar}
          onChange={(v) => setConfig((c) => ({ ...c, announcementBar: v }))}
        />
        <p className="text-xs text-gray-400 mt-1">Appears in the top ticker/header bar. Separate multiple phrases with · </p>
      </Card>

      {/* Hero Section */}
      <Card title="Hero Banner">
        <Field label="Hero Title" value={config.hero.title} onChange={(v) => setHero("title", v)} />
        <Field label="Hero Subtitle" value={config.hero.subtitle} onChange={(v) => setHero("subtitle", v)} />
        <Field label="CTA Button Label" value={config.hero.ctaLabel} onChange={(v) => setHero("ctaLabel", v)} />
        <Field label="CTA Button Link" value={config.hero.ctaHref} onChange={(v) => setHero("ctaHref", v)} />
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Hero Image URLs (one per line)</label>
          <textarea
            rows={3}
            value={config.hero.images.join("\n")}
            onChange={(e) => setConfig((c) => ({ ...c, hero: { ...c.hero, images: e.target.value.split("\n").filter(Boolean) } }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none"
          />
        </div>
      </Card>

      {/* Theme */}
      <Card title="Brand Colors & Fonts">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Primary Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={config.theme.primaryColor}
                onChange={(e) => setTheme("primaryColor", e.target.value)}
                className="h-9 w-12 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={config.theme.primaryColor}
                onChange={(e) => setTheme("primaryColor", e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Accent Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={config.theme.accentColor}
                onChange={(e) => setTheme("accentColor", e.target.value)}
                className="h-9 w-12 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={config.theme.accentColor}
                onChange={(e) => setTheme("accentColor", e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Heading Font</label>
            <select
              value={config.theme.fontHeading}
              onChange={(e) => setTheme("fontHeading", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              <option value="playfair">Playfair Display (serif)</option>
              <option value="inter">Inter (sans-serif)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Body Font</label>
            <select
              value={config.theme.fontBody}
              onChange={(e) => setTheme("fontBody", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              <option value="inter">Inter (sans-serif)</option>
              <option value="playfair">Playfair Display (serif)</option>
            </select>
          </div>
        </div>
      </Card>

      <button
        onClick={save}
        disabled={saving}
        className="px-6 py-2.5 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors font-medium"
      >
        {saving ? "Saving…" : "Save Settings"}
      </button>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
      <h3 className="font-semibold text-gray-800 text-sm">{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
      />
    </div>
  );
}

// ── Standalone Hero editor (used at /admin/homepage/hero) ────────────────────

export function HeroEditor({ initialConfig }: { initialConfig: SiteConfig }) {
  const [config, setConfig] = useState(initialConfig);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const setHero = (field: string, val: unknown) =>
    setConfig((c) => ({ ...c, hero: { ...c.hero, [field]: val } }));

  const save = async () => {
    setSaving(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/site-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      setMsg(res.ok ? "Hero saved! Refresh the homepage to see changes." : "Error saving.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b border-gray-100 bg-white flex-shrink-0">
        <h1 className="text-lg font-bold text-gray-900">Hero Banner</h1>
        <p className="text-xs text-gray-400 mt-0.5">Edit the full-screen hero shown at the top of the homepage</p>
      </div>
      <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-100 flex-shrink-0">
        {msg ? <p className={`text-sm ${msg.includes("Error") ? "text-red-600" : "text-green-600"}`}>{msg}</p> : <div />}
        <button onClick={save} disabled={saving} className="px-5 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors font-medium">
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl space-y-5">
          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-gray-800">Hero Text</h3>
            <Field label="Main Title" value={config.hero.title} onChange={(v) => setHero("title", v)} />
            <Field label="Subtitle" value={config.hero.subtitle} onChange={(v) => setHero("subtitle", v)} />
            <Field label="CTA Button Label" value={config.hero.ctaLabel} onChange={(v) => setHero("ctaLabel", v)} />
            <Field label="CTA Button Link" value={config.hero.ctaHref} onChange={(v) => setHero("ctaHref", v)} />
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-gray-800">Hero Images</h3>
            <p className="text-xs text-gray-500">These images rotate/slide in the hero section. One URL per line.</p>
            <textarea
              rows={4}
              value={config.hero.images.join("\n")}
              onChange={(e) => setHero("images", e.target.value.split("\n").filter(Boolean))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gray-900/20 resize-none"
              placeholder="/extracted/img-010.jpg&#10;/extracted/img-060.jpg"
            />
            <div className="flex gap-2 flex-wrap">
              {config.hero.images.map((src, i) => (
                <img key={i} src={src} alt="" className="h-20 w-28 rounded-lg border object-cover" />
              ))}
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-gray-800">Announcement Bar</h3>
            <p className="text-xs text-gray-500">The scrolling text at the very top of every page. Use · to separate messages.</p>
            <Field label="Announcement Text" value={config.announcementBar} onChange={(v) => setConfig((c) => ({ ...c, announcementBar: v }))} />
          </div>
        </div>
      </div>
    </div>
  );
}

