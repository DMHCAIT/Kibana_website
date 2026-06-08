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
  products: _products = [],
  config,
}: {
  products?: Product[];
  config?: BestSellersConfig;
}) {
  const bannerImage = config?.leftImage || "/mv/best-seller-B.jpg.jpeg";

  return (
    <section className="container py-2 md:py-6">
      <SectionHeading title="Best Sellers" className="font-normal normal-case tracking-[0.05em]" />

      {/* Full-width banner — aspect matches image's natural 1816×866 ratio on mobile */}
      <div className="relative w-full aspect-[21/10] sm:aspect-[16/9] md:aspect-[16/7] overflow-hidden rounded">
        <Image
          src={bannerImage}
          alt="Best Sellers"
          fill
          sizes="(max-width: 480px) 100vw, (max-width: 768px) 100vw, (max-width: 1280px) 100vw, 1280px"
          quality={75}
          priority
          className="object-cover object-left-top sm:object-center"
        />
        {/* Shop Now overlay — responsive positioning across all breakpoints */}
        <div className="absolute left-[calc(12%-0.5rem)] top-1/2 sm:left-[calc(16%-0.5rem)] sm:top-[44%] md:left-[calc(18%-0.5rem)] md:top-[46%] -translate-y-1/2 sm:translate-y-0">
          <Link
            href="/shop"
            className="inline-block bg-[#7C4A22] hover:bg-[#5E3518] text-white font-semibold tracking-[0.15em] uppercase
                       text-[7px] px-2 py-0.5
                       sm:text-xs sm:px-5 sm:py-2.5
                       md:text-sm md:px-7 md:py-3
                       transition-colors duration-200 whitespace-nowrap"
          >
            Shop Now
          </Link>
        </div>
      </div>
    </section>
  );
}
