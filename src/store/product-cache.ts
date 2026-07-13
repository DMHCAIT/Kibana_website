"use client";

import { create } from "zustand";
import type { Product } from "@/types/product";

type ProductCacheState = {
  products: Product[];
  isLoading: boolean;
  isCached: boolean;
  cachedAt?: number; // Timestamp of last cache
  fetch: () => Promise<Product[]>;
  get: (id: string) => Product | undefined;
  getAll: () => Product[];
  invalidate: () => void; // Manually invalidate cache
};

const CACHE_TTL_MS = 30000; // 30 seconds — matches server-side cache TTL

export const useProductCache = create<ProductCacheState>()((set, get) => ({
  products: [],
  isLoading: false,
  isCached: false,
  cachedAt: undefined,

  fetch: async () => {
    const state = get();
    const now = Date.now();
    
    // Return cached products if already loaded AND cache hasn't expired
    if (
      state.isCached &&
      state.products.length > 0 &&
      state.cachedAt &&
      now - state.cachedAt < CACHE_TTL_MS
    ) {
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
        set({ products, isCached: true, cachedAt: Date.now() });
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

  invalidate: () => {
    set({ products: [], isCached: false, cachedAt: undefined });
  },
}));
