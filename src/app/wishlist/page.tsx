"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useAuth } from "@/store/auth-store";
import { useWishlist } from "@/store/wishlist-store";
import { products } from "@/lib/data";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";

export default function WishlistPage() {
  const { user, openAuthModal, _hasHydrated } = useAuth();
  const { items } = useWishlist();

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
    );
  }

  const wishlistProducts = products.filter((p) => items.includes(p.id));

  if (wishlistProducts.length === 0) {
    return (
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
    );
  }

  return (
    <section className="container py-8 md:py-12">
      <div className="mb-6">
        <h1 className="font-display text-3xl sm:text-4xl tracking-wide">Wishlist</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Hi {user.name} — {wishlistProducts.length}{" "}
          {wishlistProducts.length === 1 ? "item" : "items"} saved
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
        {wishlistProducts.map((product) => (
          <ProductCard key={product.id} product={product} variant="full" />
        ))}
      </div>
    </section>
  );
}
