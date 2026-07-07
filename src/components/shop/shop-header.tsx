import { Suspense } from "react";
import { SortSelect } from "@/app/shop/sort-select";

type Props = {
  heading: string;
  count?: number;
  sort?: string;
  showSort?: boolean;
};

export function ShopHeader({ heading, count, sort = "featured", showSort = true }: Props) {
  return (
    <div className="mb-2 sm:mb-3 md:mb-4">
      {/* Title row */}
      <div className="mb-1 flex items-start justify-between">
        <h1 className="text-xs font-bold uppercase tracking-[0.15em] sm:text-sm md:text-base md:text-lg">
          {heading}
        </h1>
        {showSort && (
          <Suspense fallback={null}>
            <SortSelect current={sort} />
          </Suspense>
        )}
      </div>

      {/* Product count */}
      {typeof count === "number" && (
        <p className="text-[10px] font-medium text-kibana-camel sm:text-xs">
          {count} {count === 1 ? "product" : "products"}
        </p>
      )}
    </div>
  );
}
