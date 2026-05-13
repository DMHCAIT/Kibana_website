"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type WishlistState = {
  items: string[];
  add: (productId: string) => void;
  remove: (productId: string) => void;
  has: (productId: string) => boolean;
  clear: () => void;
};

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (productId) =>
        set((state) => {
          if (state.items.includes(productId)) {
            return state;
          }
          return { items: [...state.items, productId] };
        }),
      remove: (productId) =>
        set((state) => ({ items: state.items.filter((id) => id !== productId) })),
      has: (productId) => get().items.includes(productId),
      clear: () => set({ items: [] }),
    }),
    { name: "kibana-wishlist" },
  ),
);
