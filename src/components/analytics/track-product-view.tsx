"use client";

import { useEffect } from "react";
import { useRef } from "react";
import { trackViewContent } from "@/lib/analytics";
import type { Product } from "@/types/product";

export function TrackProductView({
  product,
  variant,
}: {
  product: Product;
  variant?: Product["colorVariants"][number];
}) {
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasTracked.current) return;
    const variantPrice = variant?.price ?? product.price;
    const variantColor = variant?.color;
    trackViewContent(product, variantPrice, variantColor);
    hasTracked.current = true;
  }, [product, variant]);

  return null;
}
