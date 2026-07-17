"use client";

import { useState, useEffect } from "react";
import { ShoppingBag, Minus, Plus, Heart, Check, X, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCart } from "@/store/cart-store";
import { useAuth } from "@/store/auth-store";
import { useWishlist } from "@/store/wishlist-store";
import { cn, formatINR, getProductDisplayName } from "@/lib/utils";
import { trackAddToCart } from "@/lib/analytics";
import type { Product } from "@/types/product";

interface AddToCartButtonProps {
  product: Product;
  activeVariantSlug?: string;
}

export function AddToCartButton({ product, activeVariantSlug }: AddToCartButtonProps) {
  const [qty, setQty] = useState(1);
  const [inWishlist, setInWishlist] = useState(false);
  const [addedNotification, setAddedNotification] = useState(false);
  const [addedVariant, setAddedVariant] = useState<Product["colorVariants"][number] | undefined>(
    undefined,
  );
  const add = useCart((s) => s.add);
  const { user, openAuthModal } = useAuth();
  const { add: addWishlist, remove: removeWishlist, has } = useWishlist();

  // Find the active variant from product using the slug
  const activeVariant = product.colorVariants?.find((v) => v.slug === activeVariantSlug);
  const isOutOfStock = activeVariant?.inStock === false;

  // Log the received props
  console.log(
    "🛒 ADD-TO-CART BUTTON - Props received:",
    JSON.stringify(
      {
        productId: product.id,
        productName: product.name,
        activeVariantSlugReceived: activeVariantSlug,
        activeVariantFound: !!activeVariant,
        activeVariantTitle: activeVariant?.productTitle,
        productColorVariantsCount: product.colorVariants?.length,
        productColorVariants: product.colorVariants?.map((v) => ({
          slug: v.slug,
          title: v.productTitle,
        })),
      },
      null,
      2,
    ),
  );

  useEffect(() => {
    const itemKey = activeVariantSlug ? `${product.id}-${activeVariantSlug}` : product.id;
    setInWishlist(has(itemKey));
  }, [has, product.id, activeVariantSlug]);

  function handleWishlist() {
    if (!user) {
      openAuthModal("Please log in to save items to your wishlist.");
      return;
    }
    const itemKey = activeVariant?.slug ? `${product.id}-${activeVariant.slug}` : product.id;
    if (inWishlist) {
      removeWishlist(itemKey);
      setInWishlist(false);
    } else {
      addWishlist(itemKey);
      setInWishlist(true);
    }
  }

  async function handleAddToCart() {
    if (!user) {
      openAuthModal("Please log in to add items to your cart.");
      return;
    }

    // CRITICAL: Get the current color from URL in real-time
    // This ensures we're using the exact color the user selected, not a cached prop value
    const urlParams = new URLSearchParams(window.location.search);
    const colorFromUrl = urlParams.get("color");

    // Priority order:
    // 1. Color from URL (what the user clicked)
    // 2. activeVariantSlug prop (from server)
    // 3. activeVariant?.slug (computed from prop)
    // 4. First variant slug (fallback)
    const colorSlugToUse =
      colorFromUrl || activeVariantSlug || activeVariant?.slug || product.colorVariants?.[0]?.slug;

    // Find the variant using the determined color slug
    const variantToAdd =
      product.colorVariants?.find((v) => v.slug === colorSlugToUse) || product.colorVariants?.[0];

    console.log(
      "🛒 ADD TO CART DEBUG - Full Trace:",
      JSON.stringify(
        {
          productId: product.id,
          colorFromUrl,
          activeVariantSlug_fromProps: activeVariantSlug,
          activeVariant_slug: activeVariant?.slug,
          firstVariant_slug: product.colorVariants?.[0]?.slug,
          colorSlugToUse_final: colorSlugToUse,
          variantToAdd_slug: variantToAdd?.slug,
          variantToAdd_productTitle: variantToAdd?.productTitle,
          qty,
          totalColorVariants: product.colorVariants?.length,
        },
        null,
        2,
      ),
    );

    // Pass the color slug to cart
    await add(product, qty, colorSlugToUse);

    // Track AddToCart event for Meta Pixel & Conversions API
    const variantPrice = variantToAdd?.price ?? product.price;
    const variantColor = variantToAdd?.color;
    trackAddToCart(product, qty, user.id, user.email, variantPrice, variantColor);

    // Save the variant that was added for the notification
    setAddedVariant(variantToAdd);
    setAddedNotification(true);
    setTimeout(() => setAddedNotification(false), 4000);
  }

  return (
    <div className="w-full min-w-0 space-y-4">
      {/* Added to cart notification */}
      {addedNotification && (
        <div className="fixed bottom-24 right-4 z-50 flex w-[calc(100vw-2rem)] max-w-sm items-start gap-3 rounded-xl border border-border bg-white p-4 shadow-xl duration-300 animate-in slide-in-from-bottom-4 sm:bottom-6">
          <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100">
            <Check className="h-4 w-4 text-emerald-700" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">Added to cart!</p>
            <div className="mt-1.5 flex items-center gap-2.5">
              <div className="relative h-10 w-9 shrink-0 overflow-hidden rounded bg-muted">
                <Image
                  src={addedVariant?.image || product.image}
                  alt={product.name}
                  fill
                  sizes="36px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium">
                  {getProductDisplayName(product, addedVariant)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Qty: {qty} · {formatINR(product.price * qty)}
                </p>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <Link
                href="/cart"
                className="flex-1 rounded bg-foreground px-3 py-2 text-center text-xs font-semibold text-background transition-colors hover:bg-foreground/90"
              >
                View Cart
              </Link>
              <Link
                href="/checkout"
                className="flex flex-1 items-center justify-center gap-1 rounded bg-kibana-tan px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-kibana-tan/90"
              >
                Checkout <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAddedNotification(false)}
            className="flex-shrink-0 text-muted-foreground hover:text-foreground"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {!isOutOfStock && (
        <>
          {/* Quantity selector */}
          <div className="flex items-center gap-4">
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Quantity
            </span>
            <div className="flex items-center border border-border">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="px-3 py-2 transition-colors hover:bg-muted"
                aria-label="Decrease quantity"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="min-w-[3rem] px-5 py-2 text-center text-sm font-medium">{qty}</span>
              <button
                type="button"
                onClick={() => setQty((q) => q + 1)}
                className="px-3 py-2 transition-colors hover:bg-muted"
                aria-label="Increase quantity"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        <Button
          size="lg"
          className="flex-1 rounded-none text-xs sm:text-sm"
          onClick={handleAddToCart}
          disabled={isOutOfStock}
        >
          <ShoppingBag className="h-4 w-4 shrink-0" />
          {isOutOfStock ? "Out of Stock" : "Add to Cart"}
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="shrink-0 rounded-none px-3 sm:px-4"
          onClick={handleWishlist}
          aria-label={inWishlist ? "Remove from wishlist" : "Save to wishlist"}
        >
          <Heart className={cn("h-4 w-4", inWishlist ? "fill-red-500 text-red-500" : "")} />
        </Button>
      </div>
    </div>
  );
}
