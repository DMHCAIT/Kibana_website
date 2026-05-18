import Image from "next/image";
import Link from "next/link";
import { SectionHeading } from "./section-heading";
import type { Product } from "@/types/product";

type BestSellersConfig = {
  leftImage?: string;
  rightImage?: string;
  heading?: string;
  buttonText?: string;
  productSlug?: string;
};

export function BestSellers({
  products = [],
  config,
}: {
  products?: Product[];
  config?: BestSellersConfig;
}) {
  const bannerImage = config?.leftImage || "/mv/best-seller-banner.jpeg";
  const buttonText  = config?.buttonText || "SHOP NOW";

  // Resolve product slug: prefer admin config, then backpack product, then first product, then default
  const shopSlug =
    config?.productSlug ||
    (products.find((p) => p.category === "backpack" || p.slug?.toLowerCase().includes("backpack")) ?? products[0])?.slug ||
    "orwyn-backpack";

  return (
    <section className="container py-6 md:py-10">
      <SectionHeading title="Best Sellers" />

      {/* Full-width banner */}
      <div className="relative h-64 sm:h-80 md:h-[420px] lg:h-[520px] xl:h-[580px] overflow-hidden">
        <Image
          src={bannerImage}
          alt="Best Sellers"
          fill
          sizes="100vw"
          className="object-cover object-center"
          priority
        />
        {/* Functional Shop Now button overlaid at bottom-center */}
        <div className="absolute inset-x-0 bottom-6 sm:bottom-8 flex justify-center z-10">
          <Link
            href={`/shop/${shopSlug}`}
            className="bg-white text-kibana-ink text-[9px] sm:text-[10px] font-normal tracking-[0.25em] uppercase px-5 sm:px-7 py-2 hover:bg-kibana-ink hover:text-white transition-colors"
          >
            {buttonText}
          </Link>
        </div>
      </div>
    </section>
  );
}
