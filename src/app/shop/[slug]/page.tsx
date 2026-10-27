import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";
import { Calendar, Check, ChevronDown, FileText, RotateCcw, Star, Truck } from "lucide-react";
import Image from "@/components/ui/image";
import { getProductBySlug, getProductsByCategory } from "@/lib/server-data";
import { discountPct, formatINR, cn } from "@/lib/utils";
import { pickDefaultProductImage, getShopDisplayImage } from "@/lib/product-images";
import { ProductCarousel } from "@/components/product/product-carousel";
import { AddToCartButton } from "./add-to-cart";
import { ProductGallery } from "./product-gallery";
import { DeliveryCheck } from "./delivery-check";
import { EstimatedDelivery } from "./estimated-delivery";
import { TrackProductView } from "@/components/analytics/track-product-view";
import type { Product } from "@/types/product";
import { productHref, productInStock, DEFAULT_SHIPPING_RETURNS } from "@/lib/product-presentation";

export const revalidate = 300;

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
  const variant =
    product.colorVariants.find((item) => item.pageSlug === slug) ?? product.colorVariants[0];
  const canonical = productHref(
    product,
    product.colorVariants.find((item) => item.pageSlug === slug),
  );
  return {
    title: `${variant?.productTitle || product.name} | Kibana`,
    description: variant?.description ?? product.description,
    alternates: { canonical },
    openGraph: {
      title: `${variant?.productTitle || product.name} | Kibana`,
      description: variant?.description ?? product.description,
      type: "website",
      url: canonical,
      images: [{ url: variant?.image || product.image }],
    },
  };
}

