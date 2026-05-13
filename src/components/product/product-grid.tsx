import type { Product } from "@/types/product";
import { ProductCard } from "./product-card";
import { cn } from "@/lib/utils";

type Props = {
  products: Product[];
  variant?: "compact" | "full";
  columns?: "2-4" | "1-2-3";
  className?: string;
};

export function ProductGrid({ products, variant = "compact", columns = "2-4", className }: Props) {
  return (
    <div
      className={cn(
        "grid gap-2 sm:gap-4 md:gap-5",
        columns === "2-4" && "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
        columns === "1-2-3" && "grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
        className,
      )}
    >
      {products.map((p) => (
        <ProductCard key={p.id} product={p} variant={variant} />
      ))}
    </div>
  );
}
