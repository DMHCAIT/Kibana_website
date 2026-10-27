"use client";

import { useState } from "react";
import { ShoppingBag, Heart, Check, X, ArrowRight } from "lucide-react";
import Image from "@/components/ui/image";
import Link from "next/link";
import { useCart } from "@/store/cart-store";
import { useWishlist } from "@/store/wishlist-store";
import { useAuth } from "@/store/auth-store";
import { formatINR } from "@/lib/utils";
import { DeliveryCheck } from "./delivery-check";
import type { Product } from "@/types/product";

export function MobileProductCTA({ product }: { product: Product }) {
  const [showDelivery, setShowDelivery] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const [addedNotification, setAddedNotification] = useState(false);
  const add = useCart((s) => s.add);
  const { add: addWishlist, remove: removeWishlist, has } = useWishlist();
  const { user, openAuthModal } = useAuth();

  function handleWishlist() {
    if (!user) {
      openAuthModal("Please log in to save items to your wishlist.");
      return;
    }
    const current = has(product.id);
    if (current) {
      removeWishlist(product.id);
      setInWishlist(false);
    } else {
      addWishlist(product.id);
      setInWishlist(true);
    }
  }

  function handleAddToCart() {
    add(product, 1);
    setAddedNotification(true);
    setTimeout(() => setAddedNotification(false), 4000);
  }

  return (
    <>
      {/* Added to cart notification */}
      {addedNotification && (
        <div className="fixed left-4 right-4 top-4 z-[70] flex items-start gap-3 rounded-xl border border-border bg-white p-3 shadow-xl duration-300 animate-in slide-in-from-top-4 sm:hidden">
          <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100">
            <Check className="h-3.5 w-3.5 text-emerald-700" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Added to cart!</p>
            <div className="mt-1 flex items-center gap-2">
              <div className="relative h-8 w-7 shrink-0 overflow-hidden rounded bg-muted">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="28px"
                  className="object-cover"
                />
              </div>
              <p className="truncate text-xs text-muted-foreground">
                {product.name} · {formatINR(product.price)}
              </p>
            </div>
            <div className="mt-2 flex gap-2">
              <Link
                href="/cart"
                className="flex-1 rounded bg-foreground px-3 py-1.5 text-center text-xs font-semibold text-background transition-colors hover:bg-foreground/90"
              >
                View Cart
              </Link>
              <Link
                href="/checkout"
                className="flex flex-1 items-center justify-center gap-1 rounded bg-kibana-tan px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-kibana-tan/90"
              >
                Checkout <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAddedNotification(false)}
            className="shrink-0 text-muted-foreground"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Delivery drawer sheet */}
      {showDelivery && (
        <div className="fixed inset-0 z-50 flex items-end sm:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowDelivery(false)} />
          <div className="relative w-full space-y-4 rounded-t-2xl bg-white px-5 pb-8 pt-5">
            <div className="mb-1 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Delivery Details</h3>
              <button
                onClick={() => setShowDelivery(false)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Close
              </button>
            </div>
            <DeliveryCheck />
          </div>
        </div>
      )}

      {/* Sticky bottom bar — mobile only */}
      <div className="fixed inset-x-0 bottom-[52px] z-[60] border-t border-border bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.08)] sm:hidden">
        {/* Product name + price strip */}
        <div className="flex items-center justify-between border-b border-border/50 px-4 py-2">
          <p className="max-w-[55%] truncate text-xs font-medium">{product.name}</p>
          <div className="flex shrink-0 items-center gap-1.5">
            <span className="text-sm font-bold">{formatINR(product.price)}</span>
            {product.compareAtPrice && (
              <span className="hidden text-xs text-muted-foreground line-through xs:inline">
                {formatINR(product.compareAtPrice)}
              </span>
            )}
          </div>
        </div>

        {/* Action row */}
        <div className="flex items-stretch gap-0 px-3 py-2.5">
          {/* Delivery check trigger */}
          <button
            onClick={() => setShowDelivery(true)}
            className="mr-2 shrink-0 whitespace-nowrap border border-border px-2.5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-kibana-camel transition-colors hover:bg-muted"
          >
            Delivery
          </button>

          {/* Add to cart */}
          <button
            onClick={handleAddToCart}
            className="flex flex-1 items-center justify-center gap-2 bg-kibana-ink py-2.5 text-xs font-bold uppercase tracking-[0.15em] text-kibana-cream transition-colors hover:bg-kibana-ink/80"
          >
            <ShoppingBag className="h-4 w-4" />
            Add to Cart
          </button>

          {/* Wishlist */}
          <button
            onClick={handleWishlist}
            aria-label="Add to wishlist"
            className="ml-2 flex w-11 items-center justify-center border border-border transition-colors hover:bg-muted"
          >
            <Heart
              className={`h-4 w-4 transition-colors ${inWishlist ? "text-red-500" : "text-muted-foreground"}`}
              fill={inWishlist ? "currentColor" : "none"}
            />
          </button>
        </div>
      </div>
    </>
  );
}
