export const dynamic = "force-dynamic";

import { getProducts, getCategories } from "@/lib/server-data";
import { ProductGrid } from "@/components/product/product-grid";
import { ShopByGender } from "@/components/product/shop-by-gender";
import { ShopHeader } from "@/components/shop/shop-header";

type SearchParams = { cat?: string; gender?: string; q?: string; sort?: string };

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { cat, gender, q, sort = "featured" } = await searchParams;
  const products = await getProducts();
  const categories = await getCategories();

  let filtered = products;
  if (cat) filtered = filtered.filter((p) => p.category === cat);
  if (gender) filtered = filtered.filter((p) => p.gender === gender);
  if (q) {
    const query = q.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
    );
  }

  // Apply sort
  if (sort === "price-asc") filtered = [...filtered].sort((a, b) => a.price - b.price);
  else if (sort === "price-desc") filtered = [...filtered].sort((a, b) => b.price - a.price);

  const heading = q
    ? `Search results for "${q}"`
    : cat
    ? categories.find((c) => c.slug === cat)?.name ?? "Shop"
    : "Shop all bags";

  return (
    <section className="container py-6 md:py-10">
      {/* Gender category sections - show only on unfiltered shop page */}
      {!q && !gender && !cat && <ShopByGender />}

      <ShopHeader
        heading={heading}
        count={filtered.length}
        activeCat={cat}
        sort={sort}
        showSort
        categories={categories}
      />

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
