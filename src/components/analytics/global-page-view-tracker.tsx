"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackPageViewAPI } from "@/lib/analytics";

/**
 * Global Page View Tracker
 * Automatically tracks every route change to the server API
 * This runs on all pages and sends page view data to /api/analytics/conversion
 */
export function GlobalPageViewTracker() {
  const pathname = usePathname();
  const previousPathRef = useRef<string | null>(null);

  useEffect(() => {
    // Only track if path has actually changed
    if (previousPathRef.current === pathname) return;

    previousPathRef.current = pathname;

    // Track page view to server API
    trackPageViewAPI(pathname);
  }, [pathname]);

  return null;
}
