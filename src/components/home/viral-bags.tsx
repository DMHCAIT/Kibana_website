import { products } from "@/lib/data";
import { ProductCard } from "@/components/product/product-card";
import { SectionHeading } from "./section-heading";

export function ViralBags() {
  const items = products.filter((p) => p.isTrending).slice(0, 3);
  return (
    <section className="container py-4 md:py-8">
      <SectionHeading title="Viral Bag" />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
        {items.map((p) => (
          <ProductCard key={p.id} product={p} variant="full" />
        ))}
      </div>
    </section>
  );
}
