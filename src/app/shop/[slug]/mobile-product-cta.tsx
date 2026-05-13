"use client";

import { useState } from "react";
import { ShoppingBag, Heart } from "lucide-react";
import { useCart } from "@/store/cart-store";
import { useWishlist } from "@/store/wishlist-store";
import { useAuth } from "@/store/auth-store";
import { formatINR } from "@/lib/utils";
import { DeliveryCheck } from "./delivery-check";
import type { Product } from "@/types/product";

export function MobileProductCTA({ product }: { product: Product }) {
  const [showDelivery, setShowDelivery] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const add = useCart((s) => s.add);
  const { add: addWishlist, remove: removeWishlist, has } = useWishlist();
  const { user, openAuthModal } = useAuth();

  function handleWishlist() {
    if (!user) {
      openAuthModal("Please log in to save items to your wishlist.");
      return;
    }
    const current = has(product.id);
    if (current) { removeWishlist(product.id); setInWishlist(false); }
    else { addWishlist(product.id); setInWishlist(true); }
  }

  return (
    <>
      {/* Delivery drawer sheet */}
      {showDelivery && (
        <div className="sm:hidden fixed inset-0 z-50 flex items-end">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowDelivery(false)}
          />
          <div className="relative w-full bg-white px-5 pt-5 pb-8 space-y-4 rounded-t-2xl">
            <div className="flex items-center justify-between mb-1">
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
      <div className="sm:hidden fixed bottom-16 inset-x-0 z-40 bg-white border-t border-border shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
        {/* Product name + price strip */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-border/50">
          <p className="text-xs font-medium truncate max-w-[55%]">{product.name}</p>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-sm font-bold">{formatINR(product.price)}</span>
            {product.compareAtPrice && (
              <span className="text-xs text-muted-foreground line-through hidden xs:inline">{formatINR(product.compareAtPrice)}</span>
            )}
          </div>
        </div>

        {/* Action row */}
        <div className="flex items-stretch gap-0 px-3 py-2.5">
          {/* Delivery check trigger */}
          <button
            onClick={() => setShowDelivery(true)}
            className="text-[10px] font-semibold uppercase tracking-[0.08em] text-kibana-camel border border-border px-2.5 py-2.5 mr-2 whitespace-nowrap hover:bg-muted transition-colors shrink-0"
          >
            Delivery
          </button>

          {/* Add to cart */}
          <button
            onClick={() => add(product, 1)}
            className="flex-1 flex items-center justify-center gap-2 bg-kibana-ink text-kibana-cream text-xs font-bold uppercase tracking-[0.15em] py-2.5 hover:bg-kibana-ink/80 transition-colors"
          >
            <ShoppingBag className="h-4 w-4" />
            Add to Cart
          </button>

          {/* Wishlist */}
          <button
            onClick={handleWishlist}
            aria-label="Add to wishlist"
            className="flex items-center justify-center border border-border w-11 ml-2 hover:bg-muted transition-colors"
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
