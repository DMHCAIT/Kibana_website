"use client";

import { useState, useEffect } from "react";
import { ShoppingBag, Minus, Plus, Heart, Check, X, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCart } from "@/store/cart-store";
import { useAuth } from "@/store/auth-store";
import { useWishlist } from "@/store/wishlist-store";
import { cn, formatINR } from "@/lib/utils";
import type { Product } from "@/types/product";

export function AddToCartButton({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const [inWishlist, setInWishlist] = useState(false);
  const [addedNotification, setAddedNotification] = useState(false);
  const add = useCart((s) => s.add);
  const { user, openAuthModal } = useAuth();
  const { add: addWishlist, remove: removeWishlist, has } = useWishlist();

  useEffect(() => {
    setInWishlist(has(product.id));
  }, [has, product.id]);

  function handleWishlist() {
    if (!user) {
      openAuthModal("Please log in to save items to your wishlist.");
      return;
    }
    if (inWishlist) {
      removeWishlist(product.id);
      setInWishlist(false);
    } else {
      addWishlist(product.id);
      setInWishlist(true);
    }
  }

  function handleAddToCart() {
    add(product, qty);
    setAddedNotification(true);
    setTimeout(() => setAddedNotification(false), 4000);
  }

  return (
    <div className="space-y-4 w-full min-w-0">
      {/* Added to cart notification */}
      {addedNotification && (
        <div className="fixed bottom-6 right-4 z-50 w-[calc(100vw-2rem)] max-w-sm bg-white border border-border shadow-xl rounded-xl p-4 flex gap-3 items-start animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center mt-0.5">
            <Check className="h-4 w-4 text-emerald-700" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">Added to cart!</p>
            <div className="mt-1.5 flex items-center gap-2.5">
              <div className="relative h-10 w-9 shrink-0 overflow-hidden rounded bg-muted">
                <Image src={product.image} alt={product.name} fill sizes="36px" className="object-cover" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium truncate">{product.name}</p>
                <p className="text-xs text-muted-foreground">Qty: {qty} · {formatINR(product.price * qty)}</p>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <Link
                href="/cart"
                className="flex-1 text-center text-xs font-semibold bg-foreground text-background px-3 py-2 rounded hover:bg-foreground/90 transition-colors"
              >
                View Cart
              </Link>
              <Link
                href="/checkout"
                className="flex-1 flex items-center justify-center gap-1 text-xs font-semibold bg-kibana-tan text-white px-3 py-2 rounded hover:bg-kibana-tan/90 transition-colors"
              >
                Checkout <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAddedNotification(false)}
            className="text-muted-foreground hover:text-foreground flex-shrink-0"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Quantity selector */}
      <div className="flex items-center gap-4">
        <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Quantity
        </span>
        <div className="flex items-center border border-border">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="px-3 py-2 hover:bg-muted transition-colors"
            aria-label="Decrease quantity"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="px-5 py-2 text-sm font-medium min-w-[3rem] text-center">
            {qty}
          </span>
          <button
            type="button"
            onClick={() => setQty((q) => q + 1)}
            className="px-3 py-2 hover:bg-muted transition-colors"
            aria-label="Increase quantity"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <Button
          size="lg"
          className="flex-1 rounded-none text-xs sm:text-sm"
          onClick={handleAddToCart}
        >
          <ShoppingBag className="h-4 w-4 shrink-0" />
          Add to Cart
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="rounded-none px-3 sm:px-4 shrink-0"
          onClick={handleWishlist}
          aria-label={inWishlist ? "Remove from wishlist" : "Save to wishlist"}
        >
          <Heart
            className={cn(
              "h-4 w-4",
              inWishlist ? "fill-red-500 text-red-500" : "",
            )}
          />
        </Button>
      </div>
    </div>
  );
}
