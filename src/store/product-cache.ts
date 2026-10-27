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
let pendingRequest: Promise<Product[]> | undefined;
let generation = 0;

export const useProductCache = create<ProductCacheState>()((set, get) => ({
  products: [],
  isLoading: false,
  isCached: false,
  cachedAt: undefined,

  fetch: () => {
    const state = get();
    const now = Date.now();

    // Return cached products if already loaded AND cache hasn't expired
    if (state.isCached && state.cachedAt && now - state.cachedAt < CACHE_TTL_MS) {
      return Promise.resolve(state.products);
    }

    if (pendingRequest) return pendingRequest;
    const requestGeneration = generation;
    set({ isLoading: true });
    const request = (async () => {
      const res = await fetch("/api/products", {
        // Don't cache in HTTP — we'll cache in state
        headers: { "Cache-Control": "no-store" },
      });
      if (!res.ok) throw new Error("Products could not be loaded. Please try again.");
      const products: Product[] = await res.json();
      if (generation === requestGeneration) {
        set({ products, isCached: true, cachedAt: Date.now() });
      }
      return products;
    })()
      .catch((error: unknown) => {
        console.error("Failed to fetch products:", error);
        throw error;
      })
      .finally(() => {
        if (pendingRequest === request) {
          pendingRequest = undefined;
          set({ isLoading: false });
        }
      });
    pendingRequest = request;
    return request;
  },

  get: (id: string) => {
    return get().products.find((p) => p.id === id);
  },

  getAll: () => get().products,

  invalidate: () => {
    generation++;
    pendingRequest = undefined;
    set({ isLoading: false, isCached: false, cachedAt: undefined });
  },
}));
