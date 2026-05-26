import Image from "next/image";
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
  const bannerImage = config?.leftImage || "/mv/Best-Seller-Banner-New.jpg.jpeg";

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
      </div>
    </section>
  );
}
