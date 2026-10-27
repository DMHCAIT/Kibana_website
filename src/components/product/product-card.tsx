"use client";

import { useEffect, useRef, useState } from "react";
import Image from "@/components/ui/image";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Heart, Plus } from "lucide-react";
import type { Product } from "@/types/product";
import { cn, discountPct, formatINR } from "@/lib/utils";
import { pickDefaultProductImage } from "@/lib/product-images";
import { useCart } from "@/store/cart-store";
import { useWishlist } from "@/store/wishlist-store";
import { useAuth } from "@/store/auth-store";
import { trackWishlist } from "@/lib/analytics";
import {
  hasProductTag,
  productHref as getProductHref,
  productInStock,
} from "@/lib/product-presentation";

type Props = {
  product: Product;
  variant?: "compact" | "full" | "minimal";
  className?: string;
  imageClassName?: string;
  href?: string;
  displayName?: string;
  displayImage?: string;
  variantInStock?: boolean;
  variantKey?: string;
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
  variantInStock = true,
  variantKey,
  priority = false,
}: Props) {
  const add = useCart((s) => s.add);
  const { has: isInWishlist, add: addToWishlist, remove: removeFromWishlist } = useWishlist();
  const { user, openAuthModal } = useAuth();
  const [inWishlist, setInWishlist] = useState(false);
  const [adding, setAdding] = useState(false);
  const addingRef = useRef(false);

  const wishlistKey = variantKey ?? product.id;

  useEffect(() => {
    setInWishlist(isInWishlist(wishlistKey));
  }, [wishlistKey, isInWishlist]);

  const productHref = href ?? getProductHref(product, product.colorVariants[0]);
  const colorSlugFromHref = new URL(productHref, "http://localhost").searchParams.get("color");
  const selectedVariant =
    product.colorVariants.find((color) =>
      colorSlugFromHref
        ? color.slug === colorSlugFromHref
        : color.pageSlug && productHref.split("?")[0] === `/shop/${color.pageSlug}`,
    ) ?? product.colorVariants[0];
  const colorSlug = selectedVariant?.slug;
  const price = selectedVariant?.price ?? product.price;
  const compareAtPrice =
    selectedVariant?.price === undefined ? product.compareAtPrice : selectedVariant.compareAtPrice;
  const pct = discountPct(price, compareAtPrice);
  const inStock = variantInStock && productInStock(product, selectedVariant);
  const gallery = selectedVariant ? (selectedVariant.gallery ?? []) : product.gallery;
  const cardName = displayName ?? selectedVariant?.productTitle ?? product.name;
  const cardImage =
    displayImage ?? pickDefaultProductImage(selectedVariant?.image ?? product.image, gallery);
  const hoverImage = gallery.find((image) => image && image !== cardImage);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal("Please log in to save items to your wishlist.");
      return;
    }
    if (inWishlist) {
      removeFromWishlist(wishlistKey);
      trackWishlist(product, "remove", user.id);
      setInWishlist(false);
    } else {
      addToWishlist(wishlistKey);
      trackWishlist(product, "add", user.id);
      setInWishlist(true);
    }
  };

  const handleAddToCart = async () => {
    if (!inStock || addingRef.current) return;
    if (!user) {
      openAuthModal("Please log in to add items to your cart.");
      return;
    }
    addingRef.current = true;
    setAdding(true);
    try {
      await add(product, 1, colorSlug);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Could not add this colour to your cart.");
    } finally {
      addingRef.current = false;
      setAdding(false);
    }
  };

  const badge = hasProductTag(product, "isBestSeller", selectedVariant)
    ? "Best Seller"
    : hasProductTag(product, "isNew", selectedVariant)
      ? "New"
      : null;

  return (
    <div className={cn("group flex flex-col", className)}>
      <div className={cn("relative block overflow-hidden", imageClassName ?? "aspect-[4/5]")}>
        <Link href={productHref} className="absolute inset-0 block">
          <Image
            src={cardImage}
            alt={cardName}
            fill
            priority={priority}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            sizes={
              variant === "full"
                ? "(max-width: 1023px) 100vw, 50vw"
                : "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            }
            className={cn(
              "object-cover",
              "duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] transition-[opacity,transform] group-hover:scale-[1.06]",
              hoverImage && "group-hover:opacity-0",
            )}
          />
          {hoverImage && (
            <Image
              src={hoverImage}
              alt=""
              aria-hidden
              fill
              loading="lazy"
              sizes={
                variant === "full"
                  ? "(max-width: 1023px) 100vw, 50vw"
                  : "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              }
              className={cn(
                "object-cover",
                "duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] scale-[1.04] opacity-0 transition-[opacity,transform] group-hover:scale-100 group-hover:opacity-100",
              )}
            />
          )}

          {inStock && badge && variant !== "minimal" && (
            <span className="absolute left-0 top-2 whitespace-nowrap bg-kibana-brown px-1.5 py-0.5 font-jost text-[8px] font-normal uppercase leading-normal tracking-[0.12em] text-white sm:top-3 sm:px-3 sm:py-1 sm:text-[10px] sm:tracking-[0.18em]">
              {badge}
            </span>
          )}

          {!inStock && (
            <Badge variant="soldOut" className="absolute left-2 top-2 sm:left-3 sm:top-3">
              Sold Out
            </Badge>
          )}
        </Link>

        <button
          type="button"
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          className="pointer-events-none absolute right-3 top-3 z-10 inline-flex h-8 w-8 items-center justify-center bg-transparent opacity-0 transition-opacity duration-300 focus-visible:pointer-events-auto focus-visible:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100 group-hover:pointer-events-auto group-hover:opacity-100"
          onClick={toggleWishlist}
        >
          <Heart
            className={cn(
              "h-4 w-4 transition-all duration-300",
              inWishlist ? "fill-kibana-brown text-kibana-brown" : "text-foreground",
            )}
            strokeWidth={1.4}
          />
        </button>

        {variant !== "minimal" && inStock && (
          <button
            type="button"
            aria-label={`Add ${cardName} to cart`}
            aria-busy={adding}
            disabled={adding}
            onClick={handleAddToCart}
            className="pointer-events-none absolute bottom-3 right-3 z-10 inline-flex h-8 w-8 items-center justify-center bg-white text-foreground opacity-0 transition-opacity duration-300 focus-visible:pointer-events-auto focus-visible:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100 group-hover:pointer-events-auto group-hover:opacity-100"
          >
            {adding ? (
              <span role="status" className="text-[9px]">
                Adding...
              </span>
            ) : (
              <Plus className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
            )}
          </button>
        )}
      </div>

      <div className="product-card-info flex flex-col items-center px-1 text-center">
        <Link href={productHref} className="product-title line-clamp-2 hover:text-kibana-brown">
          {cardName}
        </Link>

        {variant !== "minimal" && (
          <div className="product-card-price flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5">
            {compareAtPrice && pct > 0 && (
              <span className="text-muted-foreground line-through">
                {formatINR(compareAtPrice)}
              </span>
            )}
            <span className={cn(pct > 0 ? "text-kibana-sale" : "text-foreground")}>
              {formatINR(price)}
            </span>
          </div>
        )}
        {variant !== "minimal" && pct > 0 && (
          <span className="text-[11px] uppercase tracking-[0.14em] text-kibana-sale">
            {pct}% Off
          </span>
        )}
      </div>
    </div>
  );
}
