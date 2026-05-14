import { notFound } from "next/navigation";
import { Check, Star } from "lucide-react";
import { getProductBySlug, products, categories } from "@/lib/data";
import { discountPct, formatINR, cn } from "@/lib/utils";
import { ProductGrid } from "@/components/product/product-grid";
import { AddToCartButton } from "./add-to-cart";
import { ProductGallery } from "./product-gallery";
import { DeliveryCheck } from "./delivery-check";
import { ShopHeader } from "@/components/shop/shop-header";

export async function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const allImages = [product.image, ...(product.gallery ?? [])].filter(Boolean);
  const pct = discountPct(product.price, product.compareAtPrice);
  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);
  const catProductCount = products.filter((p) => p.category === product.category).length;

  return (
    <>
      <section className="container py-2 md:py-8 pb-24 md:pb-8">
        <ShopHeader
          heading={categories.find((c) => c.slug === product.category)?.name ?? "Shop all bags"}
          count={catProductCount}
          activeCat={product.category}
          showSort={false}
        />

        <div className="grid gap-4 sm:gap-8 md:gap-10 sm:grid-cols-2 mt-1 sm:mt-4 w-full min-w-0">
          {/* Gallery */}
          <div className="w-full min-w-0">
          <ProductGallery
            images={allImages}
            productName={product.name}
            discountPct={pct}
          />
          </div>

          {/* Details */}
          <div className="pt-2 sm:pt-0 w-full min-w-0">
            <p className="text-[10px] tracking-[0.3em] uppercase text-kibana-camel">
              {product.category.replace("-", " ")}
            </p>
            <h1 className="font-display text-xl sm:text-3xl md:text-4xl mt-1 leading-tight break-words">{product.name}</h1>

            <div className="mt-2 flex items-center gap-2 text-sm">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-3.5 w-3.5",
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

            <div className="mt-3 flex items-center flex-wrap gap-2">
              <span className="text-xl sm:text-2xl font-semibold">{formatINR(product.price)}</span>
              {product.compareAtPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatINR(product.compareAtPrice)}
                </span>
              )}
              {pct > 0 && (
                <span className="text-xs font-semibold bg-emerald-700 text-white px-1.5 py-0.5">{pct}% OFF</span>
              )}
            </div>

            <p className="mt-3 text-sm leading-relaxed text-foreground/75">
              {product.description}
            </p>

            {product.colors.length > 0 && (
              <div className="mt-4">
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground mb-2">
                  Colour
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  {(product.colorVariants && product.colorVariants.length > 1
                    ? product.colorVariants.map((v) => ({ color: v.color, slug: v.slug }))
                    : product.colors.map((c) => ({ color: c, slug: product.slug }))
                  ).map((item) => (
                    <a
                      key={item.color}
                      href={`/shop/${item.slug}`}
                      className={cn(
                        "block h-7 w-7 rounded-full ring-2 ring-offset-2 transition-all hover:ring-kibana-tan",
                        item.slug === product.slug ? "ring-kibana-ink" : "ring-transparent"
                      )}
                      style={{ backgroundColor: item.color }}
                      title={item.color}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Add to cart */}
            <div className="mt-5">
              <AddToCartButton product={product} />
            </div>

            {/* Delivery check */}
            <div className="mt-5 pt-4 border-t border-border">
              <DeliveryCheck />
            </div>

            {/* Key Features */}
            {product.features.length > 0 && (
              <div className="mt-5 pt-4 border-t border-border">
                <h3 className="text-sm font-semibold mb-3">Key Features</h3>
                <ul className="grid grid-cols-1 gap-y-2">
                  {product.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="h-3.5 w-3.5 mt-0.5 shrink-0 text-kibana-camel" />
                      <span className="text-xs text-kibana-ink/70 leading-snug">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Accordions */}
            <div className="mt-5 border-t border-border divide-y divide-border">
              <details className="group py-4">
                <summary className="flex items-center justify-between cursor-pointer list-none text-sm font-semibold">
                  Product Details
                  <svg className="h-4 w-4 transition-transform group-open:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </summary>
                <div className="mt-1 divide-y divide-border">
                  {Object.entries(product.specs).map(([label, value]) => (
                    <div key={label} className="flex items-start py-2.5 gap-3">
                      <span className="w-28 shrink-0 text-xs text-kibana-camel font-medium">{label}</span>
                      <span className="text-xs text-foreground/75">{value}</span>
                    </div>
                  ))}
                </div>
              </details>
              <details className="group py-4">
                <summary className="flex items-center justify-between cursor-pointer list-none text-sm font-semibold">
                  Shipping &amp; Returns
                  <svg className="h-4 w-4 transition-transform group-open:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </summary>
                <div className="mt-3 border border-border p-4 space-y-2.5">
                  {[
                    "Free shipping on all orders above ₹999",
                    "Easy returns within 7 days of delivery",
                    "Products must be unused and in original packaging",
                  ].map((line) => (
                    <p key={line} className="text-xs text-kibana-ink/70 leading-snug flex items-start gap-2">
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
        <section className="container py-6 md:py-14 pb-20 sm:pb-8">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] mb-4">
            You may also like
          </h2>
          <ProductGrid products={related} />
        </section>
      )}
    </>
  );
}
