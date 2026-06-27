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
    <section className="w-full bg-[#f5f0e8] py-2 md:py-6">
      <div className="container">
        <SectionHeading title="Best Sellers" />

        {/* Full-width banner — aspect matches image's natural 1816×866 ratio on mobile */}
        <Link
          href="/shop"
          aria-label="Shop best sellers"
          className="group relative block aspect-[21/10] w-full overflow-hidden rounded sm:aspect-[16/9] md:aspect-[16/7]"
        >
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
          <div className="pointer-events-none absolute left-[calc(12%-0.5rem)] top-1/2 -translate-y-1/2 sm:left-[calc(16%-0.5rem)] sm:top-[44%] sm:translate-y-0 md:left-[calc(18%-0.5rem)] md:top-[46%]">
            <span className="inline-block whitespace-nowrap bg-[#7C4A22] px-2 py-0.5 text-[7px] font-semibold uppercase tracking-[0.15em] text-white transition-colors duration-200 group-hover:bg-[#5E3518] sm:px-5 sm:py-2.5 sm:text-xs md:px-7 md:py-3 md:text-sm">
              Shop Now
            </span>
          </div>
        </Link>
      </div>
    </section>
  );
}
