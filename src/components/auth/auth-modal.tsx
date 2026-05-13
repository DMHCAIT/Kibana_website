"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useAuth } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function AuthModal() {
  const { showAuthModal, authModalMessage, closeAuthModal, login, signup } = useAuth();
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Reset form on open
  useEffect(() => {
    if (showAuthModal) {
      setEmail("");
      setPassword("");
      setName("");
      setMobile("");
      setError("");
      setTab("login");
    }
  }, [showAuthModal]);

  if (!showAuthModal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    let result: { error?: string };
    if (tab === "login") {
      result = await login(email, password);
    } else {
      if (!name.trim()) {
        setError("Please enter your name.");
        setLoading(false);
        return;
      }
      if (mobile && !/^[0-9]{10}$/.test(mobile)) {
        setError("Please enter a valid 10-digit mobile number.");
        setLoading(false);
        return;
      }
      result = await signup(email, password, name);
    }
    setLoading(false);
    if (result.error) setError(result.error);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && closeAuthModal()}
    >
      <div className="relative w-full sm:max-w-md bg-white sm:mx-4 shadow-2xl rounded-t-2xl sm:rounded-none max-h-[92vh] overflow-y-auto">
        {/* Close */}
        <button
          onClick={closeAuthModal}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-700 transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="px-8 pt-8 pb-6">
          {/* Brand */}
          <p className="font-display text-center tracking-[0.3em] text-sm text-gray-500 mb-1">KIBANA</p>

          {/* Title */}
          <h2 className="text-center font-display text-2xl tracking-wide mb-1">
            {tab === "login" ? "Welcome Back" : "Create Account"}
          </h2>

          {authModalMessage && (
            <p className="text-center text-sm text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 mb-4">
              {authModalMessage}
            </p>
          )}

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-6 mt-4">
            <button
              onClick={() => { setTab("login"); setError(""); }}
              className={cn(
                "flex-1 pb-2 text-sm font-medium tracking-wide transition-colors",
                tab === "login"
                  ? "border-b-2 border-gray-900 text-gray-900"
                  : "text-gray-400 hover:text-gray-600"
              )}
            >
              LOGIN
            </button>
            <button
              onClick={() => { setTab("signup"); setError(""); }}
              className={cn(
                "flex-1 pb-2 text-sm font-medium tracking-wide transition-colors",
                tab === "signup"
                  ? "border-b-2 border-gray-900 text-gray-900"
                  : "text-gray-400 hover:text-gray-600"
              )}
            >
              SIGN UP
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {tab === "signup" && (
              <div>
                <label className="text-xs font-medium uppercase tracking-widest text-gray-500 mb-1 block">
                  Full Name
                </label>
                <Input
                  type="text"
                  placeholder="Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
            )}
            <div>
              <label className="text-xs font-medium uppercase tracking-widest text-gray-500 mb-1 block">
                Mobile Number
              </label>
              <Input
                type="tel"
                placeholder="10-digit mobile number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                className="h-11"
              />
            </div>
            <div>
              <label className="text-xs font-medium uppercase tracking-widest text-gray-500 mb-1 block">
                Email
              </label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>
            <div>
              <label className="text-xs font-medium uppercase tracking-widest text-gray-500 mb-1 block">
                Password
              </label>
              <Input
                type="password"
                placeholder={tab === "signup" ? "Min. 6 characters" : "••••••••"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="mt-2 h-11 w-full rounded-none bg-gray-900 text-white hover:bg-gray-700 font-medium tracking-widest text-xs uppercase"
            >
              {loading ? "Please wait…" : tab === "login" ? "Login" : "Create Account"}
            </Button>
          </form>

          <p className="mt-4 text-center text-xs text-gray-400">
            {tab === "login" ? (
              <>
                Don&apos;t have an account?{" "}
                <button onClick={() => { setTab("signup"); setError(""); }} className="underline text-gray-600 hover:text-gray-900">
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button onClick={() => { setTab("login"); setError(""); }} className="underline text-gray-600 hover:text-gray-900">
                  Log in
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
