"use client";

import { useState, useEffect } from "react";
import { ShoppingBag, Minus, Plus, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/store/cart-store";
import { useAuth } from "@/store/auth-store";
import { useWishlist } from "@/store/wishlist-store";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";

export function AddToCartButton({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const [inWishlist, setInWishlist] = useState(false);
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

  return (
    <div className="space-y-4">
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
          onClick={() => add(product, qty)}
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
