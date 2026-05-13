import { HeroBanner } from "@/components/home/hero-banner";
import { NewArrivals } from "@/components/home/new-arrivals";
import { BestSellers } from "@/components/home/best-sellers";
import { ShopByPrice } from "@/components/home/shop-by-price";
import { MostTrending } from "@/components/home/most-trending";
import { StyleInMotion } from "@/components/home/style-in-motion";
import { CustomerReview } from "@/components/home/customer-review";

export default function HomePage() {
  return (
    <>
      <HeroBanner />
      <NewArrivals />
      <BestSellers />
      <ShopByPrice />
      <MostTrending />
      <StyleInMotion />
      <CustomerReview />
    </>
  );
}
