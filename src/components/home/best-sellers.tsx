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

      {/* Full-width banner — controlled height per breakpoint */}
      <div className="relative w-full aspect-[3/2] sm:aspect-[16/9] md:aspect-[16/7] overflow-hidden">
        <Image
          src={bannerImage}
          alt="Best Sellers"
          fill
          sizes="(max-width: 480px) 100vw, (max-width: 768px) 100vw, (max-width: 1280px) 100vw, 1280px"
          quality={75}
          priority
          className="object-cover object-top sm:object-center"
        />
        {/* Shop Now overlay button — positioned right below the "LUXURY MEET" text */}
        <div className="absolute left-[12%] top-[52%] sm:left-[13%] sm:top-[50%] md:left-[14%] md:top-[52%]">
          <Link
            href="/shop"
            className="inline-block bg-[#7C4A22] hover:bg-[#5E3518] text-white font-semibold tracking-widest uppercase
                       text-[10px] px-4 py-2
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
