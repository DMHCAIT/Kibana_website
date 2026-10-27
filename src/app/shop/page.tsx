import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import ShopListing, { type CollectionSearchParams } from "@/components/shop/shop-listing";
import { SHOP_CATEGORIES } from "@/lib/shop-categories";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Shop Premium Bags | Kibana",
  description:
    "Explore Kibana's premium vegan-leather handbags, totes, sling bags, backpacks, and wallets.",
  alternates: { canonical: "/shop" },
  openGraph: {
    title: "Shop Premium Bags | Kibana",
    description:
      "Explore Kibana's premium vegan-leather handbags, totes, sling bags, backpacks, and wallets.",
    type: "website",
    url: "/shop",
  },
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<CollectionSearchParams>;
}) {
  const params = await searchParams;
  const category = SHOP_CATEGORIES.find((item) => item.slug === (params.cat || params.category));
  const isNewArrivals =
    params.title === "New Arrivals" && params.slugs && !params.cat && !params.category;
  if (category || isNewArrivals) {
    const remaining = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || key === "cat" || key === "category") continue;
      if (isNewArrivals && (key === "slugs" || key === "title")) continue;
      remaining.set(key, value);
    }
    const query = remaining.toString();
    permanentRedirect(`${category?.href ?? "/new-arrivals"}${query ? `?${query}` : ""}`);
  }
  return <ShopListing searchParams={Promise.resolve(params)} />;
}
