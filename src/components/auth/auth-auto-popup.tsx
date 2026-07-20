"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/store/auth-store";

/**
 * Triggers the auth modal automatically when the page loads,
 * if the user is not already logged in.
 * Shows for 10 seconds then auto-closes.
 */
export function AuthAutoPopup() {
  const { user, _hasHydrated, openAuthModal, closeAuthModal } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    // Never show the customer auth modal on admin pages
    if (pathname.startsWith("/admin")) return;
    if (!_hasHydrated) return;
    if (user) return;

    // Only open once per browser session
    const dismissed = sessionStorage.getItem("kibana-auth-dismissed");
    if (dismissed) return;

    // Show auth modal after 10 seconds
    const openTimer = setTimeout(() => {
      openAuthModal();

      // Auto-close modal after 10 seconds
      const closeTimer = setTimeout(() => {
        closeAuthModal();
      }, 10000);

      return () => clearTimeout(closeTimer);
    }, 10000);

    return () => clearTimeout(openTimer);
  }, [_hasHydrated, user, openAuthModal, closeAuthModal, pathname]);

  return null;
}
