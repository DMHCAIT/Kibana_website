"use client";

import { create } from "zustand";
import type { Product } from "@/types/product";
import { useAuth } from "@/store/auth-store";
import { useProductCache } from "@/store/product-cache";
import { trackAddToCart } from "@/lib/analytics";

export type CartItem = {
  product: Product;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  isLoading: boolean;
  add: (product: Product, quantity?: number) => Promise<void>;
  remove: (productId: string) => Promise<void>;
  setQuantity: (productId: string, quantity: number) => Promise<void>;
  clear: () => void;
  count: () => number;
  subtotal: () => number;
  /** Called by auth store after login — loads this user's saved cart from API */
  loadForUser: (userId: string) => Promise<void>;
  /** Called by auth store on logout — clears state */
  clearForUser: () => void;
};

export const useCart = create<CartState>()((set, get) => ({
  items: [],
  isLoading: false,

  add: async (product, quantity = 1) => {
    // Get the current user from auth store
    const user = useAuth.getState().user;
    if (!user) return;

    // OPTIMISTIC UPDATE: Update UI immediately
    const state = get();
    const existing = state.items.find((i) => i.product.id === product.id);
    const next = existing
      ? state.items.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i,
        )
      : [...state.items, { product, quantity }];
    set({ items: next });
    trackAddToCart(product, quantity);

    // SYNC WITH SERVER in background (fire and forget)
    fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id, quantity }),
    }).catch((error) => {
      console.error("Failed to sync cart to server:", error);
    });
  },

  remove: async (productId) => {
    const user = useAuth.getState().user;
    if (!user) return;

    // OPTIMISTIC UPDATE: Remove immediately
    const next = get().items.filter((i) => i.product.id !== productId);
    set({ items: next });

    // SYNC WITH SERVER in background
    fetch(`/api/cart?productId=${productId}`, { method: "DELETE" }).catch((error) => {
      console.error("Failed to sync cart to server:", error);
    });
  },

  setQuantity: async (productId, quantity) => {
    const user = useAuth.getState().user;
    if (!user) return;

    // OPTIMISTIC UPDATE: Update quantity immediately
    const next = get()
      .items.map((i) => (i.product.id === productId ? { ...i, quantity } : i))
      .filter((i) => i.quantity > 0);
    set({ items: next });

    // SYNC WITH SERVER in background
    if (quantity === 0) {
      fetch(`/api/cart?productId=${productId}`, { method: "DELETE" }).catch((error) => {
        console.error("Failed to sync cart to server:", error);
      });
    } else {
      fetch("/api/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      }).catch((error) => {
        console.error("Failed to sync cart to server:", error);
      });
    }
  },

  clear: () => set({ items: [] }),

  count: () => get().items.reduce((acc, i) => acc + i.quantity, 0),

  subtotal: () => get().items.reduce((acc, i) => acc + i.product.price * i.quantity, 0),

  loadForUser: async (_userId) => {
    set({ isLoading: true });

    try {
      // Fetch products from cache (or fetch if not cached)
      const productsPromise = useProductCache.getState().fetch();

      // Fetch cart items from API
      const cartRes = await fetch("/api/cart");

      if (cartRes.ok) {
        const cartData = await cartRes.json();
        const products = await productsPromise;

        console.log("Loaded cart from database:", cartData);

        // Map cart items to CartItem format
        const mappedItems: CartItem[] = cartData
          .map((cartItem: { productId: string; quantity: number }) => {
            const product = products.find((p: Product) => p.id === cartItem.productId);
            if (!product) return null;
            return {
              product,
              quantity: cartItem.quantity,
            };
          })
          .filter((item: CartItem | null) => item !== null);

        set({ items: mappedItems });
      }
    } catch (error) {
      console.error("Failed to load cart from API:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  clearForUser: () => {
    set({ items: [] });
  },
}));
