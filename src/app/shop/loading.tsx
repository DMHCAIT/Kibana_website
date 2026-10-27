export default function Loading() {
  return (
    <section
      className="mx-auto w-full max-w-[1920px]"
      aria-label="Loading collection"
      aria-busy="true"
    >
      <div className="storefront-collection-heading flex justify-center">
        <div className="h-7 w-40 animate-pulse bg-muted" />
      </div>
      <div className="storefront-collection-toolbar flex items-center justify-between border-y border-border/60">
        <div className="h-4 w-24 animate-pulse bg-muted" />
        <div className="h-4 w-24 animate-pulse bg-muted" />
      </div>
      <div className="storefront-collection-products grid grid-cols-2 gap-x-2.5 gap-y-8 md:gap-x-6 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index}>
            <div className="aspect-[4/5] w-full animate-pulse bg-muted" />
            <div className="mx-auto mt-4 h-3 w-3/4 animate-pulse bg-muted" />
            <div className="mx-auto mt-2 h-3 w-1/3 animate-pulse bg-muted" />
          </div>
        ))}
      </div>
    </section>
  );
}
