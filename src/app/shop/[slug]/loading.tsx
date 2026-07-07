export default function ProductLoading() {
  return (
    <section className="container py-1 pb-16 sm:py-4 sm:pb-20 md:py-8 md:pb-8">
      <div className="mx-auto mt-1 grid w-full min-w-0 max-w-6xl grid-cols-1 gap-4 px-3 sm:mt-4 sm:gap-8 sm:px-4 md:px-8 lg:grid-cols-[minmax(0,620px)_1fr] lg:gap-12">
        <div className="w-full min-w-0">
          <div className="mb-2 h-4 w-28 animate-pulse rounded bg-muted sm:mb-3 sm:h-5 sm:w-36" />
          <div className="rounded-lg bg-[#f5f1ed] p-3 sm:p-4 md:p-6">
            <div className="aspect-[8/11] w-full animate-pulse rounded-lg bg-muted" />
          </div>
        </div>
        <div className="w-full min-w-0 pt-1 sm:pt-2 md:pt-0">
          <div className="h-6 w-2/3 animate-pulse rounded bg-muted sm:h-8" />
          <div className="mt-3 h-4 w-1/3 animate-pulse rounded bg-muted" />
          <div className="mt-4 h-5 w-1/4 animate-pulse rounded bg-muted" />
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
