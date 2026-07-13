import type { Product } from "@/types/product";
import { ProductCard } from "./product-card";
import { cn } from "@/lib/utils";

type ProductGridItem = {
  key: string; // Unique key for variant, e.g., "prod-id-color-slug"
  product: Product;
  href?: string;
  displayName?: string;
  displayImage?: string;
  variantInStock?: boolean;
  variantKey?: string; // Optional: variant-specific wishlist key, defaults to key
};

type Props = {
  products?: Product[];
  items?: ProductGridItem[];
  variant?: "compact" | "full";
  columns?: "2-4" | "1-2-3";
  className?: string;
};

export function ProductGrid({
  products = [],
  items,
  variant = "compact",
  columns = "2-4",
  className,
}: Props) {
  const gridItems: ProductGridItem[] =
    items ?? products.map((product) => ({ key: product.id, product }));

  return (
    <div
      className={cn(
        "grid gap-2 sm:gap-4 md:gap-5",
        columns === "2-4" && "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
        columns === "1-2-3" && "grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
        className,
      )}
    >
      {gridItems.map((item, index) => (
        <ProductCard
          key={item.key}
          product={item.product}
          href={item.href}
          displayName={item.displayName}
          displayImage={item.displayImage}
          variantInStock={item.variantInStock}
          variantKey={item.variantKey ?? item.key} // Use variantKey if provided, otherwise use item.key
          variant={variant}
          priority={index < 4}
        />
      ))}
    </div>
  );
}
