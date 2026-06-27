import type { Metadata } from "next";

import { getProducts, getCategories } from "@/lib/server-data";
import { ProductGrid } from "@/components/product/product-grid";
import { ShopHeader } from "@/components/shop/shop-header";
import { pickDefaultProductImage } from "@/lib/product-images";
import type { Product } from "@/types/product";

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
};

function getShopDisplayImage(product: Product, variant: Product["colorVariants"][number]) {
  if (product.slug === "prizma-sling-bag") {
    return variant.gallery?.[0] ?? product.gallery?.[0] ?? variant.image ?? product.image;
  }

  if (product.slug === "valera-dome") {
    const valeraImageByColor: Record<string, string> = {
      black: "06",
      "forest-green": "02",
      "milky-blue": "01",
      "royal-blue": "06",
    };
    const targetNumber = valeraImageByColor[variant.slug];
    if (targetNumber) {
      return (
        variant.image?.replace(/Image\d+\.webp$/i, `Image${targetNumber}.webp`) ??
        variant.image ??
        product.image
      );
    }
  }

  if (product.slug === "cordia-bag") {
    const cordiaImageByColor: Record<string, string> = {
      black: "01",
      "light-purple": "06",
      "lime-yellow": "06",
    };
    const targetNumber = cordiaImageByColor[variant.slug];
    if (targetNumber) {
      return (
        variant.image?.replace(/Image\d+\.webp$/i, `Image${targetNumber}.webp`) ??
        variant.image ??
        product.image
      );
    }
  }

  if (product.slug === "halo-mini" && variant.slug === "turquoise-blue") {
    return (
      variant.image?.replace(/Image\d+\.webp$/i, "Image02.webp") ?? variant.image ?? product.image
    );
  }

  if (product.slug === "crescent-sling-bag") {
    const crescentImageByColor: Record<string, string> = {
      "milky-blue": "01",
      "turquoise-blue": "06",
      wine: "05",
    };
    const targetNumber = crescentImageByColor[variant.slug];
    if (targetNumber) {
      return (
        variant.image?.replace(/Image\d+\.webp$/i, `Image${targetNumber}.webp`) ??
        variant.image ??
        product.image
      );
    }
  }

  if (product.slug === "business-laptop-briefcase") {
    const targetImageNumber =
      variant.slug === "black" ? "7" : variant.slug === "tan" ? "4" : undefined;
    if (targetImageNumber) {
      return (
        variant.image?.replace(/\/\d+\.webp$/i, `/${targetImageNumber}.webp`) ??
        variant.image ??
        product.image
      );
    }
  }

  if (product.slug === "lekha-wallet") {
    const targetImage = variant.slug === "wine" ? "/5.webp" : "/2.webp";
    return (
      variant.image?.replace(/\/\d+\.webp$/i, targetImage) ?? variant.gallery?.[0] ?? variant.image
    );
  }

  if (product.slug === "zippy-wallet") {
    return variant.image?.replace(/\/\d+\.webp$/i, "/1.webp") ?? variant.image ?? product.image;
  }

  if (product.slug === "sandesh-laptop-bag" && variant.slug === "tan") {
    return (
      variant.image?.replace(/\/\d+\.webp$/i, "/7.webp") ?? variant.gallery?.[5] ?? variant.image
    );
  }

  if (product.slug === "sandesh-laptop-bag" && variant.slug === "teal-blue") {
    return (
      variant.image?.replace(/\/\d+\.webp$/i, "/7.webp") ?? variant.gallery?.[5] ?? variant.image
    );
  }

  if (product.slug === "vistapack") {
    const targetImageNumber =
      variant.slug === "tan"
        ? "6"
        : variant.slug === "milky-blue"
          ? "4"
          : variant.slug === "mint-green" || variant.slug === "teal-blue"
            ? "2"
            : "5";
    const colorImage = variant.image?.replace(/\/\d+\.webp$/i, `/${targetImageNumber}.webp`);
    return (
      colorImage ??
      variant.gallery?.[3] ??
      product.gallery?.[3] ??
      variant.gallery?.[0] ??
      variant.image ??
      product.image
    );
  }

  return pickDefaultProductImage(
    variant.image || product.image,
    variant.gallery ?? product.gallery,
  );
}

function toVariantListingItems(product: Product): ProductListItem[] {
  if (!product.colorVariants?.length) {
    return [{ key: product.id, product }];
  }

  return product.colorVariants
    .filter((variant) => !(product.slug === "sandesh-laptop-bag" && variant.slug === "mint-green"))
    .map((variant) => ({
      key: `${product.id}-${variant.slug}`,
      product,
      href: `/shop/${product.slug}?color=${variant.slug}`,
      displayName: variant.productTitle || `${product.name} - ${variant.color}`,
      displayImage: getShopDisplayImage(product, variant),
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
    filtered = filtered.filter((p) => selectedCategories.includes(p.category));
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
  );
}
