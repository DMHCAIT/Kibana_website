"use client";

import { useEffect, useRef } from "react";
import { trackViewPage } from "@/lib/analytics";

export function TrackPageView({ pageName, pageType }: { pageName: string; pageType: string }) {
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasTracked.current) return;
    trackViewPage(pageName, pageType);
    hasTracked.current = true;
  }, [pageName, pageType]);

  return null;
}
