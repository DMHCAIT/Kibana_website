import Link from "next/link";
import type { Product } from "@/types/product";
import { ProductCard } from "@/components/product/product-card";
import { homepageVariants, productHref, productInStock } from "@/lib/product-presentation";

export function NewArrivals({ products }: { products: Product[] }) {
  const newProducts = homepageVariants(products, "isNew");

  return (
    <section className="w-full">
      <div className="container py-10 sm:py-12 md:py-16">
        <p className="eyebrow mb-3 text-center">JUST ARRIVED</p>
        <h2 className="section-title">New Arrivals</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-[13px] text-muted-foreground">
          Discover the latest expressions of KIBANA.
        </p>

        {newProducts.length > 0 ? (
          <div className="storefront-stack-margin grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 lg:grid-cols-4 lg:gap-x-6">
            {newProducts.map(({ product, variant }, i) => (
              <div
                key={`${product.id}-${variant.slug}`}
                className="animate-fadeUp"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <ProductCard
                  product={product}
                  href={productHref(product, variant)}
                  displayName={variant.productTitle || `${product.name} - ${variant.color}`}
                  displayImage={variant.image}
                  variantKey={`${product.id}-${variant.slug}`}
                  variantInStock={productInStock(product, variant)}
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="py-12 text-center text-muted-foreground">
            No new arrivals available at the moment.
          </p>
        )}

        {newProducts.length > 0 && (
          <div className="mt-10 flex justify-center">
            <Link href="/new-arrivals" className="btn-pill">
              View All New Arrivals
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
