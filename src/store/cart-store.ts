"use client";

import { create } from "zustand";
import type { Product } from "@/types/product";

// Current logged-in user ID — updated by auth store on login/logout
let _userId: string | null = null;

const storageKey = (uid: string) => `kibana-cart-${uid}`;

export type CartItem = {
  product: Product;
  quantity: number;
};

function loadItems(uid: string): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(storageKey(uid)) ?? "[]") as CartItem[];
  } catch {
    return [];
  }
}

function saveItems(uid: string, items: CartItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(storageKey(uid), JSON.stringify(items));
  } catch {}
}

type CartState = {
  items: CartItem[];
  add: (product: Product, quantity?: number) => void;
  remove: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  count: () => number;
  subtotal: () => number;
  /** Called by auth store after login — loads this user's saved cart */
  loadForUser: (userId: string) => void;
  /** Called by auth store on logout — clears state */
  clearForUser: () => void;
};

export const useCart = create<CartState>()((set, get) => ({
  items: [],
  add: (product, quantity = 1) => {
    const state = get();
    const existing = state.items.find((i) => i.product.id === product.id);
    const next = existing
      ? state.items.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i
        )
      : [...state.items, { product, quantity }];
    set({ items: next });
    if (_userId) saveItems(_userId, next);
  },
  remove: (productId) => {
    const next = get().items.filter((i) => i.product.id !== productId);
    set({ items: next });
    if (_userId) saveItems(_userId, next);
  },
  setQuantity: (productId, quantity) => {
    const next = get().items
      .map((i) => (i.product.id === productId ? { ...i, quantity } : i))
      .filter((i) => i.quantity > 0);
    set({ items: next });
    if (_userId) saveItems(_userId, next);
  },
  clear: () => set({ items: [] }),
  count: () => get().items.reduce((acc, i) => acc + i.quantity, 0),
  subtotal: () => get().items.reduce((acc, i) => acc + i.product.price * i.quantity, 0),
  loadForUser: (userId) => {
    _userId = userId;
    set({ items: loadItems(userId) });
  },
  clearForUser: () => {
    _userId = null;
    set({ items: [] });
  },
}));
