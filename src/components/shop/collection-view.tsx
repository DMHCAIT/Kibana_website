"use client";

import { useState } from "react";
import { ProductGrid, type ProductGridItem } from "@/components/product/product-grid";
import { ShopHeader } from "./shop-header";
import { cn } from "@/lib/utils";

type Density = "large" | "standard" | "compact";

export function CollectionView({
  heading,
  items,
  sort,
}: {
  heading: string;
  items: ProductGridItem[];
  sort: string;
}) {
  const [density, setDensity] = useState<Density>("compact");
  const renderControls = (mobile: boolean) => (
    <div
      className={cn("items-center gap-1", mobile ? "flex lg:hidden" : "hidden lg:flex")}
      role="group"
      aria-label="Product image size"
    >
      {(mobile
        ? (["large", "standard"] as const)
        : (["large", "standard", "compact"] as const)
      ).map((size, index) => (
        <button
          key={size}
          type="button"
          aria-label={`Switch to ${size === "large" ? "larger" : size === "standard" ? "smaller" : "compact"} product images`}
          aria-pressed={
            density === size || (mobile && size === "standard" && density === "compact")
          }
          onClick={() => setDensity(size)}
          className={cn(
            "flex h-11 w-9 items-center justify-center text-foreground/40 transition-colors hover:text-foreground focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-[-4px]",
            (density === size || (mobile && size === "standard" && density === "compact")) &&
              "text-foreground",
          )}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true">
            {Array.from({ length: index + 2 }, (_, column) => (
              <rect
                key={column}
                x={column * (18 / (index + 2))}
                y="2"
                width={18 / (index + 2) - 2}
                height="14"
              />
            ))}
          </svg>
        </button>
      ))}
    </div>
  );

  return (
    <>
      <ShopHeader
        heading={heading}
        count={items.length}
        sort={sort}
        layoutControls={
          <>
            {renderControls(true)}
            {renderControls(false)}
          </>
        }
      />
      <p
        className="px-5 pt-4 text-[12px] uppercase tracking-[0.18em] text-muted-foreground md:hidden"
        role="status"
      >
        {items.length} {items.length === 1 ? "product" : "products"}
      </p>
      <div className="storefront-collection-products">
        {items.length > 0 ? (
          <ProductGrid
            items={items}
            variant="full"
            columns={`collection-${density}`}
            className="gap-x-2.5 gap-y-8 sm:gap-x-4 sm:gap-y-10 md:gap-x-6 md:gap-y-12"
          />
        ) : (
          <p className="py-16 text-center text-sm text-muted-foreground">
            No products in this category yet — check back soon.
          </p>
        )}
      </div>
    </>
  );
}
