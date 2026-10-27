import type { Metadata } from "next";
import ShopListing, { type CollectionSearchParams } from "@/components/shop/shop-listing";

export const revalidate = 0;
export const metadata: Metadata = {
  title: "New Arrivals | Kibana",
  alternates: { canonical: "/new-arrivals" },
  openGraph: { title: "New Arrivals | Kibana", url: "/new-arrivals" },
};

export default function NewArrivalsPage({
  searchParams,
}: {
  searchParams: Promise<CollectionSearchParams>;
}) {
  return <ShopListing newArrivals searchParams={searchParams} />;
}
