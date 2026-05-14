"use client";

import { useEffect, useState } from "react";
import { Cookie, X } from "lucide-react";
import { useAuth } from "@/store/auth-store";

const COOKIE_KEY = "kibana-cookies-accepted";

export function CookiesBanner() {
  const [visible, setVisible] = useState(false);
  const { showAuthModal, _hasHydrated } = useAuth();

  useEffect(() => {
    if (!_hasHydrated) return;
    // Don't show while auth modal is open
    if (showAuthModal) return;
    const accepted = localStorage.getItem(COOKIE_KEY);
    if (!accepted) setVisible(true);
  }, [_hasHydrated, showAuthModal]);

  const accept = () => {
    localStorage.setItem(COOKIE_KEY, "1");
    setVisible(false);
  };

  const deny = () => {
    localStorage.setItem(COOKIE_KEY, "denied");
    setVisible(false);
  };

  const dismiss = () => {
    setVisible(false);
  };

  if (!visible) return null;

  return (
    // Full-width bottom bar, desktop only
    <div className="hidden md:block fixed bottom-0 left-0 right-0 z-[90] w-full bg-white border-t border-gray-200 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
      <div className="max-w-screen-xl mx-auto px-8 py-5 flex items-center gap-8">
        {/* Icon + Text */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <Cookie className="h-5 w-5 text-kibana-tan shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-1">Crafted for Your Experience</p>
            <p className="text-xs text-gray-500 leading-relaxed">
              We use cookies to enhance your browsing experience, improve website performance, remember your preferences,
              and provide a seamless luxury shopping experience for our vegan leather handbag collection.
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={accept}
            className="h-10 px-6 bg-gray-900 text-white text-xs font-semibold uppercase tracking-widest hover:bg-gray-700 transition-colors"
          >
            Accept All Cookies
          </button>
          <button
            onClick={deny}
            className="h-10 px-6 border border-gray-300 text-gray-600 text-xs font-semibold uppercase tracking-widest hover:bg-gray-50 transition-colors"
          >
            Deny
          </button>
        </div>

        {/* Close / dismiss */}
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="shrink-0 text-gray-400 hover:text-gray-700 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
