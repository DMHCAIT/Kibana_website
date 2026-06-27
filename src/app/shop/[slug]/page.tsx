import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Suspense } from "react";
import { Check, Star } from "lucide-react";
import { getProductBySlug, getProducts } from "@/lib/server-data";
import { discountPct, formatINR, cn } from "@/lib/utils";
import { pickDefaultProductImage } from "@/lib/product-images";
import { ProductGrid } from "@/components/product/product-grid";
import { AddToCartButton } from "./add-to-cart";
import { ProductGallery } from "./product-gallery";
import { DeliveryCheck } from "./delivery-check";
import { WhatsAppShare } from "./whatsapp-share";
import { ShopHeader } from "@/components/shop/shop-header";
import { TrackProductView } from "@/components/analytics/track-product-view";
import type { Product } from "@/types/product";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found | Kibana",
      description: "The requested product does not exist.",
    };
  }

  return {
    title: `${product.name} | Kibana`,
    description: product.description,
    alternates: {
      canonical: `/shop/${product.slug}`,
    },
    openGraph: {
      title: `${product.name} | Kibana`,
      description: product.description,
      type: "website",
      url: `/shop/${product.slug}`,
      images: [{ url: product.image }],
    },
  };
}

const CATEGORY_LABELS: Record<Product["category"], string> = {
  "tote-bag": "Tote Bag",
  handbag: "Handbag",
  "laptop-bag": "Laptop Bag",
  "sling-bag": "Sling Bag",
  clutch: "Clutch",
  backpack: "Backpack",
  wallet: "Wallet",
};

async function RelatedProducts({
  category,
  productId,
}: {
  category: Product["category"];
  productId: string;
}) {
  const products = await getProducts();
  const related = products.filter((p) => p.category === category && p.id !== productId).slice(0, 4);
  if (related.length === 0) return null;

  return (
    <section className="container py-2 pb-20 sm:py-3 sm:pb-8 md:py-14">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em]">You may also like</h2>
      <ProductGrid products={related} />
    </section>
  );
}

