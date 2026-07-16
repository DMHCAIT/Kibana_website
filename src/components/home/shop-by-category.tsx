import Image from "next/image";
import Link from "next/link";
import { categories as staticCategories } from "@/lib/data";
import { SectionHeading } from "./section-heading";

// STATIC CATEGORY CONFIGURATION - DO NOT CHANGE
const STATIC_CATEGORIES = [
  { slug: "shoulder-bag", name: "Shoulder Bags", image: "/mv/cat-5.jpeg" },
  { slug: "laptop-bag", name: "Laptop Bag", image: "/mv/cat-3.jpeg" },
  { slug: "sling-bag", name: "Sling Bag", image: "/mv/cat-4.jpeg" },
  { slug: "clutch", name: "Clutch", image: "/mv/cat-2.jpeg" },
  { slug: "backpack", name: "Backpack", image: "/mv/cat-1.jpeg" },
  { slug: "wallet", name: "Wallet", image: "/mv/cat-6.jpeg" },
];

export function ShopByCategory({ categories }: { categories?: any }) {
  return (
    <section className="w-full bg-[#f5f0e8]">
      <div className="container py-2 md:py-6">
        <SectionHeading title="Shop by Category" />
        {/* 2 per row on mobile, 3 per row on tablet and desktop */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {STATIC_CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={cat.slug === "wallet" ? "/shop" : `/shop?cat=${cat.slug}`}
              className="group flex flex-col items-center gap-1 text-center"
            >
              <span className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg bg-kibana-cream">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 640px) 40vw, 28vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />

                {cat.slug === "wallet" ? (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 opacity-100 transition-all duration-300">
                    <span className="bg-black px-6 py-2 text-xs font-semibold tracking-wide text-white sm:text-sm">
                      VIEW MORE
                    </span>
                  </div>
                ) : null}
              </span>

              {cat.slug === "wallet" ? null : (
                <span className="text-center text-xs leading-tight sm:text-sm md:text-base">
                  {cat.name}
                </span>
              )}
            </Link>
          ))}

          {/* Removed standalone View More card — using overlay buttons on category/product cards instead */}
        </div>
      </div>
    </section>
  );
}
