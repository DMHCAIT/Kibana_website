"use client";

import { useEffect } from "react";
import { useRef } from "react";
import { trackViewContent } from "@/lib/analytics";
import type { Product } from "@/types/product";

export function TrackProductView({ product }: { product: Product }) {
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasTracked.current) return;
    trackViewContent(product);
    hasTracked.current = true;
  }, [product]);

  return null;
}