export default async function ProductDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ color?: string }>;
}) {
  const { slug } = await params;
  const { color } = await searchParams;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const activeVariant =
    product.colorVariants?.find((v) => v.slug === color) ?? product.colorVariants?.[0];
  const activeProductTitle = activeVariant?.productTitle || product.name;
  const activeStockQty = activeVariant?.stockQty;
  const galleryImages = activeVariant?.gallery?.length
    ? activeVariant.gallery
    : (product.gallery ?? []);
  const valeraImageByColor: Record<string, string> = {
    black: "06",
    "forest-green": "02",
    "milky-blue": "01",
    "royal-blue": "06",
  };
  const cordiaImageByColor: Record<string, string> = {
    black: "01",
    "light-purple": "06",
    "lime-yellow": "06",
  };
  const crescentImageByColor: Record<string, string> = {
    "milky-blue": "01",
    "turquoise-blue": "06",
    wine: "05",
  };
  const primaryImage =
    product.slug === "valera-dome" && activeVariant?.slug
      ? (activeVariant.image?.replace(
          /Image\d+\.webp$/i,
          `Image${valeraImageByColor[activeVariant.slug] ?? "01"}.webp`,
        ) ??
        activeVariant.image ??
        product.image)
      : product.slug === "cordia-bag" && activeVariant?.slug
        ? (activeVariant.image?.replace(
            /Image\d+\.webp$/i,
            `Image${cordiaImageByColor[activeVariant.slug] ?? "01"}.webp`,
          ) ??
          activeVariant.image ??
          product.image)
        : product.slug === "halo-mini" && activeVariant?.slug === "turquoise-blue"
          ? (activeVariant.image?.replace(/Image\d+\.webp$/i, "Image02.webp") ??
            activeVariant.image ??
            product.image)
          : product.slug === "crescent-sling-bag" && activeVariant?.slug
            ? (activeVariant.image?.replace(
                /Image\d+\.webp$/i,
                `Image${crescentImageByColor[activeVariant.slug] ?? "01"}.webp`,
              ) ??
              activeVariant.image ??
              product.image)
            : product.slug === "business-laptop-briefcase" && activeVariant?.slug
              ? (activeVariant.image?.replace(
                  /\/\d+\.webp$/i,
                  `/${activeVariant.slug === "black" ? "7" : activeVariant.slug === "tan" ? "4" : "1"}.webp`,
                ) ??
                activeVariant.image ??
                product.image)
              : product.slug === "sandesh-laptop-bag" && activeVariant?.slug === "tan"
                ? (activeVariant.image?.replace(/\/\d+\.webp$/i, "/7.webp") ??
                  galleryImages[5] ??
                  activeVariant.image ??
                  product.image)
                : product.slug === "sandesh-laptop-bag" && activeVariant?.slug === "teal-blue"
                  ? (activeVariant.image?.replace(/\/\d+\.webp$/i, "/7.webp") ??
                    galleryImages[5] ??
                    activeVariant.image ??
                    product.image)
                  : product.slug === "vistapack"
                    ? (activeVariant?.image?.replace(
                        /\/\d+\.webp$/i,
                        `/${activeVariant?.slug === "tan" ? "6" : activeVariant?.slug === "milky-blue" ? "4" : activeVariant?.slug === "mint-green" || activeVariant?.slug === "teal-blue" ? "2" : "5"}.webp`,
                      ) ??
                      galleryImages[3] ??
                      activeVariant?.image ??
                      product.image)
                    : product.slug === "lekha-wallet"
                      ? (activeVariant.image?.replace(
                          /\/\d+\.webp$/i,
                          activeVariant?.slug === "wine" ? "/5.webp" : "/2.webp",
                        ) ??
                        galleryImages[0] ??
                        activeVariant.image ??
                        product.image)
                      : product.slug === "zippy-wallet"
                        ? (activeVariant?.image?.replace(/\/\d+\.webp$/i, "/1.webp") ??
                          activeVariant?.image ??
                          product.image)
                        : product.slug === "prizma-sling-bag"
                          ? (galleryImages[0] ?? activeVariant?.image ?? product.image)
                          : pickDefaultProductImage(
                              activeVariant?.image ?? product.image,
                              galleryImages,
                            );
  const allImages = Array.from(
    new Set(
      product.slug === "lekha-wallet"
        ? [primaryImage, activeVariant?.image, ...galleryImages].filter(Boolean)
        : [primaryImage, ...galleryImages].filter(Boolean),
    ),
  );

  // Per-color content overrides (fall back to product-level if not set per-color)
  const activeDescription = activeVariant?.description || product.description;
  const activeFeatures = activeVariant?.features?.length
    ? activeVariant.features
    : product.features;
  const activeSpecs =
    activeVariant?.specs && Object.keys(activeVariant.specs).length
      ? activeVariant.specs
      : product.specs;
  const pct = discountPct(product.price, product.compareAtPrice);
  const categoryLabel = CATEGORY_LABELS[product.category] ?? "Shop all bags";

  return (
    <>
      <TrackProductView product={product} />
      <section className="container py-1 pb-16 sm:py-4 sm:pb-20 md:py-8 md:pb-8">
        <div className="mx-auto mt-1 grid w-full min-w-0 max-w-6xl grid-cols-1 gap-4 px-3 sm:mt-4 sm:gap-8 sm:px-4 md:px-8 lg:grid-cols-[minmax(0,620px)_1fr] lg:gap-12">
          {/* Gallery Column with Header */}
          <div className="w-full min-w-0">
            <ShopHeader heading={categoryLabel} showSort={false} />
            <ProductGallery images={allImages} productName={product.name} discountPct={pct} />
          </div>

          {/* Details */}
          <div className="w-full min-w-0 pt-1 sm:pt-2 md:pt-0">
            <h1 className="mt-1 break-words font-display text-lg leading-tight sm:text-2xl md:text-4xl">
              {activeProductTitle}
            </h1>

            <div className="mt-1.5 flex items-center gap-2 text-xs sm:mt-2 sm:text-sm">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-3 w-3 sm:h-3.5 sm:w-3.5",
                      i < Math.round(product.rating)
                        ? "fill-kibana-tan text-kibana-tan"
                        : "text-muted-foreground/40",
                    )}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                {product.rating.toFixed(1)} ({product.reviewCount} reviews)
              </span>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2 sm:mt-3">
              <span className="text-lg font-semibold sm:text-xl md:text-2xl">
                {formatINR(product.price)}
              </span>
              {product.compareAtPrice && (
                <span className="text-xs text-muted-foreground line-through sm:text-sm">
                  {formatINR(product.compareAtPrice)}
                </span>
              )}
              {pct > 0 && (
                <span className="bg-emerald-700 px-1 py-0.5 text-[10px] font-semibold text-white sm:px-1.5 sm:text-xs">
                  {pct}% OFF
                </span>
              )}
              {typeof activeStockQty === "number" && (
                <span
                  className={cn(
                    "px-1.5 py-0.5 text-[10px] font-semibold sm:text-xs",
                    activeStockQty > 5
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800",
                  )}
                >
                  Stock: {activeStockQty}
                </span>
              )}
            </div>

            <p className="mt-2 text-xs leading-relaxed text-foreground/75 sm:mt-3 sm:text-sm">
              {activeDescription}
            </p>

            {product.colors.length > 0 && (
              <div className="mt-3 sm:mt-4">
                <p className="mb-1.5 text-[8px] font-medium uppercase tracking-[0.2em] text-muted-foreground sm:mb-2 sm:text-[10px]">
                  Colour —{" "}
                  <span className="capitalize normal-case">
                    {(activeVariant?.slug ?? "").replace(/-/g, " ")}
                  </span>
                </p>
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  {(product.colorVariants ?? []).map((v) => {
                    const activeSlug = color ?? product.colorVariants?.[0]?.slug ?? "";
                    return (
                      <a
                        key={v.color}
                        href={`/shop/${product.slug}?color=${v.slug}`}
                        className={cn(
                          "block h-6 w-6 rounded-full ring-2 ring-offset-2 transition-all hover:ring-kibana-tan sm:h-7 sm:w-7",
                          v.slug === activeSlug ? "ring-kibana-ink" : "ring-transparent",
                        )}
                        style={{ backgroundColor: v.hex || v.color }}
                        title={v.slug.replace(/-/g, " ")}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Add to cart */}
            <div className="mt-4 sm:mt-5">
              <AddToCartButton product={product} />
            </div>

            {/* Delivery & Share */}
            <div className="mt-4 space-y-3 border-t border-border pt-3 sm:mt-5 sm:space-y-4 sm:pt-4">
              <DeliveryCheck />
              <div>
                <h3 className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground sm:mb-2 sm:text-xs">
                  Share Product
                </h3>
                <WhatsAppShare product={product} price={product.price} />
              </div>
            </div>

            {/* Key Features */}
            {activeFeatures.length > 0 && (
              <div className="mt-4 border-t border-border pt-3 sm:mt-5 sm:pt-4">
                <h3 className="mb-2 text-xs font-semibold sm:mb-3 sm:text-sm">Key Features</h3>
                <ul className="grid grid-cols-1 gap-y-1.5 sm:gap-y-2">
                  {activeFeatures.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-3 w-3 shrink-0 text-kibana-camel sm:h-3.5 sm:w-3.5" />
                      <span className="text-[10px] leading-snug text-kibana-ink/70 sm:text-xs">
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Accordions */}
            <div className="mt-4 divide-y divide-border border-t border-border sm:mt-5">
              <details className="group py-3 sm:py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between text-xs font-semibold sm:text-sm">
                  Product Details
                  <svg
                    className="h-3.5 w-3.5 transition-transform group-open:rotate-180 sm:h-4 sm:w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </summary>
                <div className="mt-1 divide-y divide-border">
                  {Object.entries(activeSpecs).map(([label, value]) => (
                    <div key={label} className="flex items-start gap-2 py-2 sm:gap-3 sm:py-2.5">
                      <span className="w-20 shrink-0 text-[10px] font-medium text-kibana-camel sm:w-28 sm:text-xs">
                        {label}
                      </span>
                      <span className="text-[10px] text-foreground/75 sm:text-xs">{value}</span>
                    </div>
                  ))}
                </div>
              </details>
              <details className="group py-3 sm:py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between text-xs font-semibold sm:text-sm">
                  Shipping &amp; Returns
                  <svg
                    className="h-3.5 w-3.5 transition-transform group-open:rotate-180 sm:h-4 sm:w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </summary>
                <div className="mt-2 space-y-1.5 border border-border p-2 sm:mt-3 sm:space-y-2.5 sm:p-4">
                  {[
                    "Free shipping on all orders above ₹999",
                    "Easy returns within 7 days of delivery",
                    "Products must be unused and in original packaging",
                  ].map((line) => (
                    <p
                      key={line}
                      className="flex items-start gap-2 text-[10px] leading-snug text-kibana-ink/70 sm:text-xs"
                    >
                      <span className="mt-0.5 shrink-0 text-kibana-tan">•</span>
                      {line}
                    </p>
                  ))}
                </div>
              </details>
            </div>
          </div>
        </div>
      </section>

      <Suspense fallback={null}>
        <RelatedProducts category={product.category} productId={product.id} />
      </Suspense>
    </>
  );
}
