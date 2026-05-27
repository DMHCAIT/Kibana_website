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
  const bannerImage = config?.leftImage || "/mv/best-seller-B.jpg.jpeg";

  return (
    <section className="container py-2 md:py-6">
      <SectionHeading title="Best Sellers" />

      {/* Full-width banner — aspect matches image's natural 1816×866 ratio on mobile */}
      <div className="relative w-full aspect-[21/10] sm:aspect-[16/9] md:aspect-[16/7] overflow-hidden">
        <Image
          src={bannerImage}
          alt="Best Sellers"
          fill
          sizes="(max-width: 480px) 100vw, (max-width: 768px) 100vw, (max-width: 1280px) 100vw, 1280px"
          quality={75}
          priority
          className="object-cover object-left-top sm:object-center"
        />
        {/* Shop Now overlay — stays inside the left text panel at every breakpoint */}
        <div className="absolute left-[8%] top-[58%] sm:left-[13%] sm:top-[50%] md:left-[14%] md:top-[52%]">
          <Link
            href="/shop"
            className="inline-block bg-[#7C4A22] hover:bg-[#5E3518] text-white font-semibold tracking-widest uppercase
                       text-[9px] px-3 py-1.5
                       sm:text-xs sm:px-5 sm:py-2.5
                       md:text-sm md:px-7 md:py-3
                       transition-colors duration-200"
          >
            Shop Now
          </Link>
        </div>
      </div>
    </section>
  );
}
