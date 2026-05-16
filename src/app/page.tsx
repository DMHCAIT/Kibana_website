import dynamic from "next/dynamic";
import { HeroBanner } from "@/components/home/hero-banner";
import { NewArrivals } from "@/components/home/new-arrivals";
import { Craftsmanship } from "@/components/home/craftsmanship";
import { getProducts, getSiteConfig, getCategories } from "@/lib/server-data";
import type { Product } from "@/types/product";

const SectionSkeleton = () => <div className="w-full h-48 md:h-64 bg-muted/40 animate-pulse" />;

// Lazy-load everything below the fold
const BestSellers    = dynamic(() => import("@/components/home/best-sellers").then(m => ({ default: m.BestSellers })), { loading: () => <SectionSkeleton /> });
const ShopByCategory = dynamic(() => import("@/components/home/shop-by-category").then(m => ({ default: m.ShopByCategory })), { loading: () => <SectionSkeleton /> });
const ViralBags      = dynamic(() => import("@/components/home/viral-bags").then(m => ({ default: m.ViralBags })), { loading: () => <SectionSkeleton /> });
const MostTrending   = dynamic(() => import("@/components/home/most-trending").then(m => ({ default: m.MostTrending })), { loading: () => <SectionSkeleton /> });
const AboutUs        = dynamic(() => import("@/components/home/about-us").then(m => ({ default: m.AboutUs })), { loading: () => <SectionSkeleton /> });
const StyleInMotion  = dynamic(() => import("@/components/home/style-in-motion").then(m => ({ default: m.StyleInMotion })), { loading: () => <SectionSkeleton /> });
const CustomerReview = dynamic(() => import("@/components/home/customer-review").then(m => ({ default: m.CustomerReview })), { loading: () => <SectionSkeleton /> });

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
    case "new-arrivals":    return allProducts.filter((p) => p.isNew).slice(0, 4);
    case "best-sellers":    return allProducts.filter((p) => p.isBestSeller).slice(0, 4);
    case "viral-bags":      return allProducts.filter((p) => p.isTrending).slice(0, 3);
    case "most-trending":   return allProducts.filter((p) => p.isTrending).slice(0, 8);
    case "style-in-motion": return allProducts.slice(0, 6);
    default:                return [];
  }
}

export default async function HomePage() {
  const products = await getProducts();
  const config   = await getSiteConfig();
  const categories = await getCategories();
  const pinned   = config.sectionProducts ?? {};
  const sections = config.sections
    .filter((s) => s.visible)
    .sort((a, b) => a.order - b.order);

  const SECTION_COMPONENTS: Record<string, (products: Product[]) => React.ReactNode> = {
    "new-arrivals":     (p) => <NewArrivals products={p} />,
    "best-sellers":     (p) => <BestSellers products={p} />,
    "shop-by-category": (_) => <ShopByCategory categories={categories} />,
    "viral-bags":       (p) => <ViralBags products={p} />,
    "most-trending":    (p) => <MostTrending products={p} />,
    "about-us":         (_) => <AboutUs />,
    "style-in-motion":  (p) => <StyleInMotion products={p} />,
    "craftsmanship":    (_) => <Craftsmanship />,
    "customer-review":  (_) => <CustomerReview />,
  };

  return (
    <>
      <HeroBanner />
      {sections.map((s) => {
        const render = SECTION_COMPONENTS[s.id];
        if (!render) return null;
        const sectionProds = sectionProducts(products, s.id, pinned);
        return <div key={s.id}>{render(sectionProds)}</div>;
      })}
    </>
  );
}

