"use client";

import { create } from "zustand";
import type { Product } from "@/types/product";

type ProductCacheState = {
  products: Product[];
  isLoading: boolean;
  isCached: boolean;
  fetch: () => Promise<Product[]>;
  get: (id: string) => Product | undefined;
  getAll: () => Product[];
};

export const useProductCache = create<ProductCacheState>()((set, get) => ({
  products: [],
  isLoading: false,
  isCached: false,

  fetch: async () => {
    const state = get();
    // Return cached products if already loaded
    if (state.isCached && state.products.length > 0) {
      return state.products;
    }

    set({ isLoading: true });
    try {
      const res = await fetch("/api/products", {
        // Don't cache in HTTP — we'll cache in state
        headers: { "Cache-Control": "no-store" },
      });
      if (res.ok) {
        const products = await res.json();
        set({ products, isCached: true });
        return products;
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      set({ isLoading: false });
    }
    return state.products;
  },

  get: (id: string) => {
    return get().products.find((p) => p.id === id);
  },

  getAll: () => get().products,
}));
