"use client";

import { create } from "zustand";
import type { Product } from "@/types/product";
import { useAuth } from "@/store/auth-store";
import { useProductCache } from "@/store/product-cache";
import { trackAddToCart } from "@/lib/analytics";
import { getProductDisplayName } from "@/lib/utils";
import {
  orderItemFromCart,
  selectedProductVariant,
  unavailableProductSelection,
} from "@/lib/product-presentation";

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
    if (unavailableProductSelection(product, colorSlug)) {
      throw new Error("This colour is no longer available. Please choose another colour.");
    }

    // CRITICAL: If no colorSlug provided but product has variants, use the first one
    // This ensures every variant-enabled product always has a specific variant, never "default"
    let finalColorSlug = colorSlug;
    if (!finalColorSlug && product.colorVariants && product.colorVariants.length > 0) {
      finalColorSlug = product.colorVariants[0].slug;
    }

    const variantId = generateVariantId(product.id, finalColorSlug);

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

    set({ items: next });

    // Track analytics with complete variant information
    const variant = product.colorVariants?.find((v) => v.slug === finalColorSlug);
    const variantPrice = variant?.price ?? product.price;
    const variantColor = variant?.color;

    // Get complete product name with color and variant image for storage and tracking
    const displayName = getProductDisplayName(product, variant);
    const displayImage = variant?.image || product.image;

    // Track add to cart with complete variant details (variantId, productName, productImage)
    trackAddToCart(
      product,
      quantity,
      undefined, // userId - will be added by auth store if available
      undefined, // userEmail - will be added by auth store if available
      variantPrice,
      variantColor,
      variantId, // NEW: Unique variant identifier (productId-colorSlug)
      displayName, // NEW: Complete product display name with color (as stored in DB)
      displayImage, // NEW: Variant-specific image URL
    );

    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          quantity,
          color: finalColorSlug,
          variantId,
          productName: displayName,
          productImage: displayImage,
        }),
      });
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error || "Failed to save the selected colour to your cart.");
      }
    } catch (error) {
      set((current) => ({
        items: current.items.flatMap((item) =>
          item.product.id === product.id && item.variantId === variantId
            ? item.quantity > quantity
              ? [{ ...item, quantity: item.quantity - quantity }]
              : []
            : [item],
        ),
      }));
      console.error("Failed to sync cart to server:", error);
      throw error;
    }
  },

  remove: async (productId, colorSlug?) => {
    const user = useAuth.getState().user;
    if (!user) return;

    const variantId =
      get().items.find(
        (item) => item.product.id === productId && item.selectedColorSlug === colorSlug,
      )?.variantId ?? generateVariantId(productId, colorSlug);

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

    const variantId =
      get().items.find(
        (item) => item.product.id === productId && item.selectedColorSlug === colorSlug,
      )?.variantId ?? generateVariantId(productId, colorSlug);

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

  subtotal: () => get().items.reduce((acc, i) => acc + orderItemFromCart(i).price * i.quantity, 0),

  loadForUser: async (_userId) => {
    set({ isLoading: true });

    try {
      // CRITICAL: Invalidate product cache to ensure we have the latest product data
      useProductCache.getState().invalidate();

      // Fetch fresh products from cache (will refetch if invalidated)
      const [products, cartRes] = await Promise.all([
        useProductCache.getState().fetch(),
        fetch("/api/cart"),
      ]);

      if (cartRes.ok) {
        const cartData = await cartRes.json();

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
              const colorSlug =
                cartItem.color ||
                selectedProductVariant(product, undefined, cartItem.variantId)?.slug;
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
