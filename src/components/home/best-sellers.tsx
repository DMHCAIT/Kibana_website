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
  const bannerImage = config?.leftImage || "/mv/best-seller-banner-2.jpeg";
  const buttonText  = config?.buttonText || "SHOP NOW";

  // Resolve product slug: prefer admin config, then backpack product, then first product, then default
  const shopSlug =
    config?.productSlug ||
    (products.find((p) => p.category === "backpack" || p.slug?.toLowerCase().includes("backpack")) ?? products[0])?.slug ||
    "orwyn-backpack";

  return (
    <section className="container py-2 md:py-6">
      <SectionHeading title="Best Sellers" />

      {/* Full-width banner — shows the entire image at natural aspect ratio */}
      <div className="relative w-full">
        <Image
          src={bannerImage}
          alt="Best Sellers"
          width={1280}
          height={854}
          sizes="(max-width: 480px) 100vw, (max-width: 768px) 100vw, (max-width: 1280px) 100vw, 1280px"
          quality={75}
          priority
          style={{ width: "100%", height: "auto", display: "block" }}
        />
        {/* Shop Now button overlaid at bottom-center — scales with image width */}
        <div className="absolute inset-x-0 bottom-[6%] flex justify-center z-10">
          <Link
            href={`/shop/${shopSlug}`}
            style={{
              fontSize: "clamp(6px, 0.8vw, 11px)",
              padding: "clamp(3px, 0.45vw, 7px) clamp(8px, 1.6vw, 24px)",
              letterSpacing: "0.2em",
            }}
            className="bg-white text-kibana-ink font-normal uppercase hover:bg-kibana-ink hover:text-white transition-colors whitespace-nowrap"
          >
            {buttonText}
          </Link>
        </div>
      </div>
    </section>
  );
}
