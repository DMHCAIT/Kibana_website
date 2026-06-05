import Link from "next/link";
import { Suspense } from "react";
import { SortSelect } from "@/app/shop/sort-select";

type Props = {
  heading: string;
  count: number;
  sort?: string;
  showSort?: boolean;
};

export function ShopHeader({ heading, count, sort = "featured", showSort = true }: Props) {
  return (
    <div className="mb-2 sm:mb-3 md:mb-4">
      {/* Title row */}
      <div className="flex items-start justify-between mb-1">
        <h1 className="font-bold uppercase tracking-[0.15em] text-xs sm:text-sm md:text-base md:text-lg">
          {heading}
        </h1>
        {showSort && (
          <Suspense fallback={null}>
            <SortSelect current={sort} />
          </Suspense>
        )}
      </div>

      {/* Product count */}
      <p className="text-[10px] sm:text-xs text-kibana-camel font-medium">
        {count} {count === 1 ? "product" : "products"}
      </p>
    </div>
  );
}
