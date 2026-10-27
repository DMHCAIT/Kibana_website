import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ShopListing, { type CollectionSearchParams } from "@/components/shop/shop-listing";
import { SHOP_CATEGORIES } from "@/lib/shop-categories";

export const revalidate = 0;

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<CollectionSearchParams>;
};

async function getCategory(params: Props["params"]) {
  const { slug } = await params;
  const category = SHOP_CATEGORIES.find((item) => item.href === `/category/${slug}`);
  if (!category) notFound();
  return category;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = await getCategory(params);
  return {
    title: `${category.name} | Kibana`,
    alternates: { canonical: category.href },
    openGraph: { title: `${category.name} | Kibana`, url: category.href },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const category = await getCategory(params);
  return <ShopListing category={category.slug} searchParams={searchParams} />;
}
