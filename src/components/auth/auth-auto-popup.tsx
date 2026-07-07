"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/store/auth-store";

/**
 * Triggers the auth modal automatically when the page loads,
 * if the user is not already logged in.
 * Once dismissed (X pressed), it won't re-open in the same session.
 */
export function AuthAutoPopup() {
  const { user, _hasHydrated, openAuthModal } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    // Never show the customer auth modal on admin pages
    if (pathname.startsWith("/admin")) return;
    if (!_hasHydrated) return;
    if (user) return;

    // Only open once per browser session
    const dismissed = sessionStorage.getItem("kibana-auth-dismissed");
    if (dismissed) return;

    openAuthModal();
  }, [_hasHydrated, user, openAuthModal, pathname]);

  return null;
}
