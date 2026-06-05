export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { Check, Star } from "lucide-react";
import { getProducts, getCategories } from "@/lib/server-data";
import { discountPct, formatINR, cn } from "@/lib/utils";
import { ProductGrid } from "@/components/product/product-grid";
import { AddToCartButton } from "./add-to-cart";
import { ProductGallery } from "./product-gallery";
import { DeliveryCheck } from "./delivery-check";
import { WhatsAppShare } from "./whatsapp-share";
import { ShopHeader } from "@/components/shop/shop-header";

export default async function ProductDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ color?: string }>;
}) {
  const { slug } = await params;
  const { color } = await searchParams;
  const products = await getProducts();
  const categories = await getCategories();
  const product = products.find((p) => p.slug === slug);
  if (!product) notFound();

  const activeVariant =
    product.colorVariants?.find((v) => v.slug === color) ??
    product.colorVariants?.[0];
  const primaryImage = activeVariant?.image ?? product.image;
  const galleryImages = activeVariant?.gallery?.length ? activeVariant.gallery : product.gallery ?? [];
  const allImages = [primaryImage, ...galleryImages].filter(Boolean);

  // Per-color content overrides (fall back to product-level if not set per-color)
  const activeDescription = activeVariant?.description || product.description;
  const activeFeatures    = activeVariant?.features?.length ? activeVariant.features : product.features;
  const activeSpecs       = activeVariant?.specs && Object.keys(activeVariant.specs).length
    ? activeVariant.specs
    : product.specs;
  const pct = discountPct(product.price, product.compareAtPrice);
  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);
  const catProductCount = products.filter((p) => p.category === product.category).length;

  return (
    <>
      <section className="container py-1 sm:py-4 md:py-8 pb-16 sm:pb-20 md:pb-8">
        <div className="grid gap-4 sm:gap-8 md:gap-16 grid-cols-1 md:grid-cols-[620px_1fr] mt-1 sm:mt-4 w-full min-w-0 max-w-6xl mx-auto px-3 sm:px-4 md:px-8">
          {/* Gallery Column with Header */}
          <div className="w-full min-w-0">
            <ShopHeader
              heading={categories.find((c) => c.slug === product.category)?.name ?? "Shop all bags"}
              count={catProductCount}
              showSort={false}
            />
            <ProductGallery
              images={allImages}
              productName={product.name}
              discountPct={pct}
            />
          </div>

          {/* Details */}
          <div className="pt-1 sm:pt-2 md:pt-0 w-full min-w-0">
            <h1 className="font-display text-lg sm:text-2xl md:text-4xl mt-1 leading-tight break-words">{product.name}</h1>

            <div className="mt-1.5 sm:mt-2 flex items-center gap-2 text-xs sm:text-sm">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-3 sm:h-3.5 w-3 sm:w-3.5",
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

            <div className="mt-2 sm:mt-3 flex items-center flex-wrap gap-2">
              <span className="text-lg sm:text-xl md:text-2xl font-semibold">{formatINR(product.price)}</span>
              {product.compareAtPrice && (
                <span className="text-xs sm:text-sm text-muted-foreground line-through">
                  {formatINR(product.compareAtPrice)}
                </span>
              )}
              {pct > 0 && (
                <span className="text-[10px] sm:text-xs font-semibold bg-emerald-700 text-white px-1 sm:px-1.5 py-0.5">{pct}% OFF</span>
              )}
            </div>

            <p className="mt-2 sm:mt-3 text-xs sm:text-sm leading-relaxed text-foreground/75">
              {activeDescription}
            </p>

            {product.colors.length > 0 && (
              <div className="mt-3 sm:mt-4">
                <p className="text-[8px] sm:text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground mb-1.5 sm:mb-2">
                  Colour — <span className="normal-case capitalize">{(activeVariant?.slug ?? "").replace(/-/g, " ")}</span>
                </p>
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  {(product.colorVariants ?? []).map((v) => {
                    const activeSlug = color ?? product.colorVariants?.[0]?.slug ?? "";
                    return (
                      <a
                        key={v.color}
                        href={`/shop/${product.slug}?color=${v.slug}`}
                        className={cn(
                          "block h-6 sm:h-7 w-6 sm:w-7 rounded-full ring-2 ring-offset-2 transition-all hover:ring-kibana-tan",
                          v.slug === activeSlug ? "ring-kibana-ink" : "ring-transparent"
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
            <div className="mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-border space-y-3 sm:space-y-4">
              <DeliveryCheck />
              <div>
                <h3 className="text-[10px] sm:text-xs font-semibold mb-1.5 sm:mb-2 uppercase tracking-[0.2em] text-muted-foreground">Share Product</h3>
                <WhatsAppShare product={product} price={product.price} />
              </div>
            </div>

            {/* Key Features */}
            {activeFeatures.length > 0 && (
              <div className="mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-border">
                <h3 className="text-xs sm:text-sm font-semibold mb-2 sm:mb-3">Key Features</h3>
                <ul className="grid grid-cols-1 gap-y-1.5 sm:gap-y-2">
                  {activeFeatures.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="h-3 sm:h-3.5 w-3 sm:w-3.5 mt-0.5 shrink-0 text-kibana-camel" />
                      <span className="text-[10px] sm:text-xs text-kibana-ink/70 leading-snug">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Accordions */}
            <div className="mt-4 sm:mt-5 border-t border-border divide-y divide-border">
              <details className="group py-3 sm:py-4">
                <summary className="flex items-center justify-between cursor-pointer list-none text-xs sm:text-sm font-semibold">
                  Product Details
                  <svg className="h-3.5 sm:h-4 w-3.5 sm:w-4 transition-transform group-open:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </summary>
                <div className="mt-1 divide-y divide-border">
                  {Object.entries(activeSpecs).map(([label, value]) => (
                    <div key={label} className="flex items-start py-2 sm:py-2.5 gap-2 sm:gap-3">
                      <span className="w-20 sm:w-28 shrink-0 text-[10px] sm:text-xs text-kibana-camel font-medium">{label}</span>
                      <span className="text-[10px] sm:text-xs text-foreground/75">{value}</span>
                    </div>
                  ))}
                </div>
              </details>
              <details className="group py-3 sm:py-4">
                <summary className="flex items-center justify-between cursor-pointer list-none text-xs sm:text-sm font-semibold">
                  Shipping &amp; Returns
                  <svg className="h-3.5 sm:h-4 w-3.5 sm:w-4 transition-transform group-open:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </summary>
                <div className="mt-2 sm:mt-3 border border-border p-2 sm:p-4 space-y-1.5 sm:space-y-2.5">
                  {[
                    "Free shipping on all orders above ₹999",
                    "Easy returns within 7 days of delivery",
                    "Products must be unused and in original packaging",
                  ].map((line) => (
                    <p key={line} className="text-[10px] sm:text-xs text-kibana-ink/70 leading-snug flex items-start gap-2">
                      <span className="text-kibana-tan mt-0.5 shrink-0">•</span>
                      {line}
                    </p>
                  ))}
                </div>
              </details>
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="container py-2 sm:py-3 md:py-14 pb-20 sm:pb-8">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] mb-4">
            You may also like
          </h2>
          <ProductGrid products={related} />
        </section>
      )}
    </>
  );
}
