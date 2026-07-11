"use client";

import { useEffect, useRef } from "react";
import { trackProductListingView } from "@/lib/analytics";

export function TrackProductListingView({ category, productCount }: { category?: string; productCount?: number }) {
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasTracked.current) return;
    trackProductListingView(category, productCount);
    hasTracked.current = true;
  }, [category, productCount]);

  return null;
}
