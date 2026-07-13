"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useAuth } from "@/store/auth-store";
import { useWishlist } from "@/store/wishlist-store";
import { useProductCache } from "@/store/product-cache";
import { TrackPageView } from "@/components/analytics/track-page-view";
import { getProductDisplayName } from "@/lib/utils";
import type { Product } from "@/types/product";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { getShopDisplayImage } from "@/lib/product-images";

type WishlistItem = {
  product: Product;
  variantKey: string; // e.g., "prod-id-color-slug" or just "prod-id"
  displayImage: string; // Image specific to this variant
  displayName: string; // Name specific to this variant
};

export default function WishlistPage() {
  const { user, openAuthModal, _hasHydrated } = useAuth();
  const { items } = useWishlist();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);

  useEffect(() => {
    const loadWishlistItems = async () => {
      const products = await useProductCache.getState().fetch();

      // Map wishlist items to products with variant information
      const mappedItems = items
        .map((itemKey) => {
          // itemKey format: "prod-id" or "prod-id-color-slug"
          const product = products.find((p) => p.id === itemKey);

          if (product) {
            // Simple product ID (no color variant)
            return {
              product,
              variantKey: itemKey,
              displayImage: product.displayImage,
              displayName: product.name,
            };
          }

          // Try to parse as "prod-id-color-slug" by finding matching product
          // We need to check if any product has this ID and a variant with this slug
          for (const prod of products) {
            if (itemKey.startsWith(prod.id + "-")) {
              // This could be the product, extract the variant slug
              const variantPart = itemKey.substring(prod.id.length + 1);
              const variant = prod.colorVariants?.find((v) => v.slug === variantPart);

              if (variant) {
                return {
                  product: prod,
                  variantKey: itemKey,
                  displayImage: getShopDisplayImage(prod, variant),
                  displayName: getProductDisplayName(prod, variant),
                };
              }
            }
          }

          return null;
        })
        .filter((item): item is WishlistItem => item !== null);

      setWishlistItems(mappedItems);
    };

    loadWishlistItems();
  }, [items]);

  useEffect(() => {
    if (_hasHydrated && !user) {
      openAuthModal("Please log in to view your wishlist.");
    }
  }, [_hasHydrated, user, openAuthModal]);

  if (!_hasHydrated) {
    return null;
  }

  if (!user) {
    return (
      <>
        <TrackPageView pageName="Wishlist" pageType="wishlist" />
        <section className="container py-20 flex flex-col items-center text-center">
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
            <Heart className="h-7 w-7 text-muted-foreground" />
          </span>
          <h1 className="font-display text-3xl mb-2">Your Wishlist</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Log in to see your saved products.
          </p>
          <Button onClick={() => openAuthModal()} className="rounded-none px-8">
            Login / Sign Up
          </Button>
        </section>
      </>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <>
        <TrackPageView pageName="Wishlist" pageType="wishlist" />
        <section className="container py-20 flex flex-col items-center text-center">
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
            <Heart className="h-7 w-7 text-muted-foreground" />
          </span>
          <h1 className="font-display text-3xl mb-2">Your Wishlist</h1>
          <p className="text-sm text-muted-foreground mb-6">
            You haven&apos;t saved any products yet. Browse and tap the heart icon to save items.
          </p>
          <Button asChild className="rounded-none px-8">
            <Link href="/shop">Browse Products</Link>
          </Button>
        </section>
      </>
    );
  }

  return (
    <section className="container py-8 md:py-12">
      <TrackPageView pageName="Wishlist" pageType="wishlist" />
      <div className="mb-6">
        <h1 className="font-display text-3xl sm:text-4xl tracking-wide">Wishlist</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Hi {user.name} — {wishlistItems.length}{" "}
          {wishlistItems.length === 1 ? "item" : "items"} saved
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
        {wishlistItems.map((item) => (
          <ProductCard
            key={item.variantKey}
            product={item.product}
            variant="full"
            variantKey={item.variantKey}
            displayImage={item.displayImage}
            displayName={item.displayName}
          />
        ))}
      </div>
    </section>
  );
}
