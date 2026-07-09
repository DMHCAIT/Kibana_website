import { ProductCard } from "@/components/product/product-card";
import { SectionHeading } from "./section-heading";
import type { Product } from "@/types/product";

const NEW_ARRIVALS_OLD_IMAGES: Record<string, string> = {
  p11: "/mv/new-3.jpg",
  p12: "/mv/new-4.jpg",
  p13: "/mv/new-2.jpg",
  p14: "/mv/new-1.jpg",
};

const NEW_ARRIVALS_REDIRECTS: Record<string, string> = {
  p11: "/shop/halo-mini?color=forest-green",
  p12: "/shop/valera-dome?color=milky-blue",
  p13: "/shop/cordia-bag?color=light-purple",
  p14: "/shop/crescent-sling-bag?color=turquoise-blue",
};

export function NewArrivals({ products }: { products: Product[] }) {
  const NEW_ARRIVALS_IDS = ["p11", "p12", "p13", "p14"];
  
  const items = NEW_ARRIVALS_IDS
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is Product => Boolean(p))
    .map((p) => {
      if (p.slug === "halo-mini") return { ...p, name: "Halo Mini" };
      if (p.slug === "orwyn-backpack" || p.slug === "valera-dome") return { ...p, name: "Valera Dome" };
      if (p.slug === "cordia-bag") return { ...p, name: "Cordia Bag" };
      if (p.slug === "crescent-sling-bag") return { ...p, name: "Cordia Bag" };
      if (p.slug === "business-laptop-briefcase") return { ...p, name: "Crescent Sling Bag" };
      return p;
    })
    .map((p) => ({ ...p, image: NEW_ARRIVALS_OLD_IMAGES[p.id] ?? p.image }));
  return (
    <section className="w-full bg-[#f5f0e8]">
      <div className="container py-3 md:py-7">
        <SectionHeading title="Shop by New Arrivals" className="pt-2 md:pt-3" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {items.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              variant="minimal"
              href={NEW_ARRIVALS_REDIRECTS[p.id] ?? `/shop/${p.slug}`}
              displayImage={NEW_ARRIVALS_OLD_IMAGES[p.id] ?? p.image}
            />
          ))}
        </div>
      </div>
    </section>
  );
}