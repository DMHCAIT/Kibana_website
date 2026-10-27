import dynamicImport from "next/dynamic";
import { Suspense } from "react";

// ⚡ Enable ISR: revalidate every 60 seconds instead of on every request
export const revalidate = 60;
import { HeroBanner } from "@/components/home/hero-banner";
import { NewArrivals } from "@/components/home/new-arrivals";
import { SocialFeed } from "@/components/home/social-feed";
import { TrackPageView } from "@/components/analytics/track-page-view";
import { Reveal } from "@/components/ui/reveal";
import { getProducts, getSiteConfig } from "@/lib/server-data";
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

async function HomeSections() {
  const [products, config] = await Promise.all([getProducts(), getSiteConfig()]);
  const pinned = config?.sectionProducts ?? {};
  const sections = config.sections.filter((s) => s.visible).sort((a, b) => a.order - b.order);

  const SECTION_COMPONENTS: Record<string, (products: Product[]) => React.ReactNode> = {
    "new-arrivals": (_) => <NewArrivals products={products} />,
    "best-sellers": (_) => <BestSellers products={products} />,
    "shop-by-category": (_) => <ShopByCategory products={products} />,
    "most-trending": (_) => <MostTrending products={products} />,
    "about-us": (_) => <AboutUs />,
    "style-in-motion": (_) => <StyleInMotion />,
    "customer-review": (_) => <CustomerReview />,
    "social-feed": (_) => <SocialFeed />,
  };

  return (
    <>
      {sections.map((s) => {
        if (s.id === "customer-review") return null;
        const render = SECTION_COMPONENTS[s.id];
        if (!render) return null;
        // Ranked homepage sections select their own variants from the full catalog.
        const sectionProds =
          s.id === "new-arrivals" || s.id === "most-trending" || s.id === "best-sellers"
            ? products
            : sectionProducts(products, s.id, pinned);
        return (
          <Reveal key={s.id} className="bg-white">
            {render(sectionProds)}
          </Reveal>
        );
      })}
    </>
  );
}

export default function HomePage() {
  return (
    <div className="storefront-home">
      <TrackPageView pageName="Home" pageType="homepage" />
      <HeroBanner />
      <Suspense
        fallback={
          <div role="status" aria-label="Loading collections" className="container py-10">
            <span className="sr-only">Loading collections...</span>
            <SectionSkeleton />
            <SectionSkeleton />
          </div>
        }
      >
        <HomeSections />
      </Suspense>
    </div>
  );
}
