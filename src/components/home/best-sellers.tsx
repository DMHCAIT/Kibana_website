import Image from "next/image";
import Link from "next/link";
import { SectionHeading } from "./section-heading";
import { ProductCard } from "@/components/product/product-card";
import type { Product } from "@/types/product";

const FALLBACK_SLUG = "north-backpack";

export function BestSellers({ products = [] }: { products?: Product[] }) {
  // If admin has assigned specific products → show them as a product grid
  if (products.length > 0) {
    return (
      <section className="container py-6 md:py-10">
        <SectionHeading title="Best Sellers" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    );
  }

  // Fallback: original banner layout
  return (
    <section className="container py-6 md:py-10">
      <SectionHeading title="Best Sellers" />

      {/* Two-image banner with centered overlay */}
      <div className="relative flex h-56 sm:h-72 md:h-[380px] lg:h-[480px] overflow-hidden">

        {/* Left image — back view */}
        <Link href={`/shop/${FALLBACK_SLUG}`} className="relative w-1/2 overflow-hidden">
          <Image
            src="/extracted/backpack-left.png"
            alt="Best seller — back view"
            fill
            sizes="50vw"
            className="object-cover object-center"
          />
        </Link>

        {/* Right image — shows right half of diptych (holding view) */}
        <Link href={`/shop/${FALLBACK_SLUG}`} className="relative w-1/2 overflow-hidden">
          <Image
            src="/extracted/img-050.jpg"
            alt="Best seller — front view"
            fill
            sizes="50vw"
            className="object-cover object-right"
          />
        </Link>

        {/* Center overlay: centered across full banner */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
          <div className="flex flex-col items-center gap-3 sm:gap-4">
            <h2 className="font-sans text-white text-2xl sm:text-3xl md:text-4xl font-light leading-tight tracking-[0.05em] text-center uppercase whitespace-nowrap">
              GOT<br />YOUR<br />BACK
            </h2>
            <Link
              href={`/shop/${FALLBACK_SLUG}`}
              className="bg-white text-kibana-ink text-[10px] sm:text-xs font-light tracking-[0.25em] uppercase px-5 sm:px-7 py-2.5 hover:bg-kibana-ink hover:text-white transition-colors whitespace-nowrap"
            >
              SHOP NOW
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