async function RelatedProducts({
  category,
  productId,
  currentProduct,
}: {
  category: Product["category"];
  productId: string;
  currentProduct: Product;
}) {
  const related = await getProductsByCategory(category, productId);
  const productsToShow = related.length > 0 ? related : [currentProduct];
  const items = productsToShow.flatMap((product) =>
    product.colorVariants.length
      ? product.colorVariants.map((variant) => ({
          key: `${product.id}-${variant.slug}`,
          product,
          href: productHref(product, variant),
          displayName: variant.productTitle || `${product.name} - [${variant.slug}]`,
          displayImage: getShopDisplayImage(product, variant),
          variantInStock: productInStock(product, variant),
        }))
      : [{ key: product.id, product, href: `/shop/${product.slug}` }],
  );
  return (
    <section
      className="container pb-16 pt-10 md:pb-20 md:pt-16"
      aria-labelledby="related-products-heading"
    >
      <h2
        id="related-products-heading"
        className="mb-8 text-center text-lg tracking-[0.18em] md:mb-12 md:text-2xl"
      >
        Related Products
      </h2>
      <ProductCarousel items={items} />
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
    product.colorVariants.find((variant) => variant.pageSlug === slug) ??
    product.colorVariants.find((variant) => variant.slug === color) ??
    product.colorVariants[0];
  const title = activeVariant?.productTitle || product.name;
  const inStock = productInStock(product, activeVariant);
  const stockQty = activeVariant?.stockQty;
  const gallery = activeVariant ? (activeVariant.gallery ?? []) : product.gallery;
  const primaryImage = activeVariant
    ? getShopDisplayImage(product, activeVariant)
    : pickDefaultProductImage(product.image, gallery);
  const images = Array.from(new Set([primaryImage, ...gallery].filter(Boolean)));
  const description = activeVariant?.description ?? product.description;
  const features = activeVariant?.features ?? product.features;
  const specs = activeVariant?.specs ?? product.specs;
  const price = activeVariant?.price ?? product.price;
  const compareAtPrice =
    activeVariant?.price === undefined ? product.compareAtPrice : activeVariant.compareAtPrice;
  const pct = discountPct(price, compareAtPrice);
  const summaryClass =
    "flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 py-5 text-[11px] font-medium uppercase tracking-[0.12em] [&::-webkit-details-marker]:hidden";

  return (
    <>
      <TrackProductView product={product} variant={activeVariant} />
      <section className="storefront-product mx-auto w-full max-w-[1680px] pb-10 lg:pt-6">
        <div className="grid min-w-0 grid-cols-1 items-start gap-7 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.95fr)] lg:gap-12 xl:gap-20">
          <ProductGallery
            key={`${product.id}-${activeVariant?.slug ?? "default"}`}
            images={images}
            productName={title}
            discountPct={pct}
            variantInStock={inStock}
          />

          <div className="min-w-0 px-5 lg:sticky lg:top-24 lg:px-0">
            <h1 className="storefront-product-title break-words">{title}</h1>

            <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm">
              {compareAtPrice && (
                <span className="text-muted-foreground line-through">
                  {formatINR(compareAtPrice)}
                </span>
              )}
              <span className={cn("font-medium", pct > 0 && "text-kibana-sale")}>
                {formatINR(price)}
              </span>
              {pct > 0 && <span className="text-xs text-kibana-sale">{pct}% OFF</span>}
              {inStock && typeof stockQty === "number" && (
                <span className="text-[11px] text-muted-foreground">Stock: {stockQty}</span>
              )}
            </div>

            <a
              href="#product-reviews"
              className="mt-3 inline-flex items-center gap-2 text-[11px] text-muted-foreground"
            >
              <span className="flex gap-0.5" aria-hidden="true">
                {Array.from({ length: 5 }, (_, index) => (
                  <Star
                    key={index}
                    className={cn(
                      "h-3 w-3",
                      index < Math.round(product.rating)
                        ? "fill-kibana-tan text-kibana-tan"
                        : "text-muted-foreground/40",
                    )}
                  />
                ))}
              </span>
              {product.rating.toFixed(1)} ({product.reviewCount} reviews)
            </a>

            <EstimatedDelivery />

            {product.colorVariants.length > 0 && (
              <div className="mt-6">
                <p className="text-xs">
                  Colour: <span className="ml-1 font-medium">{activeVariant?.color}</span>
                </p>
                <div className="mt-3 flex flex-wrap gap-2.5" aria-label="Product colours">
                  {product.colorVariants.map((variant) => (
                    <Link
                      key={variant.slug}
                      href={productHref(product, variant)}
                      aria-label={`Select ${variant.color}`}
                      aria-current={variant.slug === activeVariant?.slug ? "true" : undefined}
                      className={cn(
                        "relative block h-20 w-16 overflow-hidden border bg-kibana-tile transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
                        variant.slug === activeVariant?.slug
                          ? "border-foreground"
                          : "border-transparent hover:border-foreground/40",
                      )}
                      title={variant.color}
                    >
                      <Image
                        src={variant.image || product.image}
                        alt={variant.color}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                      {!productInStock(product, variant) && (
                        <span className="absolute inset-x-0 bottom-0 bg-white/90 py-0.5 text-center text-[8px] uppercase tracking-wide">
                          Sold Out
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 grid grid-cols-3 gap-3 rounded-sm bg-kibana-tile px-3 py-5">
              {[
                { icon: Truck, label: "Free Shipping" },
                { icon: Calendar, label: "Delivery within 4 days" },
                { icon: RotateCcw, label: "Easy Returns" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-2 text-center">
                  <Icon className="h-6 w-6" strokeWidth={1.1} aria-hidden="true" />
                  <span className="text-[10px] leading-relaxed">{label}</span>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <AddToCartButton
                key={activeVariant?.slug ?? product.id}
                product={product}
                activeVariantSlug={activeVariant?.slug}
              />
            </div>

            <div className="mt-7">
              <DeliveryCheck />
            </div>

            {features.length > 0 && (
              <div className="mt-8">
                <h2 className="text-sm font-medium tracking-[0.08em]">Key Features</h2>
                <ul className="mt-3 grid gap-x-5 gap-y-2 sm:grid-cols-2">
                  {features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-xs leading-relaxed text-foreground/80"
                    >
                      <Check
                        className="mt-0.5 h-3.5 w-3.5 shrink-0"
                        strokeWidth={1.4}
                        aria-hidden="true"
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-7 divide-y divide-border border-y border-border">
              <details className="group">
                <summary className={summaryClass}>
                  <span className="flex items-center gap-3">
                    <FileText className="h-4 w-4" strokeWidth={1.2} />
                    Description
                  </span>
                  <ChevronDown
                    className="h-4 w-4 transition-transform group-open:rotate-180"
                    aria-hidden="true"
                  />
                </summary>
                <p className="whitespace-pre-line pb-6 text-xs leading-7 text-muted-foreground">
                  {description}
                </p>
              </details>
              <details className="group">
                <summary className={summaryClass}>
                  <span className="flex items-center gap-3">
                    <FileText className="h-4 w-4" strokeWidth={1.2} />
                    Product Details
                  </span>
                  <ChevronDown
                    className="h-4 w-4 transition-transform group-open:rotate-180"
                    aria-hidden="true"
                  />
                </summary>
                <dl className="divide-y divide-border pb-5">
                  {Object.entries(specs).map(([label, value]) => (
                    <div
                      key={label}
                      className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] gap-4 py-3 text-xs leading-relaxed"
                    >
                      <dt className="font-medium">{label}</dt>
                      <dd className="whitespace-pre-line text-muted-foreground">{value}</dd>
                    </div>
                  ))}
                </dl>
              </details>
              <details className="group">
                <summary className={summaryClass}>
                  <span className="flex items-center gap-3">
                    <RotateCcw className="h-4 w-4" strokeWidth={1.2} />
                    Shipping &amp; Returns
                  </span>
                  <ChevronDown
                    className="h-4 w-4 transition-transform group-open:rotate-180"
                    aria-hidden="true"
                  />
                </summary>
                <p className="whitespace-pre-line pb-6 text-xs leading-relaxed text-muted-foreground">
                  {activeVariant?.shippingReturns ??
                    product.shippingReturns ??
                    DEFAULT_SHIPPING_RETURNS}
                </p>
              </details>
            </div>
          </div>
        </div>
      </section>

      <section
        id="product-reviews"
        className="container scroll-mt-28 border-t border-border py-10 text-center md:py-14"
        aria-labelledby="product-reviews-heading"
      >
        <h2 id="product-reviews-heading" className="text-base font-medium tracking-[0.08em]">
          Customer Reviews
        </h2>
        <div className="mt-4 flex justify-center gap-1" aria-hidden="true">
          {Array.from({ length: 5 }, (_, index) => (
            <Star
              key={index}
              className={cn(
                "h-4 w-4",
                index < Math.round(product.rating)
                  ? "fill-kibana-tan text-kibana-tan"
                  : "text-muted-foreground/40",
              )}
            />
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {product.rating.toFixed(1)} / 5 ({product.reviewCount} reviews)
        </p>
      </section>

      <Suspense fallback={null}>
        <RelatedProducts
          category={product.category}
          productId={product.id}
          currentProduct={product}
        />
      </Suspense>
    </>
  );
}
