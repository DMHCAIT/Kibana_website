import { ProductCard } from "@/components/product/product-card";
import { SectionHeading } from "./section-heading";
import type { Product } from "@/types/product";

export function NewArrivals({ products }: { products: Product[] }) {
  const items = products.filter((p) => p.isNew).slice(0, 4);
  return (
    <section className="container py-4 md:py-8">
      <SectionHeading title="Shop by New Arrivals" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {items.map((p) => (
          <ProductCard key={p.id} product={p} variant="minimal" />
        ))}
      </div>
    </section>
  );
}
