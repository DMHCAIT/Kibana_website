"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest" },
];

export function SortSelect({ current }: { current: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value === "featured") {
      params.delete("sort");
    } else {
      params.set("sort", e.target.value);
    }
    const query = params.toString();
    router.push(`${pathname}${query ? `?${query}` : ""}`);
  };

  return (
    <label className="relative flex min-h-14 cursor-pointer items-center justify-center gap-2 border-x border-border/60 px-5 text-[12px] font-normal uppercase tracking-[0.18em] focus-within:outline focus-within:outline-1 focus-within:outline-offset-[-4px] focus-within:outline-kibana-brown md:px-8">
      <span aria-hidden="true">Sort by</span>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path d="m3 4.5 3 3 3-3" stroke="currentColor" strokeWidth="1" />
      </svg>
      <select
        aria-label="Sort products"
        value={current}
        onChange={handleChange}
        className="absolute inset-0 h-full w-full cursor-pointer text-sm opacity-0"
      >
        {sortOptions.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
