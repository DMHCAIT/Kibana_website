"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import type { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { cn, discountPct, formatINR } from "@/lib/utils";
import { pickDefaultProductImage } from "@/lib/product-images";
import { useCart } from "@/store/cart-store";
import { useWishlist } from "@/store/wishlist-store";
import { useAuth } from "@/store/auth-store";

type Props = {
  product: Product;
  variant?: "compact" | "full" | "minimal";
  className?: string;
  imageClassName?: string;
  href?: string;
  displayName?: string;
  displayImage?: string;
  priority?: boolean;
};

export function ProductCard({
  product,
  variant = "compact",
  className,
  imageClassName,
  href,
  displayName,
  displayImage,
  priority = false,
}: Props) {
  const add = useCart((s) => s.add);
  const { has: isInWishlist, add: addToWishlist, remove: removeFromWishlist } = useWishlist();
  const { user, openAuthModal } = useAuth();
  const [inWishlist, setInWishlist] = useState(false);

  useEffect(() => {
    setInWishlist(isInWishlist(product.id));
  }, [product.id, isInWishlist]);

  const pct = discountPct(product.price, product.compareAtPrice);
  const productHref = href ?? `/shop/${product.slug}`;
  const cardName = displayName ?? product.name;
  const cardImage = displayImage ?? pickDefaultProductImage(product.image, product.gallery ?? []);
  const visibleColorVariants = product.colorVariants?.length
    ? product.colorVariants
    : product.colors.map((color) => ({
        color,
        slug: color.toLowerCase().replace(/\s+/g, "-"),
        image: product.image,
        hex: undefined,
      }));

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
        href={productHref}
        className={cn(
          "relative block overflow-hidden rounded-lg bg-kibana-cream",
          imageClassName ?? "aspect-[5/6]",
        )}
      >
        <Image
          src={cardImage}
          alt={cardName}
          fill
          priority={priority}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          quality={70}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Discount badge — top left on image */}
        {pct > 0 && variant !== "minimal" && (
          <span className="absolute left-2 top-2 bg-gray-900 px-1.5 py-0.5 text-[9px] tracking-wide text-white sm:text-[10px]">
            {pct}% OFF
          </span>
        )}
        <button
          aria-label="Add to wishlist"
          className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center transition-all hover:scale-110 sm:h-8 sm:w-8"
          onClick={toggleWishlist}
        >
          <Heart
            className={cn(
              "h-5 w-5 transition-colors sm:h-6 sm:w-6",
              inWishlist ? "text-red-500" : "text-gray-400 hover:text-gray-600",
            )}
            fill={inWishlist ? "currentColor" : "none"}
          />
        </button>
      </Link>

      <div className="flex flex-col gap-0.5 pt-1.5">
        <Link
          href={productHref}
          className="line-clamp-1 text-xs leading-snug hover:underline sm:text-sm md:text-base"
        >
          {cardName}
        </Link>
        {variant !== "minimal" && (
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-[12px] sm:text-sm md:text-lg">{formatINR(product.price)}</span>
            {product.compareAtPrice && (
              <span className="text-[11px] text-muted-foreground line-through sm:text-xs md:text-base">
                {formatINR(product.compareAtPrice)}
              </span>
            )}
          </div>
        )}
        {variant === "full" && visibleColorVariants.length > 0 && (
          <div className="mt-0.5 flex items-center gap-1.5">
            <div className="flex items-center">
              {visibleColorVariants.slice(0, 6).map((variantColor) => (
                <span
                  key={variantColor.slug}
                  className="-ml-1 h-3.5 w-3.5 rounded-full border border-white shadow-sm first:ml-0"
                  style={{ backgroundColor: variantColor.hex || variantColor.color }}
                  title={variantColor.color}
                />
              ))}
            </div>
            <span className="text-[10px] text-muted-foreground">
              {visibleColorVariants.length} colors
            </span>
          </div>
        )}
        {variant === "full" && (
          <Button
            size="sm"
            variant="outline"
            className="mt-1 h-7 w-full text-[10px] sm:h-8 sm:text-xs"
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
