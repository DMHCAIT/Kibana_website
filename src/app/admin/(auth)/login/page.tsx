"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Invalid credentials. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-sm mx-4">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image
            src="/extracted/kibana logo black.png"
            alt="Kibana"
            width={140}
            height={56}
            className="h-12 w-auto"
          />
        </div>

        <h1 className="text-center text-xl font-bold text-gray-900 mb-1">Admin Panel</h1>
        <p className="text-center text-sm text-gray-500 mb-7">Sign in to access the admin panel</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@kibanalife.com"
              className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition-shadow"
              required
              autoFocus
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••"
              className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition-shadow"
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-700 transition-colors disabled:opacity-50 mt-1"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <div className="mt-6 p-3 bg-gray-50 rounded-lg border border-gray-100">
          <p className="text-[11px] text-gray-500 font-semibold mb-1">Default credentials:</p>
          <p className="text-[11px] text-gray-500">Email: <span className="font-mono text-gray-700">admin@kibanalife.com</span></p>
          <p className="text-[11px] text-gray-500">Password: <span className="font-mono text-gray-700">kibana@admin</span></p>
        </div>
      </div>
    </div>
  );
}
