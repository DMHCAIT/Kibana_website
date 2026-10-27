"use client";

import { useState } from "react";
import Link from "next/link";
import { ProductCard } from "@/components/product/product-card";
import { SHOP_CATEGORIES } from "@/lib/shop-categories";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";
import { homepageVariants, productHref, productInStock } from "@/lib/product-presentation";

const categories = [
  ...SHOP_CATEGORIES.filter((category) => category.slug === "sling-bag"),
  ...SHOP_CATEGORIES.filter((category) => category.slug !== "sling-bag"),
];

export function ShopByCategory({ products }: { products: Product[] }) {
  const [activeCategory, setActiveCategory] = useState("sling-bag");
  const activeCategoryName = SHOP_CATEGORIES.find((cat) => cat.slug === activeCategory)?.name;
  const categoryProducts = homepageVariants(
    products.filter((product) => product.category === activeCategory),
    "shopByCategory",
  );

  return (
    <section aria-labelledby="shop-by-category-heading" className="w-full bg-white">
      <div className="container py-10 sm:py-12 md:py-16">
        <h2 id="shop-by-category-heading" className="section-title">
          Shop by Category
        </h2>

        <div
          role="group"
          aria-label="Bag categories"
          className="mt-5 flex flex-wrap justify-center gap-x-3 gap-y-1 sm:gap-x-6 lg:gap-x-10"
        >
          {categories.map((cat) => (
            <button
              key={cat.slug}
              type="button"
              aria-pressed={activeCategory === cat.slug}
              aria-controls="shop-by-category-products"
              onClick={() => setActiveCategory(cat.slug)}
              className="group/category inline-flex min-h-11 items-center justify-center py-2 font-sans text-[12px] font-normal normal-case leading-[18px] tracking-[0.2em] outline-none"
            >
              <span
                className={cn(
                  "whitespace-nowrap rounded-full px-4 py-1 transition-colors group-focus-visible/category:ring-2 group-focus-visible/category:ring-kibana-brown group-focus-visible/category:ring-offset-2 motion-reduce:transition-none",
                  activeCategory === cat.slug
                    ? "bg-kibana-brown text-white"
                    : "text-foreground hover:bg-kibana-tile",
                )}
              >
                {cat.name}
              </span>
            </button>
          ))}
        </div>

        <div
          id="shop-by-category-products"
          role="region"
          aria-label={`${activeCategoryName} products`}
          className="mt-7 sm:mt-10"
        >
          <p role="status" className="sr-only">
            {categoryProducts.length} products shown in {activeCategoryName}.
          </p>
          {categoryProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 lg:grid-cols-4 lg:gap-x-6">
              {categoryProducts.map(({ product, variant }) => (
                <ProductCard
                  key={`${product.id}-${variant.slug}`}
                  product={product}
                  href={productHref(product, variant)}
                  displayName={variant.productTitle || `${product.name} - ${variant.color}`}
                  displayImage={variant.image}
                  variantKey={`${product.id}-${variant.slug}`}
                  variantInStock={productInStock(product, variant)}
                />
              ))}
            </div>
          ) : (
            <p className="py-12 text-center text-[13px] text-muted-foreground">
              No products available in {activeCategoryName} at the moment.
            </p>
          )}
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href={
              SHOP_CATEGORIES.find((category) => category.slug === activeCategory)?.href ?? "/shop"
            }
            aria-label={`View all ${activeCategoryName}`}
            className="btn-pill"
          >
            View All
          </Link>
        </div>
      </div>
    </section>
  );
}
