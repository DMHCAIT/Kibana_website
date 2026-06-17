import Image from "next/image";
import Link from "next/link";
import { categories as staticCategories } from "@/lib/data";
import { SectionHeading } from "./section-heading";

type Cat = { slug: string; name: string; image: string };

export function ShopByCategory({ categories }: { categories?: Cat[] }) {
  const cats = categories ?? staticCategories;
  return (
    <section className="w-full bg-[#f5f0e8]">
      <div className="container py-2 md:py-6">
        <SectionHeading title="Shop by Category" />
        {/* 2 per row on mobile, 3 per row on tablet and desktop */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {cats.map((c) =>
            c.slug === "wallet" || c.name.toLowerCase().includes("wallet") ? (
              <Link
                key="view-more-cta"
                href="/shop"
                className="group flex flex-col items-center gap-1 text-center"
              >
                <span className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg bg-kibana-stone shadow-md">
                  <Image
                    src="/mv/cat-6.jpeg"
                    alt=""
                    fill
                    sizes="(max-width: 640px) 40vw, 28vw"
                    className="scale-110 object-cover blur-[1.5px] brightness-75"
                  />
                  <span className="absolute inset-0 bg-kibana-ink/20" />
                  <span className="relative z-[1] inline-flex items-center justify-center bg-kibana-ink px-5 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-kibana-cream shadow-[0_6px_16px_rgba(0,0,0,0.35)] transition-colors duration-300 group-hover:bg-black sm:px-6 sm:text-xs">
                    View More
                  </span>
                </span>
              </Link>
            ) : (
              <Link
                key={c.slug}
                href={`/shop?cat=${c.slug}`}
                className="group flex flex-col items-center gap-1 text-center"
              >
                <span className="relative aspect-square w-full overflow-hidden rounded-lg bg-kibana-cream">
                  <Image
                    src={c.image}
                    alt={c.name}
                    fill
                    sizes="(max-width: 640px) 40vw, 28vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </span>
                <span className="text-center text-xs leading-tight sm:text-sm md:text-base">
                  {c.name}
                </span>
              </Link>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
