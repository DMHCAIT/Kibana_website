export const dynamic = "force-dynamic";

import dynamicImport from "next/dynamic";
import { HeroBanner } from "@/components/home/hero-banner";
import { AnnouncementBanner } from "@/components/layout/announcement-banner";
import { NewArrivals } from "@/components/home/new-arrivals";
import { getProducts, getSiteConfig, getCategories } from "@/lib/server-data";
import type { Product } from "@/types/product";

const SectionSkeleton = () => <div className="h-48 w-full animate-pulse bg-muted/40 md:h-64" />;

// Lazy-load everything below the fold
const BestSellers = dynamicImport(
  () => import("@/components/home/best-sellers").then((m) => ({ default: m.BestSellers })),
  { loading: () => <SectionSkeleton /> },
);
const ShopByCategory = dynamicImport(
  () => import("@/components/home/shop-by-category").then((m) => ({ default: m.ShopByCategory })),
  { loading: () => <SectionSkeleton /> },
);
const MostTrending = dynamicImport(
  () => import("@/components/home/most-trending").then((m) => ({ default: m.MostTrending })),
  { loading: () => <SectionSkeleton /> },
);
const AboutUs = dynamicImport(
  () => import("@/components/home/about-us").then((m) => ({ default: m.AboutUs })),
  { loading: () => <SectionSkeleton /> },
);
const StyleInMotion = dynamicImport(
  () => import("@/components/home/style-in-motion").then((m) => ({ default: m.StyleInMotion })),
  { loading: () => <SectionSkeleton /> },
);
const CustomerReview = dynamicImport(
  () => import("@/components/home/customer-review").then((m) => ({ default: m.CustomerReview })),
  { loading: () => <SectionSkeleton /> },
);

/** Resolve which products to show for a section.
 *  If the admin has pinned specific product IDs → use those in that order.
 *  Otherwise fall back to tag-based filtering. */
function sectionProducts(
  allProducts: Product[],
  sectionId: string,
  pinned: Record<string, string[]>,
): Product[] {
  const ids = pinned[sectionId] ?? [];
  if (ids.length > 0) {
    // Return pinned products in the order the admin set
    return ids.map((id) => allProducts.find((p) => p.id === id)).filter(Boolean) as Product[];
  }
  // Fallback: tag-based
  switch (sectionId) {
    case "new-arrivals":
      return allProducts.filter((p) => p.isNew).slice(0, 4);
    case "best-sellers":
      return allProducts.filter((p) => p.isBestSeller).slice(0, 4);
    case "viral-bags":
      return allProducts.filter((p) => p.isTrending).slice(0, 3);
    case "most-trending":
      return allProducts.filter((p) => p.isTrending).slice(0, 8);
    case "style-in-motion":
      return allProducts;
    default:
      return [];
  }
}

export default async function HomePage() {
  const [products, config, categories] = await Promise.all([
    getProducts(),
    getSiteConfig(),
    getCategories(),
  ]);
  const pinned = config?.sectionProducts ?? {};
  const sections = config.sections.filter((s) => s.visible).sort((a, b) => a.order - b.order);

  const SECTION_COMPONENTS: Record<string, (products: Product[]) => React.ReactNode> = {
    "new-arrivals": (p) => <NewArrivals products={products} />,
    "best-sellers": (p) => <BestSellers products={p} config={config.sectionContent?.bestSellers} />,
    "shop-by-category": (_) => <ShopByCategory categories={categories} />,
    "most-trending": (p) => <MostTrending products={products} />,
    "about-us": (_) => <AboutUs />,
    "style-in-motion": (p) => <StyleInMotion products={p} />,
    "customer-review": (_) => <CustomerReview />,
  };

  return (
    <>
      <HeroBanner />
      <AnnouncementBanner text={config.announcementBar} />
      {sections.map((s, i) => {
        if (s.id === "customer-review") return null;
        const render = SECTION_COMPONENTS[s.id];
        if (!render) return null;
        // For new-arrivals and most-trending, components manage their own products
        const sectionProds = 
          s.id === "new-arrivals" || s.id === "most-trending" 
            ? products 
            : sectionProducts(products, s.id, pinned);
        const bg = i % 2 === 0 ? "bg-white" : "bg-[#fdf8f3]";
        const wrapperClass = s.id === "new-arrivals" ? "" : bg;
        return (
          <div key={s.id} className={wrapperClass}>
            {render(sectionProds)}
          </div>
        );
      })}
    </>
  );
}
