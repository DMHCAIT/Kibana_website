import type { Metadata } from "next";

import { getProducts, getCategories } from "@/lib/server-data";
import { productHasShoulderKeyword } from "@/lib/product-filters";
import { ProductGrid } from "@/components/product/product-grid";
import { ShopHeader } from "@/components/shop/shop-header";
import { getShopDisplayImage } from "@/lib/product-images";
import { TrackProductListingView } from "@/components/analytics/track-product-listing-view";
import { TrackSearch } from "@/components/analytics/track-search";
import type { Product } from "@/types/product";

// Disable static caching for dynamic inventory/out-of-stock updates
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Shop Premium Bags | Kibana",
  description:
    "Explore Kibana's premium vegan-leather handbags, totes, sling bags, backpacks, and wallets.",
  alternates: {
    canonical: "/shop",
  },
  openGraph: {
    title: "Shop Premium Bags | Kibana",
    description:
      "Explore Kibana's premium vegan-leather handbags, totes, sling bags, backpacks, and wallets.",
    type: "website",
    url: "/shop",
  },
};

type SearchParams = {
  cat?: string;
  q?: string;
  sort?: string;
  slugs?: string;
  title?: string;
};

type ProductListItem = {
  key: string;
  product: Product;
  href?: string;
  displayName?: string;
  displayImage?: string;
  variantInStock?: boolean;
  variantKey?: string; // Unique key for wishlist tracking per color variant
};

function toVariantListingItems(product: Product): ProductListItem[] {
  if (!product.colorVariants?.length) {
    return [{ key: product.id, product, variantKey: product.id }];
  }

  return product.colorVariants.map((variant) => ({
    key: `${product.id}-${variant.slug}`,
    product,
    href: `/shop/${product.slug}?color=${variant.slug}`,
    displayName:
      (product.slug === "large-aurelia-fan-tote" && variant.slug === "mocha") ||
      product.slug === "mini-aurelia-fan-tote"
        ? "Mini Aurelia Fan Tote"
        : variant.productTitle || `${product.name} - ${variant.color}`,
    displayImage: getShopDisplayImage(product, variant),
    variantInStock: variant.inStock !== false,
    variantKey: `${product.id}-${variant.slug}`, // Use key as variantKey for wishlist
  }));
}

export default async function ShopPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { cat, q, sort = "featured", slugs, title } = await searchParams;
  const products = await getProducts();
  const categories = await getCategories();
  const selectedCategories = cat
    ? cat
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean)
    : [];
  const selectedSlugs = slugs
    ? slugs
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean)
    : [];

  let filtered = products;
  if (selectedSlugs.length > 0) {
    filtered = filtered.filter((p) => selectedSlugs.includes(p.slug));
  }
  if (selectedCategories.length > 0) {
    filtered = filtered.filter((p) => {
      const matchesSelectedCategory = selectedCategories.some((slug) =>
        slug === "shoulder-bag" ? productHasShoulderKeyword(p) : p.category === slug,
      );
      return matchesSelectedCategory;
    });
  }
  if (q) {
    const query = q.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.colorVariants?.some(
          (variant) =>
            variant.color.toLowerCase().includes(query) ||
            variant.productTitle?.toLowerCase().includes(query),
        ),
    );
  }

  // Apply sort
  if (sort === "price-asc") filtered = [...filtered].sort((a, b) => a.price - b.price);
  else if (sort === "price-desc") filtered = [...filtered].sort((a, b) => b.price - a.price);
  else {
    // Default "featured" sort - stable sort by ID for consistency
    filtered = [...filtered].sort((a, b) => a.id.localeCompare(b.id));
  }

  const listingItems = filtered.flatMap(toVariantListingItems);

  const heading = title
    ? decodeURIComponent(title)
    : q
      ? `Search results for "${q}"`
      : selectedCategories.length === 1
        ? (categories.find((c) => c.slug === selectedCategories[0])?.name ?? "Shop")
        : selectedCategories.length > 1
          ? selectedCategories
              .map((slug) => categories.find((c) => c.slug === slug)?.name ?? slug)
              .join(" + ")
          : "Shop all bags";

  return (
    <>
      {q && <TrackSearch query={q} resultsCount={listingItems.length} />}
      <TrackProductListingView
        category={selectedCategories[0]}
        productCount={listingItems.length}
      />
      <section className="container py-6 md:py-10">
        <ShopHeader heading={heading} count={listingItems.length} sort={sort} showSort />

        {listingItems.length > 0 ? (
          <ProductGrid items={listingItems} variant="full" />
        ) : (
          <div className="rounded-xl border border-dashed border-border px-6 py-16 text-center text-sm text-muted-foreground">
            No products in this category yet — check back soon.
          </div>
        )}
      </section>
    </>
  );
}
