"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackViewPage, trackPageViewAPI } from "@/lib/analytics";

export function TrackPageView({ pageName, pageType }: { pageName: string; pageType: string }) {
  const hasTracked = useRef(false);
  const pathname = usePathname();

  useEffect(() => {
    if (hasTracked.current) return;
    trackViewPage(pageName, pageType);
    // Also track to server API
    trackPageViewAPI(pathname, pageName);
    hasTracked.current = true;
  }, [pageName, pageType, pathname]);

  return null;
}
