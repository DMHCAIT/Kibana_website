export default function ProductLoading() {
  return (
    <section
      className="storefront-product mx-auto w-full max-w-[1680px] pb-10 lg:pt-6"
      aria-label="Loading product"
      aria-busy="true"
    >
      <div className="grid min-w-0 grid-cols-1 items-start gap-7 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.95fr)] lg:gap-12 xl:gap-20">
        <div className="w-full min-w-0">
          <div className="aspect-[4/5] w-full animate-pulse bg-muted" />
          <div className="mt-1 hidden grid-cols-2 gap-1 lg:grid">
            <div className="aspect-[4/5] animate-pulse bg-muted" />
            <div className="aspect-[4/5] animate-pulse bg-muted" />
          </div>
        </div>
        <div className="w-full min-w-0 px-5 lg:px-0">
          <div className="h-6 w-2/3 animate-pulse rounded bg-muted sm:h-8" />
          <div className="mt-3 h-4 w-1/3 animate-pulse rounded bg-muted" />
          <div className="mt-4 h-5 w-1/4 animate-pulse rounded bg-muted" />
          <div className="mt-6 flex gap-2">
            <div className="h-20 w-16 animate-pulse bg-muted" />
            <div className="h-20 w-16 animate-pulse bg-muted" />
            <div className="h-20 w-16 animate-pulse bg-muted" />
          </div>
          <div className="mt-6 h-24 animate-pulse bg-muted" />
          <div className="mt-6 h-12 animate-pulse rounded-full bg-muted" />
          <div className="mt-4 space-y-2">
            <div className="h-3 w-full animate-pulse rounded bg-muted" />
            <div className="h-3 w-11/12 animate-pulse rounded bg-muted" />
            <div className="h-3 w-4/5 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </div>
    </section>
  );
}
