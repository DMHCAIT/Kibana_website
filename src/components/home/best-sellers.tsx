import Link from "next/link";
import type { Product } from "@/types/product";
import { ProductCard } from "@/components/product/product-card";
import { SectionHeading } from "./section-heading";
import { homepageVariants, productHref, productInStock } from "@/lib/product-presentation";

type BestSellersConfig = {
  leftImage?: string;
  rightImage?: string;
  heading?: string;
  buttonText?: string;
  productSlug?: string;
};

export function BestSellers({
  products = [],
}: {
  products?: Product[];
  config?: BestSellersConfig;
}) {
  const bestSellerProducts = homepageVariants(products, "isBestSeller");

  return (
    <section className="w-full">
      <div className="container py-10 sm:py-12 md:py-16">
        <SectionHeading title="Best Sellers" />

        {bestSellerProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 lg:grid-cols-4 lg:gap-x-6">
            {bestSellerProducts.map(({ product, variant }) => (
              <ProductCard
                key={`${product.id}-${variant.slug}`}
                product={product}
                href={productHref(product, variant)}
                displayName={variant.productTitle || `${product.name} - ${variant.color}`}
                displayImage={variant.image}
                variantKey={`${product.id}-${variant.slug}`}
                variantInStock={productInStock(product, variant)}
              />
            ))}
          </div>
        ) : (
          <p className="py-12 text-center text-muted-foreground">
            No best sellers available at the moment.
          </p>
        )}

        <div className="mt-10 flex justify-center">
          <Link href="/shop" className="btn-pill">
            View All
          </Link>
        </div>
      </div>
    </section>
  );
}
