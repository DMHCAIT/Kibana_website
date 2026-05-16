import Link from "next/link";
import { Suspense } from "react";
import { categories as staticCategories } from "@/lib/data";
import { SortSelect } from "@/app/shop/sort-select";
import { cn } from "@/lib/utils";

type Cat = { slug: string; name: string; image: string };

type Props = {
  heading: string;
  count: number;
  activeCat?: string;
  sort?: string;
  showSort?: boolean;
  categories?: Cat[];
};

export function ShopHeader({ heading, count, activeCat, sort = "featured", showSort = true, categories }: Props) {
  const cats = categories ?? staticCategories;
  return (
    <div className="mb-6">
      {/* Title row */}
      <div className="flex items-start justify-between mb-1">
        <h1 className="font-bold uppercase tracking-[0.15em] text-base sm:text-lg">
          {heading}
        </h1>
        {showSort && (
          <Suspense fallback={null}>
            <SortSelect current={sort} />
          </Suspense>
        )}
      </div>

      {/* Product count */}
      <p className="text-xs text-kibana-camel font-medium mb-4">
        {count} {count === 1 ? "product" : "products"}
      </p>

      {/* Category pills */}
      <ul className="flex flex-wrap gap-2 -mx-1 px-1 overflow-x-auto no-scrollbar">
        <li>
          <Link
            href="/shop"
            className={cn(
              "inline-flex items-center border px-4 py-1.5 text-xs font-semibold tracking-widest uppercase",
              !activeCat
                ? "bg-foreground text-background border-foreground"
                : "border-border hover:border-foreground transition-colors",
            )}
          >
            All
          </Link>
        </li>
        {cats.map((c) => (
          <li key={c.slug}>
            <Link
              href={`/shop?cat=${c.slug}`}
              className={cn(
                "inline-flex items-center border px-4 py-1.5 text-xs font-semibold tracking-widest uppercase",
                activeCat === c.slug
                  ? "bg-foreground text-background border-foreground"
                  : "border-border hover:border-foreground transition-colors",
              )}
            >
              {c.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
