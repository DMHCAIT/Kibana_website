import { products } from "@/lib/data";
import { ProductCard } from "@/components/product/product-card";
import { SectionHeading } from "./section-heading";

export function ShopByPrice() {
  // Pick the 3 trending mid-tier items, displayed with Add to Cart (full variant)
  const items = products
    .filter((p) => p.isTrending && p.slug !== "siena-tote")
    .slice(0, 3);

  return (
    <section className="container py-4 md:py-8">
      <SectionHeading title="Shop by Price" />
      <div className="grid grid-cols-3 gap-3 sm:gap-5 md:gap-6">
        {items.map((p) => (
          <ProductCard key={p.id} product={p} variant="full" />
        ))}
      </div>
    </section>
  );
}
