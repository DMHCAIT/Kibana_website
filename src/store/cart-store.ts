"use client";

import { create } from "zustand";
import type { Product } from "@/types/product";
import { useAuth } from "@/store/auth-store";
import { useProductCache } from "@/store/product-cache";
import { trackAddToCart } from "@/lib/analytics";

export type CartItem = {
  product: Product;
  quantity: number;
  selectedColorSlug?: string; // LEGACY: Track which color variant was selected
  variantId?: string; // NEW: Unique variant identifier (productId + "-" + colorSlug)
};

// Helper: Generate variantId from productId and colorSlug
export function generateVariantId(productId: string, colorSlug?: string): string {
  if (!colorSlug) return `${productId}-default`;
  return `${productId}-${colorSlug}`;
}

type CartState = {
  items: CartItem[];
  isLoading: boolean;
  add: (product: Product, quantity?: number, colorSlug?: string) => Promise<void>;
  remove: (productId: string, colorSlug?: string) => Promise<void>;
  setQuantity: (productId: string, quantity: number, colorSlug?: string) => Promise<void>;
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

  add: async (product, quantity = 1, colorSlug?) => {
    // Get the current user from auth store
    const user = useAuth.getState().user;
    if (!user) return;

    // CRITICAL: If no colorSlug provided but product has variants, use the first one
    // This ensures every variant-enabled product always has a specific variant, never "default"
    let finalColorSlug = colorSlug;
    if (!finalColorSlug && product.colorVariants && product.colorVariants.length > 0) {
      finalColorSlug = product.colorVariants[0].slug;
      console.log(
        "🛒 CART-STORE ADD DEBUG - NO COLOR PROVIDED, USING FIRST VARIANT:",
        JSON.stringify(
          {
            productId: product.id,
            defaultColorSlug: finalColorSlug,
            firstVariantTitle: product.colorVariants[0].productTitle,
          },
          null,
          2,
        ),
      );
    }

    const variantId = generateVariantId(product.id, finalColorSlug);

    console.log(
      "🛒 CART-STORE ADD DEBUG:",
      JSON.stringify(
        {
          productId: product.id,
          colorSlugParam: colorSlug,
          finalColorSlug,
          variantId,
          productVariants: product.colorVariants?.map((v) => ({
            slug: v.slug,
            variantId: v.variantId,
          })),
        },
        null,
        2,
      ),
    );

    // OPTIMISTIC UPDATE: Update UI immediately
    const state = get();
    const existing = state.items.find(
      (i) => i.product.id === product.id && i.variantId === variantId,
    );
    const next = existing
      ? state.items.map((i) =>
          i.product.id === product.id && i.variantId === variantId
            ? { ...i, quantity: i.quantity + quantity }
            : i,
        )
      : [...state.items, { product, quantity, selectedColorSlug: finalColorSlug, variantId }];

    console.log(
      "🛒 CART-STORE ADD DEBUG - State updated:",
      JSON.stringify(
        {
          existingItemFound: !!existing,
          newQuantityForItem: existing ? existing.quantity + quantity : quantity,
          totalItemsInCart: next.length,
          itemKeys: next.map((i) => `${i.variantId}`),
        },
        null,
        2,
      ),
    );

    set({ items: next });
    trackAddToCart(product, quantity);

    // SYNC WITH SERVER in background (fire and forget)
    // Send both color slug and variantId for redundancy
    fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: product.id,
        quantity,
        color: finalColorSlug,
        variantId: variantId,
      }),
    }).catch((error) => {
      console.error("Failed to sync cart to server:", error);
    });
  },

  remove: async (productId, colorSlug?) => {
    const user = useAuth.getState().user;
    if (!user) return;

    const variantId = generateVariantId(productId, colorSlug);

    // OPTIMISTIC UPDATE: Remove immediately
    const next = get().items.filter(
      (i) => !(i.product.id === productId && i.variantId === variantId),
    );
    set({ items: next });

    // SYNC WITH SERVER in background
    fetch("/api/cart", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, variantId, color: colorSlug }),
    }).catch((error) => {
      console.error("Failed to sync cart to server:", error);
    });
  },

  setQuantity: async (productId, quantity, colorSlug?) => {
    const user = useAuth.getState().user;
    if (!user) return;

    const variantId = generateVariantId(productId, colorSlug);

    // OPTIMISTIC UPDATE: Update quantity immediately
    const next = get()
      .items.map((i) =>
        i.product.id === productId && i.variantId === variantId ? { ...i, quantity } : i,
      )
      .filter((i) => i.quantity > 0);
    set({ items: next });

    // SYNC WITH SERVER in background
    if (quantity === 0) {
      fetch("/api/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, variantId, color: colorSlug }),
      }).catch((error) => {
        console.error("Failed to sync cart to server:", error);
      });
    } else {
      fetch("/api/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity, variantId, color: colorSlug }),
      }).catch((error) => {
        console.error("Failed to sync cart to server:", error);
      });
    }
  },

  clear: () => {
    // Clear local state immediately
    set({ items: [] });

    // Sync with server to remove all cart items
    fetch("/api/cart/clear", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    }).catch((error) => {
      console.error("Failed to clear cart on server:", error);
    });
  },

  count: () => get().items.reduce((acc, i) => acc + i.quantity, 0),

  subtotal: () => get().items.reduce((acc, i) => acc + i.product.price * i.quantity, 0),

  loadForUser: async (_userId) => {
    set({ isLoading: true });

    try {
      // CRITICAL: Invalidate product cache to ensure we have the latest product data
      useProductCache.getState().invalidate();

      // Fetch fresh products from cache (will refetch if invalidated)
      const productsPromise = useProductCache.getState().fetch();

      // Fetch cart items from API
      const cartRes = await fetch("/api/cart");

      if (cartRes.ok) {
        const cartData = await cartRes.json();
        const products = await productsPromise;

        console.log("🛒 CART-STORE LOAD DEBUG - Raw from API:", JSON.stringify(cartData, null, 2));

        // Map cart items to CartItem format
        // CRITICAL: Use EXACT variantId/color from database - NO DEFAULTS
        const mappedItems: CartItem[] = cartData
          .map(
            (cartItem: {
              productId: string;
              quantity: number;
              color?: string | null;
              variantId?: string;
            }) => {
              const product = products.find((p: Product) => p.id === cartItem.productId);
              if (!product) {
                console.warn("⚠️ Product not found in cache:", cartItem.productId);
                return null;
              }

              // Prefer variantId if available, fall back to color slug
              const colorSlug = cartItem.color;
              const variantId =
                cartItem.variantId || generateVariantId(cartItem.productId, colorSlug || undefined);

              console.log(
                "🛒 CART-STORE LOAD DEBUG - Item mapping:",
                JSON.stringify(
                  {
                    productId: cartItem.productId,
                    colorFromDB: cartItem.color,
                    variantIdFromDB: cartItem.variantId,
                    computedVariantId: variantId,
                    variantSlugs: product.colorVariants?.map((v) => v.slug),
                  },
                  null,
                  2,
                ),
              );

              return {
                product,
                quantity: cartItem.quantity,
                selectedColorSlug: colorSlug || undefined, // Legacy field
                variantId, // New primary identifier
              };
            },
          )
          .filter((item: CartItem | null) => item !== null);

        console.log(
          "🛒 CART-STORE LOAD DEBUG - Final items:",
          JSON.stringify(
            mappedItems.map((i) => ({
              productId: i.product.id,
              variantId: i.variantId,
              selectedColorSlug: i.selectedColorSlug,
            })),
            null,
            2,
          ),
        );

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
