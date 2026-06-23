import type { Metadata } from "next";

import { getProducts, getCategories } from "@/lib/server-data";
import { ProductGrid } from "@/components/product/product-grid";
import { ShopByGender } from "@/components/product/shop-by-gender";
import { ShopHeader } from "@/components/shop/shop-header";

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
  gender?: string;
  q?: string;
  sort?: string;
  slugs?: string;
  title?: string;
};

export default async function ShopPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { cat, gender, q, sort = "featured", slugs, title } = await searchParams;
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
    filtered = filtered.filter((p) => selectedCategories.includes(p.category));
  }
  if (gender) filtered = filtered.filter((p) => p.gender === gender);
  if (q) {
    const query = q.toLowerCase();
    filtered = filtered.filter(
      (p) => p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query),
    );
  }

  // Apply sort
  if (sort === "price-asc") filtered = [...filtered].sort((a, b) => a.price - b.price);
  else if (sort === "price-desc") filtered = [...filtered].sort((a, b) => b.price - a.price);

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
    <section className="container py-6 md:py-10">
      {/* Gender category sections - show only on unfiltered shop page */}
      {!q && !gender && !cat && <ShopByGender />}

      <ShopHeader heading={heading} count={filtered.length} sort={sort} showSort />

      {filtered.length > 0 ? (
        <ProductGrid products={filtered} variant="full" />
      ) : (
        <div className="rounded-xl border border-dashed border-border px-6 py-16 text-center text-sm text-muted-foreground">
          No products in this category yet — check back soon.
        </div>
      )}
    </section>
  );
}
