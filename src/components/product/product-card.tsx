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
  variant?: "compact" | "full" | "minimal";
  className?: string;
  imageClassName?: string;
};

export function ProductCard({ product, variant = "compact", className, imageClassName }: Props) {
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
        className={cn("relative block overflow-hidden rounded-lg bg-kibana-cream", imageClassName ?? "aspect-[5/6]")}
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Discount badge — top left on image */}
        {pct > 0 && variant !== "minimal" && (
          <span className="absolute left-2 top-2 bg-gray-900 text-white text-[9px] sm:text-[10px] px-1.5 py-0.5 tracking-wide">
            {pct}% OFF
          </span>
        )}
        <button
          aria-label="Add to wishlist"
          className="absolute right-2 top-2 inline-flex h-7 sm:h-8 w-7 sm:w-8 items-center justify-center transition-all hover:scale-110"
          onClick={toggleWishlist}
        >
          <Heart 
            className={cn(
              "h-5 sm:h-6 w-5 sm:w-6 transition-colors",
              inWishlist ? "text-red-500" : "text-gray-400 hover:text-gray-600"
            )}
            fill={inWishlist ? "currentColor" : "none"}
          />
        </button>
      </Link>

      <div className="pt-1.5 flex flex-col gap-0.5">
        <Link
          href={`/shop/${product.slug}`}
          className="line-clamp-1 text-xs sm:text-sm md:text-base leading-snug hover:underline"
        >
          {product.name}
        </Link>
        {variant !== "minimal" && (
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-[12px] sm:text-sm md:text-lg">{formatINR(product.price)}</span>
            {product.compareAtPrice && (
              <span className="text-[11px] sm:text-xs md:text-base text-muted-foreground line-through">
                {formatINR(product.compareAtPrice)}
              </span>
            )}
          </div>
        )}
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
