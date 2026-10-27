import { Suspense } from "react";
import type { ReactNode } from "react";
import { SortSelect } from "@/app/shop/sort-select";

type Props = {
  heading: string;
  count?: number;
  sort?: string;
  showSort?: boolean;
  layoutControls?: ReactNode;
};

export function ShopHeader({
  heading,
  count,
  sort = "featured",
  showSort = true,
  layoutControls,
}: Props) {
  return (
    <div>
      <div className="storefront-collection-heading text-center">
        <h1 className="text-foreground">{heading}</h1>
      </div>
      <div className="storefront-collection-toolbar grid grid-cols-[1fr_auto] items-center border-y border-border/60 md:grid-cols-[1fr_auto_1fr]">
        <div className="order-2 flex justify-end md:order-1 md:justify-start">{layoutControls}</div>
        {typeof count === "number" && (
          <p className="hidden text-[12px] uppercase tracking-[0.18em] text-muted-foreground md:order-2 md:block">
            {count} {count === 1 ? "product" : "products"}
          </p>
        )}
        {showSort && (
          <div className="order-1 md:order-3 md:justify-self-end">
            <Suspense fallback={null}>
              <SortSelect current={sort} />
            </Suspense>
          </div>
        )}
      </div>
    </div>
  );
}
