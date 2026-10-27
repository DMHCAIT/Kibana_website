"use client";

import { useState, useEffect, useRef } from "react";
import { ShoppingBag, Minus, Plus, Heart, Check, X, ArrowRight } from "lucide-react";
import Image from "@/components/ui/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCart } from "@/store/cart-store";
import { useAuth } from "@/store/auth-store";
import { useWishlist } from "@/store/wishlist-store";
import { cn, formatINR, getProductDisplayName } from "@/lib/utils";
import { trackAddToCart } from "@/lib/analytics";
import type { Product } from "@/types/product";
import { productInStock } from "@/lib/product-presentation";

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
  const [adding, setAdding] = useState(false);
  const addingRef = useRef(false);
  const add = useCart((s) => s.add);
  const { user, openAuthModal } = useAuth();
  const { add: addWishlist, remove: removeWishlist, has } = useWishlist();

  // Find the active variant from product using the slug
  const activeVariant = activeVariantSlug
    ? product.colorVariants.find((v) => v.slug === activeVariantSlug)
    : product.colorVariants[0];
  const isOutOfStock = !productInStock(product, activeVariant);

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
    if (isOutOfStock || addingRef.current) return;
    if (!user) {
      openAuthModal("Please log in to add items to your cart.");
      return;
    }

    const colorSlugToUse = activeVariantSlug ?? activeVariant?.slug;
    const variantToAdd = activeVariant;

    addingRef.current = true;
    setAdding(true);
    setAddedNotification(false);
    try {
      await add(product, qty, colorSlugToUse);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Could not add this colour to your cart.");
      return;
    } finally {
      addingRef.current = false;
      setAdding(false);
    }

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
    <div className="w-full min-w-0">
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
                  Qty: {qty} · {formatINR((addedVariant?.price ?? product.price) * qty)}
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

      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex">
        {!isOutOfStock && (
          <div
            className="col-span-2 flex h-12 w-fit shrink-0 items-center rounded-full border border-border"
            aria-label="Quantity"
          >
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="flex h-11 w-9 items-center justify-center rounded-l-full transition-colors hover:bg-muted sm:w-10"
              aria-label="Decrease quantity"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="min-w-6 text-center text-xs font-medium" aria-live="polite">
              {qty}
            </span>
            <button
              type="button"
              onClick={() => setQty((q) => q + 1)}
              className="flex h-11 w-9 items-center justify-center rounded-r-full transition-colors hover:bg-muted sm:w-10"
              aria-label="Increase quantity"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
        <Button
          size="lg"
          className="min-w-0 flex-1 rounded-full px-3 text-[10px] font-normal tracking-[0.16em] sm:px-5 sm:text-xs"
          onClick={handleAddToCart}
          disabled={isOutOfStock || adding}
          aria-busy={adding}
        >
          <ShoppingBag className="h-4 w-4 shrink-0" aria-hidden="true" />
          {isOutOfStock ? "Out of Stock" : adding ? "Adding..." : "Add to Cart"}
        </Button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="h-12 w-12 shrink-0 border-0 bg-transparent p-0 text-foreground shadow-none hover:bg-transparent hover:text-foreground"
          onClick={handleWishlist}
          aria-label={inWishlist ? "Remove from wishlist" : "Save to wishlist"}
          aria-pressed={inWishlist}
        >
          <Heart
            className={cn(
              "h-6 w-6",
              inWishlist ? "fill-red-500 text-red-500" : "text-foreground/70",
            )}
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </Button>
      </div>
    </div>
  );
}
