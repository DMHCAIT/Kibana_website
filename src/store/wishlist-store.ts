"use client";

import { create } from "zustand";

let _userId: string | null = null;

type WishlistState = {
  items: string[]; // Now stores variant keys like "prod-id-color-slug" or just "prod-id"
  isLoading: boolean;
  add: (itemKey: string) => Promise<void>; // itemKey can be productId or productId-variantSlug
  remove: (itemKey: string) => Promise<void>; // itemKey can be productId or productId-variantSlug
  has: (itemKey: string) => boolean;
  clear: () => void;
  /** Called by auth store after login — loads this user's saved wishlist from API */
  loadForUser: (userId: string) => Promise<void>;
  /** Called by auth store on logout — clears state */
  clearForUser: () => void;
};

export const useWishlist = create<WishlistState>()((set, get) => ({
  items: [],
  isLoading: false,

  add: async (productId) => {
    if (get().items.includes(productId)) return;

    // OPTIMISTIC UPDATE: Add immediately
    const next = [...get().items, productId];
    set({ items: next });

    // SYNC WITH SERVER in background
    if (_userId) {
      fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      }).catch((error) => {
        console.error("Failed to sync wishlist to server:", error);
      });
    }
  },

  remove: async (productId) => {
    // OPTIMISTIC UPDATE: Remove immediately
    const next = get().items.filter((id) => id !== productId);
    set({ items: next });

    // SYNC WITH SERVER in background
    if (_userId) {
      fetch(`/api/wishlist?productId=${encodeURIComponent(productId)}`, { method: "DELETE" }).catch(
        (error) => {
          console.error("Failed to sync wishlist to server:", error);
        },
      );
    }
  },

  has: (productId) => get().items.includes(productId),

  clear: () => set({ items: [] }),

  loadForUser: async (userId) => {
    _userId = userId;
    set({ isLoading: true });

    try {
      const res = await fetch("/api/wishlist");
      if (res.ok) {
        const data = await res.json();
        set({ items: data || [] });
      }
    } catch (error) {
      console.error("Failed to load wishlist from API:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  clearForUser: () => {
    _userId = null;
    set({ items: [] });
  },
}));
