"use client";

import { create } from "zustand";

// Current logged-in user ID — updated by auth store on login/logout
let _userId: string | null = null;

const storageKey = (uid: string) => `kibana-wishlist-${uid}`;

function loadItems(uid: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(storageKey(uid)) ?? "[]") as string[];
  } catch {
    return [];
  }
}

function saveItems(uid: string, items: string[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(storageKey(uid), JSON.stringify(items));
  } catch {}
}

type WishlistState = {
  items: string[];
  add: (productId: string) => void;
  remove: (productId: string) => void;
  has: (productId: string) => boolean;
  clear: () => void;
  /** Called by auth store after login — loads this user's saved wishlist */
  loadForUser: (userId: string) => void;
  /** Called by auth store on logout — clears state (data already persisted per-add/remove) */
  clearForUser: () => void;
};

export const useWishlist = create<WishlistState>()((set, get) => ({
  items: [],
  add: (productId) => {
    if (get().items.includes(productId)) return;
    const next = [...get().items, productId];
    set({ items: next });
    if (_userId) saveItems(_userId, next);
  },
  remove: (productId) => {
    const next = get().items.filter((id) => id !== productId);
    set({ items: next });
    if (_userId) saveItems(_userId, next);
  },
  has: (productId) => get().items.includes(productId),
  clear: () => set({ items: [] }),
  loadForUser: (userId) => {
    _userId = userId;
    set({ items: loadItems(userId) });
  },
  clearForUser: () => {
    _userId = null;
    set({ items: [] });
  },
}));
