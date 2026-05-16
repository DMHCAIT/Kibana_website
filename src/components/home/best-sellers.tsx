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
  const leftImage  = config?.leftImage  || "/extracted/backpack-left.png";
  const rightImage = config?.rightImage || "/extracted/backpack-right.png";
  const heading    = config?.heading    || "GOT YOUR BACK";
  const buttonText = config?.buttonText || "SHOP NOW";

  // Resolve product slug: prefer admin config, then backpack product, then first product, then default
  const shopSlug =
    config?.productSlug ||
    (products.find((p) => p.category === "backpack" || p.slug?.toLowerCase().includes("backpack")) ?? products[0])?.slug ||
    "orwyn-backpack";

  return (
    <section className="container py-6 md:py-10">
      <SectionHeading title="Best Sellers" />

      {/* Full-width split banner */}
      <div className="relative flex h-56 sm:h-72 md:h-[380px] lg:h-[480px] overflow-hidden">

        {/* Left image */}
        <div className="relative w-1/2 overflow-hidden">
          <Image
            src={leftImage}
            alt="Best seller — left view"
            fill
            sizes="50vw"
            className="object-cover object-center"
            priority
          />
        </div>

        {/* Right image */}
        <div className="relative w-1/2 overflow-hidden">
          <Image
            src={rightImage}
            alt="Best seller — right view"
            fill
            sizes="50vw"
            className="object-cover object-center"
            priority
          />
        </div>

        {/* Centered overlay: heading + button */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 gap-3 sm:gap-4">
          <h2 className="font-sans text-white text-xl sm:text-2xl md:text-3xl lg:text-4xl font-thin leading-tight tracking-[0.06em] text-center uppercase drop-shadow-sm">
            {heading.split(" ").map((word, i) => (
              <span key={i}>
                {i > 0 && <br />}
                {word === "BACK" || word === "Back" || word === "back"
                  ? <>BA<span className="inline-block" style={{ transform: "scaleX(-1)" }}>C</span>K</>
                  : word}
              </span>
            ))}
          </h2>
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
