"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { SectionHeading } from "./section-heading";
import { useWishlist } from "@/store/wishlist-store";
import type { Product } from "@/types/product";

// CORRECT NEW ARRIVALS - in desired order with hardcoded images
const NEW_ARRIVALS_ITEMS = [
  {
    id: "p11",
    slug: "halo-mini",
    name: "Halo Mini",
    image: "/mv/new-1.jpg",
    colorSlug: "forest-green",
  },
  {
    id: "p9",
    slug: "valera-dome",
    name: "Valera Dome",
    image: "/mv/new-2.jpg",
    colorSlug: "milky-blue",
  },
  {
    id: "p10",
    slug: "cordia-bag",
    name: "Cordia Bag",
    image: "/mv/new-3.jpg",
    colorSlug: "light-purple",
  },
  {
    id: "p13",
    slug: "crescent-sling-bag",
    name: "Crescent Sling Bag",
    image: "/mv/new-4.jpg",
    colorSlug: "milky-blue",
  },
];

export function NewArrivals({ products }: { products: Product[] }) {
  const { items: wishlistItems, add: addToWishlist, remove: removeFromWishlist } = useWishlist();
  const [wishlistStates, setWishlistStates] = useState<Record<string, boolean>>({});

  // Sync wishlist states from the global store
  useEffect(() => {
    const newStates: Record<string, boolean> = {};
    NEW_ARRIVALS_ITEMS.forEach((item) => {
      const variantKey = `${item.id}-${item.colorSlug}`;
      const isInWishlist = wishlistItems.includes(variantKey);
      newStates[variantKey] = isInWishlist;
    });
    setWishlistStates(newStates);
  }, [wishlistItems]);

  // Build href with correct product slug and color variant
  const items = NEW_ARRIVALS_ITEMS.map((item) => {
    const product = products.find((p) => p.id === item.id);
    const isInWishlist = wishlistStates[`${item.id}-${item.colorSlug}`] || false;

    return {
      id: item.id,
      name: item.name,
      slug: product?.slug || item.slug,
      price: product?.price || 0,
      category: product?.category || "",
      image: item.image,
      colorSlug: item.colorSlug,
      product: product,
      href: `/shop/${product?.slug || item.slug}?color=${item.colorSlug}`,
      isInWishlist,
    };
  });

  const handleWishlistToggle = (e: React.MouseEvent, item: (typeof items)[0]) => {
    e.preventDefault();
    if (!item.product) return;

    const wishlistKey = `${item.id}-${item.colorSlug}`;
    if (wishlistStates[wishlistKey]) {
      removeFromWishlist(wishlistKey);
    } else {
      addToWishlist(wishlistKey);
    }
  };

  return (
    <section className="w-full bg-[#f5f0e8]">
      <div className="container py-3 md:py-7">
        <SectionHeading title="Shop by New Arrivals" className="pt-2 md:pt-3" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {items.map((item) => (
            <a
              key={`${item.id}-${item.colorSlug}`}
              href={item.href}
              className="group relative flex flex-col items-center gap-1.5"
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded bg-gray-100">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                {/* Wishlist Button - Heart Icon Only */}
                <button
                  onClick={(e) => handleWishlistToggle(e, item)}
                  className="absolute right-2 top-2 z-10 inline-flex h-7 w-7 items-center justify-center transition-all hover:scale-110"
                  aria-label={
                    wishlistStates[`${item.id}-${item.colorSlug}`]
                      ? "Remove from wishlist"
                      : "Add to wishlist"
                  }
                >
                  <Heart
                    className={`h-5 w-5 transition-colors ${
                      wishlistStates[`${item.id}-${item.colorSlug}`]
                        ? "fill-red-500 text-red-500"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  />
                </button>
              </div>
              <p className="text-center text-xs font-medium text-gray-800 sm:text-sm">
                {item.name}
              </p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
