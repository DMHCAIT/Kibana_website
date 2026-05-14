import dynamic from "next/dynamic";
import { HeroBanner } from "@/components/home/hero-banner";
import { NewArrivals } from "@/components/home/new-arrivals";

const SectionSkeleton = () => <div className="w-full h-48 md:h-64 bg-muted/40 animate-pulse" />;

// Lazy-load everything below the fold
const BestSellers    = dynamic(() => import("@/components/home/best-sellers").then(m => ({ default: m.BestSellers })), { loading: () => <SectionSkeleton /> });
const ShopByCategory = dynamic(() => import("@/components/home/shop-by-category").then(m => ({ default: m.ShopByCategory })), { loading: () => <SectionSkeleton /> });
const ViralBags      = dynamic(() => import("@/components/home/viral-bags").then(m => ({ default: m.ViralBags })), { loading: () => <SectionSkeleton /> });
const Craftsmanship  = dynamic(() => import("@/components/home/craftsmanship").then(m => ({ default: m.Craftsmanship })), { loading: () => <SectionSkeleton /> });
const MostTrending   = dynamic(() => import("@/components/home/most-trending").then(m => ({ default: m.MostTrending })), { loading: () => <SectionSkeleton /> });
const AboutUs        = dynamic(() => import("@/components/home/about-us").then(m => ({ default: m.AboutUs })), { loading: () => <SectionSkeleton /> });
const StyleInMotion  = dynamic(() => import("@/components/home/style-in-motion").then(m => ({ default: m.StyleInMotion })), { loading: () => <SectionSkeleton /> });
const CustomerReview = dynamic(() => import("@/components/home/customer-review").then(m => ({ default: m.CustomerReview })), { loading: () => <SectionSkeleton /> });

export default function HomePage() {
  return (
    <>
      <HeroBanner />
      <NewArrivals />
      <BestSellers />
      <ShopByCategory />
      <ViralBags />
      <Craftsmanship />
      <MostTrending />
      <AboutUs />
      <StyleInMotion />
      <CustomerReview />
    </>
  );
}
