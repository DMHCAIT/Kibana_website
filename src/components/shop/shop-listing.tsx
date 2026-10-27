import { getProducts, getCategories } from "@/lib/server-data";
import { CollectionView } from "@/components/shop/collection-view";
import { getShopDisplayImage } from "@/lib/product-images";
import { TrackProductListingView } from "@/components/analytics/track-product-listing-view";
import { TrackSearch } from "@/components/analytics/track-search";
import type { Product } from "@/types/product";
import { productHref, productInStock, taggedProducts } from "@/lib/product-presentation";

export type CollectionSearchParams = {
  cat?: string;
  category?: string;
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
    return [
      { key: product.id, product, variantKey: product.id, variantInStock: productInStock(product) },
    ];
  }

  return product.colorVariants.map((variant) => ({
    key: `${product.id}-${variant.slug}`,
    product,
    href: productHref(product, variant),
    displayName: variant.productTitle || `${product.name} - ${variant.color}`,
    displayImage: getShopDisplayImage(product, variant),
    variantInStock: productInStock(product, variant),
    variantKey: `${product.id}-${variant.slug}`, // Use key as variantKey for wishlist
  }));
}

export default async function ShopListing({
  searchParams,
  category,
  newArrivals = false,
}: {
  searchParams: Promise<CollectionSearchParams>;
  category?: string;
  newArrivals?: boolean;
}) {
  const {
    cat: rawCat,
    category: rawCategory,
    q,
    sort = "featured",
    slugs,
    title,
  } = await searchParams;
  const cat = category ?? (rawCat || rawCategory);
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
  if (newArrivals) filtered = taggedProducts(filtered, "isNew");
  if (selectedSlugs.length > 0) {
    filtered = filtered.filter((p) => selectedSlugs.includes(p.slug));
  }
  if (selectedCategories.length > 0) {
    filtered = filtered.filter((p) => {
      // ⚡ Fixed: Check category directly instead of keyword matching
      const matchesSelectedCategory = selectedCategories.some((slug) => p.category === slug);
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
  else if (sort === "newest")
    filtered = [...filtered].sort((a, b) => Number(Boolean(b.isNew)) - Number(Boolean(a.isNew)));
  else {
    // Default "featured" sort - stable sort by ID for consistency
    filtered = [...filtered].sort((a, b) => a.id.localeCompare(b.id));
  }

  const variantGroups = filtered.map(toVariantListingItems);
  const listingItems: ProductListItem[] = [];
  if (sort === "price-asc" || sort === "price-desc" || sort === "newest") {
    listingItems.push(...variantGroups.flat());
  } else {
    const rounds = variantGroups.reduce((max, group) => Math.max(max, group.length), 0);
    for (let index = 0; index < rounds; index++) {
      for (const group of variantGroups) {
        const item = group[index];
        if (item) listingItems.push(item);
      }
    }
  }

  const heading = newArrivals
    ? "New Arrivals"
    : title
      ? decodeURIComponent(title)
      : q
        ? `Search results for "${q}"`
        : selectedCategories.length === 1
          ? (categories.find((c) => c.slug === selectedCategories[0])?.name ?? "Shop")
          : selectedCategories.length > 1
            ? selectedCategories
                .map((slug) => categories.find((c) => c.slug === slug)?.name ?? slug)
                .join(" + ")
            : "Shop All";

  return (
    <>
      {q && <TrackSearch query={q} resultsCount={listingItems.length} />}
      <TrackProductListingView
        category={selectedCategories[0]}
        productCount={listingItems.length}
      />
      <section className="mx-auto w-full max-w-[1920px]">
        <CollectionView heading={heading} items={listingItems} sort={sort} />
      </section>
    </>
  );
}
