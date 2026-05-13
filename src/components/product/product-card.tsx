"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import type { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { cn, discountPct, formatINR } from "@/lib/utils";
import { useCart } from "@/store/cart-store";
import { useWishlist } from "@/store/wishlist-store";
import { useAuth } from "@/store/auth-store";

type Props = {
  product: Product;
  variant?: "compact" | "full";
  className?: string;
};

export function ProductCard({ product, variant = "compact", className }: Props) {
  const add = useCart((s) => s.add);
  const { has: isInWishlist, add: addToWishlist, remove: removeFromWishlist } = useWishlist();
  const { user, openAuthModal } = useAuth();
  const [inWishlist, setInWishlist] = useState(false);

  useEffect(() => {
    setInWishlist(isInWishlist(product.id));
  }, [product.id, isInWishlist]);

  const pct = discountPct(product.price, product.compareAtPrice);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal("Please log in to save items to your wishlist.");
      return;
    }
    if (inWishlist) {
      removeFromWishlist(product.id);
      setInWishlist(false);
    } else {
      addToWishlist(product.id);
      setInWishlist(true);
    }
  };

  return (
    <div className={cn("group flex flex-col", className)}>
      <Link
        href={`/shop/${product.slug}`}
        className="relative block aspect-[5/6] overflow-hidden bg-kibana-cream"
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1280px) 25vw, 320px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Discount badge — top left on image */}
        {pct > 0 && (
          <span className="absolute left-2 top-2 bg-gray-900 text-white text-[10px] font-bold px-1.5 py-0.5 tracking-wide">
            {pct}% OFF
          </span>
        )}
        <button
          aria-label="Add to wishlist"
          className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center transition-all hover:scale-110"
          onClick={toggleWishlist}
        >
          <Heart 
            className={cn(
              "h-4 w-4 transition-colors",
              inWishlist ? "text-red-500" : "text-gray-400 hover:text-gray-600"
            )}
            fill={inWishlist ? "currentColor" : "none"}
          />
        </button>
        {product.colors.length > 0 && (
          <div className="absolute bottom-2 left-2 flex gap-1">
            {product.colors.slice(0, 4).map((c) => (
              <span
                key={c}
                className="h-3.5 w-3.5 ring-1 ring-black/10"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        )}
      </Link>

      <div className="pt-1.5 flex flex-col gap-0.5">
        <Link
          href={`/shop/${product.slug}`}
          className="line-clamp-1 text-[10px] sm:text-xs md:text-sm font-medium leading-snug hover:underline"
        >
          {product.name}
        </Link>
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-[11px] sm:text-xs md:text-sm font-bold">{formatINR(product.price)}</span>
          {product.compareAtPrice && (
            <span className="text-[10px] sm:text-xs text-muted-foreground line-through">
              {formatINR(product.compareAtPrice)}
            </span>
          )}
        </div>
        {variant === "full" && (
          <Button
            size="sm"
            variant="outline"
            className="mt-1 w-full text-[10px] sm:text-xs h-7 sm:h-8"
            onClick={() => add(product)}
          >
            <ShoppingBag className="h-3 w-3" />
            Add to Cart
          </Button>
        )}
      </div>
    </div>
  );
}
